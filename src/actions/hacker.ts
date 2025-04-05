import { ActionHandler, ActionResponse, ActionResult, advanceToNextTurn } from './types';
import { GameMessages } from '../messages';
import { cardService } from '../services/CardService';
import { loggingService } from '../services/LoggingService';

export const hackAction: ActionHandler = { // Kept as hackAction for compatibility
  execute: async ({ game, player, playerId }) => {
    if (player.eliminated) {
      throw new Error('Eliminated players cannot perform actions');
    }

    if (game.actionInProgress?.target === undefined) {
      throw new Error('Hack requires a target');
    }
    
    const targetPlayer = game.players[game.actionInProgress.target];
    
    if (targetPlayer.eliminated) {
      throw new Error('Cannot target an eliminated player');
    }

    if (player.coins < 3) {
      throw new Error('Hack requires 3 coins');
    }

    const updatedPlayers = [...game.players];
    updatedPlayers[playerId].coins -= 3;

    const result: ActionResult = {
      players: updatedPlayers,
      logs: [loggingService.createLog('hack', player, {
        target: targetPlayer.name,
        targetColor: targetPlayer.color,
        message: GameMessages.actions.hack
      })],
      actionInProgress: {
        type: 'hack',
        player: playerId,
        target: game.actionInProgress.target,
        responses: {},
        resolved: false
      }
    };

    return result;
  },

  respond: async ({ game, player, playerId }, response: ActionResponse) => {
    if (!game?.actionInProgress) return {};

    if (player.eliminated) {
      throw new Error('Eliminated players cannot respond to actions');
    }

    const actionPlayer = game.players[game.actionInProgress.player];
    const targetPlayer = game.players[game.actionInProgress.target ?? 0];
    const result: ActionResult = {};
    
    const responseData = response.card 
      ? { type: response.type, card: response.card }
      : { type: response.type };
      
    const updatedResponses = {
      ...game.actionInProgress.responses,
      [playerId]: responseData
    };

    if (response.type === 'lose_influence') {
      const playerCards = cardService.getPlayerCards(game.cards, player.id);
      
      if (playerCards.length === 0) {
        const updatedPlayers = [...game.players];
        updatedPlayers[playerId].eliminated = true;
        
        result.logs = [loggingService.createSystemLog(GameMessages.system.playerEliminated(player.name))];
        result.players = updatedPlayers;
        result.actionInProgress = null;
        
        const nextTurn = advanceToNextTurn(updatedPlayers, game.currentTurn);
        result.currentTurn = nextTurn.currentTurn;
        result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
        
        return result;
      }

      let cardToReveal = response.card ? 
        playerCards.find(c => c.name === response.card) : 
        playerCards[0];

      if (!cardToReveal) {
        cardToReveal = playerCards[0];
      }

      const updatedCards = cardService.revealCard(game.cards, cardToReveal.id);
      result.cards = updatedCards;
      result.logs = [loggingService.createLog('lose-influence', player)];
      
      const remainingCards = cardService.getPlayerCards(updatedCards, player.id);
      
      // Check if this is a player who should lose a second card 
      // (for Hacker action or failed Judge block challenge)
      if (game.actionInProgress.loseTwo && remainingCards.length > 0 && 
          playerId === game.actionInProgress.losingPlayer) {
        
        result.actionInProgress = {
          ...game.actionInProgress,
          // Keep loseTwo flag true until both cards are lost
          responses: {},
        };
        
        // Add message that player needs to lose a second card
        result.logs.push(loggingService.createSystemLog(
          GameMessages.system.secondCardRequired(player.name)
        ));
        
        return result;
      }
      
      if (remainingCards.length === 0) {
        const updatedPlayers = [...game.players];
        updatedPlayers[playerId].eliminated = true;
        result.players = updatedPlayers;
        result.logs.push(loggingService.createSystemLog(GameMessages.system.playerEliminated(player.name)));
      }

      // If this was the second card lost when loseTwo is true, update the flag
      // After a player loses a card due to a failed challenge on a Judge block
      if (game.actionInProgress.challengeDefense && 
          game.actionInProgress.blockingPlayer !== undefined &&
          game.actionInProgress.blockingCard === 'Judge' &&
          playerId === game.actionInProgress.losingPlayer &&
          game.actionInProgress.revealedJudgeCardId) {
        
        // Add the message that the hack was blocked with Judge
        result.logs.push(loggingService.createSpecificSystemLog('hackBlocked', {}));
      }
          
      if (game.actionInProgress.loseTwo && 
          playerId === game.actionInProgress.losingPlayer && 
          !game.actionInProgress.cardsLostCounter) {
        // This was the first card, set counter to 1
        result.actionInProgress = {
          ...game.actionInProgress,
          cardsLostCounter: 1
        };
        
      } else if (game.actionInProgress.loseTwo && 
                 playerId === game.actionInProgress.losingPlayer && 
                 game.actionInProgress.cardsLostCounter === 1) {
        // This was the second card, clear loseTwo flag and counter
        result.actionInProgress = {
          ...game.actionInProgress,
          loseTwo: false,
          cardsLostCounter: undefined
        };
      }

      if (game.actionInProgress.blockingPlayer === playerId) {
        const targetId = game.actionInProgress.target ?? 0;
        
        if (!game.players[targetId].eliminated) {
          result.actionInProgress = {
            ...game.actionInProgress,
            challengeInProgress: false,
            losingPlayer: targetId,
            responses: {}
          };
          
          result.players = game.players;
          return result;
        }
      } 
      else if (game.actionInProgress.losingPlayer === playerId && 
               playerId !== game.actionInProgress.player) {
        
        if (game.actionInProgress.blockingPlayer !== undefined) {
          result.logs.push(loggingService.createSystemLog(GameMessages.system.hackBlocked));
          
          result.actionInProgress = null;
          
          const nextTurn = advanceToNextTurn(game.players, game.currentTurn);
          result.currentTurn = nextTurn.currentTurn;
          result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
          
          return result;
        }
        
        if (playerId !== game.actionInProgress.target) {
          // This is a third-party challenger (not the target) who failed
          // Continue with the action against the original target
          
          // Reset challenges flags and set up for target to lose influence
          const { losingPlayer, challengeDefense, challengeInProgress, loseTwo, ...restActionProps } = game.actionInProgress;
          
          result.actionInProgress = {
            ...restActionProps,
            losingPlayer: game.actionInProgress.target, // Set the target to lose influence
            responses: {}
          };
          
          // Add result message that the hack succeeded
          result.logs.push(loggingService.createLog('hack', actionPlayer, {
            target: targetPlayer.name, 
            targetColor: targetPlayer.color,
            coins: 1, // Any non-zero value to trigger result message
            message: GameMessages.results.hack
          }));
          
          result.players = game.players;
          return result;
        }
      }
      
      result.actionInProgress = null;
      
      const nextTurn = advanceToNextTurn(game.players, game.currentTurn);
      result.currentTurn = nextTurn.currentTurn;
      result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
      
      return result;
    }

    if (response.type === 'block' && response.card === 'Judge') {
      if (playerId !== game.actionInProgress.target) {
        throw new Error('Only the target can block an hack');
      }

      result.logs = [loggingService.createLog('block', player, {
        target: actionPlayer.name,
        targetColor: actionPlayer.color,
        card: 'Judge',
        message: GameMessages.blocks.generic('Judge')
      })];

      result.actionInProgress = {
        ...game.actionInProgress,
        blockingPlayer: playerId,
        blockingCard: 'Judge',
        responses: {
          [playerId]: responseData
        }
      };

      return result;
    } 

    if (response.type === 'challenge' && game.actionInProgress.blockingPlayer === undefined) {
      const hasHacker = cardService.hasCardType(game.cards, actionPlayer.id, 'Hacker');

      if (hasHacker) {
        const hackerCard = game.cards.find(
          c => c.playerId === actionPlayer.id && 
          c.location === 'player' && 
          !c.revealed && 
          c.name === 'Hacker'
        );
        
        if (hackerCard) {
          const updatedCardsWithReveal = cardService.revealCard(game.cards, hackerCard.id);
          const cardsAfterReplacement = cardService.replaceCard(updatedCardsWithReveal, hackerCard.id);
          result.cards = cardsAfterReplacement;
        }
        
        result.logs = [loggingService.createLog('challenge-fail', player, {
          target: actionPlayer.name,
          targetColor: actionPlayer.color,
          card: 'Hacker',
          message: GameMessages.challenges.fail('Hacker')
        })];

        result.actionInProgress = {
          ...game.actionInProgress,
          losingPlayer: playerId,
          challengeInProgress: true,
          challengeDefense: true,
          responses: updatedResponses,
          revealedHackerCardId: hackerCard?.id,
          // Only set loseTwo flag to true if the challenger is the target of the Hacker action
          loseTwo: playerId === game.actionInProgress.target
        };
      } else {
        result.logs = [loggingService.createLog('challenge-success', player, {
          target: actionPlayer.name,
          targetColor: actionPlayer.color,
          card: 'Hacker',
          message: GameMessages.challenges.success('Hacker')
        })];

        result.actionInProgress = {
          ...game.actionInProgress,
          losingPlayer: game.actionInProgress.player,
          challengeInProgress: true,
          responses: updatedResponses
        };
      }

      return result;
    }
    else if (response.type === 'challenge' && game.actionInProgress.blockingPlayer !== undefined) {
      const blockingPlayer = game.players[game.actionInProgress.blockingPlayer];
      const hasJudge = cardService.hasCardType(game.cards, blockingPlayer.id, 'Judge');

      if (hasJudge) {
        const judgeCard = game.cards.find(
          c => c.playerId === blockingPlayer.id && 
          c.location === 'player' && 
          !c.revealed && 
          c.name === 'Judge'
        );
        
        if (judgeCard) {
          const updatedCardsWithReveal = cardService.revealCard(game.cards, judgeCard.id);
          const cardsAfterReplacement = cardService.replaceCard(updatedCardsWithReveal, judgeCard.id);
          result.cards = cardsAfterReplacement;
        }
        
        result.logs = [loggingService.createLog('challenge-fail', player, {
          target: targetPlayer.name,
          targetColor: targetPlayer.color,
          card: 'Judge',
          message: GameMessages.challenges.blockFail('Judge')
        })];

        // Player who challenged Judge and lost only loses one card (not two)
        result.actionInProgress = {
          ...game.actionInProgress,
          losingPlayer: playerId,
          challengeInProgress: true,
          challengeDefense: true,
          responses: updatedResponses,
          revealedJudgeCardId: judgeCard?.id,
          loseTwo: false // Player challenging a legitimate Judge block only loses one card
        };
      } else {
        result.logs = [loggingService.createLog('challenge-success', player, {
          target: targetPlayer.name,
          targetColor: targetPlayer.color,
          card: 'Judge',
          message: GameMessages.challenges.blockSuccess('Judge')
        })];
        
        result.actionInProgress = {
          ...game.actionInProgress,
          losingPlayer: game.actionInProgress.blockingPlayer,
          challengeInProgress: true,
          responses: updatedResponses,
          loseTwo: true // Set loseTwo flag for the player who falsely claimed Judge
        };
      }

      return result;
    }

    if (response.type === 'allow') {
      result.actionInProgress = {
        ...game.actionInProgress,
        responses: updatedResponses
      };

      if (game.actionInProgress.blockingPlayer !== undefined) {
        if (playerId === game.actionInProgress.player) {
          const blockingPlayer = game.players[game.actionInProgress.blockingPlayer];
          
          result.logs = [loggingService.createLog('allow', player, {
            target: blockingPlayer.name,
            targetColor: blockingPlayer.color,
            message: GameMessages.responses.allowBlock
          })];
          
          // Add system message about the hack being blocked
          result.logs.push(loggingService.createSpecificSystemLog('hackBlocked', {}));

          result.actionInProgress = null;
          
          const nextTurn = advanceToNextTurn(game.players, game.currentTurn);
          result.currentTurn = nextTurn.currentTurn;
          result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
          
          return result;
        }
        
        return result;
      }

      const targetHasResponded = updatedResponses[game.actionInProgress.target!] !== undefined;
      
      if (targetHasResponded && updatedResponses[game.actionInProgress.target!].type === 'allow') {
        result.actionInProgress = {
          ...game.actionInProgress,
          losingPlayer: game.actionInProgress.target
        };
        
        result.logs = [loggingService.createLog('allow', targetPlayer, {
          target: actionPlayer.name,
          targetColor: actionPlayer.color,
          actionType: 'hack',
          message: GameMessages.responses.allowHack
        })];
      }

      return result;
    }

    return result;
  }
};