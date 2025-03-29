import { ActionHandler, ActionResponse, ActionResult, advanceToNextTurn } from './types';
import { GameMessages } from '../messages';
import { cardService } from '../services/CardService';
import { loggingService } from '../services/LoggingService';

export const stealAction: ActionHandler = {
  execute: async ({ game, player, playerId }) => {
    if (player.eliminated) {
      throw new Error('Eliminated players cannot perform actions');
    }

    if (game.actionInProgress?.target === undefined) {
      throw new Error('Steal requires a target');
    }
    
    const targetPlayer = game.players[game.actionInProgress.target];
    
    if (targetPlayer.eliminated) {
      throw new Error('Cannot target an eliminated player');
    }

    const result: ActionResult = {
      logs: [loggingService.createLog('steal', player, {
        target: targetPlayer.name,
        targetColor: targetPlayer.color,
        message: GameMessages.claims.steal
      })],
      actionInProgress: {
        type: 'steal',
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
        
        result.logs = [loggingService.createSystemLog(GameMessages.system.noMoreCards(player.name))];
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
      if (remainingCards.length === 0) {
        const updatedPlayers = [...game.players];
        updatedPlayers[playerId].eliminated = true;
        result.players = updatedPlayers;
        result.logs.push(loggingService.createSystemLog(GameMessages.system.noMoreCards(player.name)));
      }

      if (game.actionInProgress.blockingPlayer === playerId) {
        const stolenCoins = Math.min(targetPlayer.coins, 2);
        
        const updatedPlayers = [...game.players];
        updatedPlayers[game.actionInProgress.target ?? 0].coins -= stolenCoins;
        updatedPlayers[game.actionInProgress.player].coins += stolenCoins;
        
        result.logs.push(loggingService.createLog('steal', actionPlayer, {
          target: targetPlayer.name,
          targetColor: targetPlayer.color,
          coins: stolenCoins,
          message: `steals $${stolenCoins}M from`
        }));
        
        result.players = updatedPlayers;
      }
      else if (game.actionInProgress.losingPlayer === playerId && 
               playerId !== game.actionInProgress.player) {
        
        if (game.actionInProgress.blockingPlayer !== undefined) {
          const blockingPlayer = game.players[game.actionInProgress.blockingPlayer];
          
          result.logs.push(loggingService.createSystemLog(GameMessages.system.stealBlocked));
          
          result.actionInProgress = null;
          
          const nextTurn = advanceToNextTurn(game.players, game.currentTurn);
          result.currentTurn = nextTurn.currentTurn;
          result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
          
          return result;
        }
        
        if (playerId !== game.actionInProgress.target) {
          const targetCanBlock = cardService.hasCardType(game.cards, game.actionInProgress.target ?? 0, 'Captain') ||
                                cardService.hasCardType(game.cards, game.actionInProgress.target ?? 0, 'Ambassador') ||
                                cardService.hasCardType(game.cards, game.actionInProgress.target ?? 0, 'Inquisitor');
          
          if (targetCanBlock) {
            result.logs.push(loggingService.createSystemLog(GameMessages.system.blockingOptions(targetPlayer.name)));
          }
          
          const { losingPlayer, challengeDefense, challengeInProgress, ...restActionProps } = game.actionInProgress;
          
          result.actionInProgress = {
            ...restActionProps,
            responses: {}
          };
          
          result.players = game.players;
          return result;
        }
        
        const stolenCoins = Math.min(targetPlayer.coins, 2);
        
        const updatedPlayers = [...game.players];
        updatedPlayers[game.actionInProgress.target ?? 0].coins -= stolenCoins;
        updatedPlayers[game.actionInProgress.player].coins += stolenCoins;
        
        result.logs.push(loggingService.createLog('steal', actionPlayer, {
          target: targetPlayer.name,
          targetColor: targetPlayer.color,
          coins: stolenCoins,
          message: `steals $${stolenCoins}M from`
        }));
        
        result.players = updatedPlayers;
      }
      
      result.actionInProgress = null;
      
      const nextTurn = advanceToNextTurn(game.players, game.currentTurn);
      result.currentTurn = nextTurn.currentTurn;
      result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
      
      return result;
    }

    if (response.type === 'block') {
      if (!response.card || !['Captain', 'Ambassador', 'Inquisitor'].includes(response.card)) {
        throw new Error('Must block with Captain, Ambassador, or Inquisitor');
      }
      
      if (playerId !== game.actionInProgress.target) {
        throw new Error('Only the target can block a steal');
      }
      
      result.logs = [loggingService.createLog('block', player, {
        target: actionPlayer.name,
        targetColor: actionPlayer.color,
        card: response.card,
        message: `claims ${response.card} to block steal`
      })];

      result.actionInProgress = {
        ...game.actionInProgress,
        blockingPlayer: playerId,
        blockingCard: response.card,
        responses: {
          [playerId]: responseData
        }
      };

      return result;
    } 

    if (response.type === 'challenge' && game.actionInProgress.blockingPlayer === undefined) {
      const actionPlayer = game.players[game.actionInProgress.player];
      const hasCaptain = cardService.hasCardType(game.cards, actionPlayer.id, 'Captain');

      if (hasCaptain) {
        const captainCard = game.cards.find(
          c => c.playerId === actionPlayer.id && 
          c.location === 'player' && 
          !c.revealed && 
          c.name === 'Captain'
        );
        
        if (captainCard) {
          const updatedCardsWithReveal = cardService.revealCard(game.cards, captainCard.id);
          const cardsAfterReplacement = cardService.replaceCard(updatedCardsWithReveal, captainCard.id);
          result.cards = cardsAfterReplacement;
        }
        
        result.logs = [loggingService.createLog('challenge-fail', player, {
          target: actionPlayer.name,
          targetColor: actionPlayer.color,
          card: 'Captain',
          message: GameMessages.challenges.failCaptain
        })];

        result.actionInProgress = {
          ...game.actionInProgress,
          losingPlayer: playerId,
          challengeInProgress: true,
          challengeDefense: true,
          responses: updatedResponses,
          revealedCaptainCardId: captainCard?.id
        };
      } else {
        result.logs = [loggingService.createLog('challenge-success', player, {
          target: actionPlayer.name,
          targetColor: actionPlayer.color,
          card: 'Captain',
          message: GameMessages.challenges.succeedCaptain
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
      const blockingCard = game.actionInProgress.blockingCard;
      const hasCard = cardService.hasCardType(game.cards, blockingPlayer.id, blockingCard!);

      if (hasCard) {
        const blockingCardObj = game.cards.find(
          c => c.playerId === blockingPlayer.id && 
          c.location === 'player' && 
          !c.revealed && 
          c.name === blockingCard
        );
        
        if (blockingCardObj) {
          const updatedCardsWithReveal = cardService.revealCard(game.cards, blockingCardObj.id);
          const cardsAfterReplacement = cardService.replaceCard(updatedCardsWithReveal, blockingCardObj.id);
          result.cards = cardsAfterReplacement;
        }
        
        result.logs = [loggingService.createLog('challenge-fail', player, {
          target: blockingPlayer.name,
          targetColor: blockingPlayer.color,
          card: blockingCard,
          message: `challenges ${blockingCard} block! Fails`
        })];

        result.actionInProgress = {
          ...game.actionInProgress,
          losingPlayer: playerId,
          challengeInProgress: true,
          challengeDefense: true,
          responses: updatedResponses,
          revealedBlockingCardId: blockingCardObj?.id
        };
      } else {
        result.logs = [loggingService.createLog('challenge-success', player, {
          target: blockingPlayer.name,
          targetColor: blockingPlayer.color,
          card: blockingCard,
          message: `challenges ${blockingCard} block! Success`
        })];

        result.actionInProgress = {
          ...game.actionInProgress,
          losingPlayer: game.actionInProgress.blockingPlayer,
          challengeInProgress: true,
          responses: updatedResponses
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
        const blockingPlayer = game.players[game.actionInProgress.blockingPlayer];
        
        if (playerId === game.actionInProgress.player) {
          result.logs = [loggingService.createLog('allow', player, {
            target: blockingPlayer.name,
            targetColor: blockingPlayer.color,
            message: GameMessages.responses.allowBlock
          })];
          
          result.logs.push(loggingService.createSystemLog(GameMessages.system.stealBlocked));

          result.actionInProgress = null;
          
          const nextTurn = advanceToNextTurn(game.players, game.currentTurn);
          result.currentTurn = nextTurn.currentTurn;
          result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
          
          return result;
        }
        
        return result;
      }

      if (playerId === game.actionInProgress.target) {
        const updatedPlayers = [...game.players];
        const targetId = game.actionInProgress.target ?? 0;
        
        const stolenCoins = Math.min(updatedPlayers[targetId].coins, 2);
        
        updatedPlayers[targetId].coins -= stolenCoins;
        updatedPlayers[game.actionInProgress.player].coins += stolenCoins;

        result.logs = [loggingService.createLog('allow', player, {
          target: actionPlayer.name,
          targetColor: actionPlayer.color,
          message: GameMessages.responses.allowSteal
        })];

        result.logs.push(loggingService.createLog('steal', actionPlayer, {
          target: targetPlayer.name,
          targetColor: targetPlayer.color,
          coins: stolenCoins,
          message: `steals $${stolenCoins}M from`
        }));

        result.players = updatedPlayers;
        result.actionInProgress = null;
        
        const nextTurn = advanceToNextTurn(updatedPlayers, game.currentTurn);
        result.currentTurn = nextTurn.currentTurn;
        result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
        
        return result;
      }

      const otherPlayers = game.players.filter(p => 
        p.id !== game.actionInProgress!.player + 1 && 
        p.id !== (game.actionInProgress!.target ?? -1) + 1 && 
        !p.eliminated
      );
      
      const targetResponded = game.actionInProgress.target === undefined ||
        updatedResponses[game.actionInProgress.target] !== undefined;
      
      const allResponded = targetResponded && otherPlayers.every(p => 
        updatedResponses[p.id - 1] !== undefined
      );

      if (allResponded) {
        const anyPlayerBlocked = Object.values(updatedResponses).some(
          r => r.type === 'block'
        );
        
        if (!anyPlayerBlocked) {
          const updatedPlayers = [...game.players];
          const targetId = game.actionInProgress.target ?? 0;
          
          const stolenCoins = Math.min(updatedPlayers[targetId].coins, 2);
          
          updatedPlayers[targetId].coins -= stolenCoins;
          updatedPlayers[game.actionInProgress.player].coins += stolenCoins;

          result.logs = [loggingService.createLog('steal', actionPlayer, {
            target: targetPlayer.name,
            targetColor: targetPlayer.color,
            coins: stolenCoins,
            message: `steals $${stolenCoins}M from`
          })];

          result.players = updatedPlayers;
          result.actionInProgress = null;
          
          const nextTurn = advanceToNextTurn(updatedPlayers, game.currentTurn);
          result.currentTurn = nextTurn.currentTurn;
          result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
        }
      }

      return result;
    }

    return result;
  }
};