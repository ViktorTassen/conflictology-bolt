import { ActionHandler, ActionResponse, ActionResult, advanceToNextTurn } from './types';
import { GameMessages } from '../messages';
import { cardService } from '../services/CardService';
import { loggingService } from '../services/LoggingService';

export const assassinateAction: ActionHandler = {
  execute: async ({ game, player, playerId }) => {
    if (player.eliminated) {
      throw new Error('Eliminated players cannot perform actions');
    }

    if (game.actionInProgress?.target === undefined) {
      throw new Error('Assassinate requires a target');
    }
    
    const targetPlayer = game.players[game.actionInProgress.target];
    
    if (targetPlayer.eliminated) {
      throw new Error('Cannot target an eliminated player');
    }

    if (player.coins < 3) {
      throw new Error('Assassinate requires 3 coins');
    }

    const updatedPlayers = [...game.players];
    updatedPlayers[playerId].coins -= 3;

    const result: ActionResult = {
      players: updatedPlayers,
      logs: [loggingService.createLog('assassinate', player, {
        target: targetPlayer.name,
        targetColor: targetPlayer.color,
        message: GameMessages.actions.assassinate
      })],
      actionInProgress: {
        type: 'assassinate',
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
      
      if (game.actionInProgress.loseTwo && remainingCards.length > 0 && 
          playerId === game.actionInProgress.losingPlayer &&
          playerId !== game.actionInProgress.player) {
        
        result.actionInProgress = {
          ...game.actionInProgress,
          loseTwo: false,
          responses: {},
        };
        
        result.logs.push(loggingService.createSystemLog(
          GameMessages.system.secondInfluenceLoss(player.name)
        ));
        
        return result;
      }
      
      if (remainingCards.length === 0) {
        const updatedPlayers = [...game.players];
        updatedPlayers[playerId].eliminated = true;
        result.players = updatedPlayers;
        result.logs.push(loggingService.createSystemLog(GameMessages.system.playerEliminated(player.name)));
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
          result.logs.push(loggingService.createSystemLog(GameMessages.system.assassinationBlocked));
          
          result.actionInProgress = null;
          
          const nextTurn = advanceToNextTurn(game.players, game.currentTurn);
          result.currentTurn = nextTurn.currentTurn;
          result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
          
          return result;
        }
        
        if (playerId !== game.actionInProgress.target) {
          const targetHasContessa = cardService.hasCardType(game.cards, game.actionInProgress.target ?? 0, 'Contessa');
          
          if (targetHasContessa) {
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
      }
      
      result.actionInProgress = null;
      
      const nextTurn = advanceToNextTurn(game.players, game.currentTurn);
      result.currentTurn = nextTurn.currentTurn;
      result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
      
      return result;
    }

    if (response.type === 'block' && response.card === 'Contessa') {
      if (playerId !== game.actionInProgress.target) {
        throw new Error('Only the target can block an assassination');
      }

      result.logs = [loggingService.createLog('block', player, {
        target: actionPlayer.name,
        targetColor: actionPlayer.color,
        card: 'Contessa',
        message: GameMessages.blocks.generic('Contessa')
      })];

      result.actionInProgress = {
        ...game.actionInProgress,
        blockingPlayer: playerId,
        blockingCard: 'Contessa',
        responses: {
          [playerId]: responseData
        }
      };

      return result;
    } 

    if (response.type === 'challenge' && game.actionInProgress.blockingPlayer === undefined) {
      const hasAssassin = cardService.hasCardType(game.cards, actionPlayer.id, 'Assassin');

      if (hasAssassin) {
        const assassinCard = game.cards.find(
          c => c.playerId === actionPlayer.id && 
          c.location === 'player' && 
          !c.revealed && 
          c.name === 'Assassin'
        );
        
        if (assassinCard) {
          const updatedCardsWithReveal = cardService.revealCard(game.cards, assassinCard.id);
          const cardsAfterReplacement = cardService.replaceCard(updatedCardsWithReveal, assassinCard.id);
          result.cards = cardsAfterReplacement;
        }
        
        result.logs = [loggingService.createLog('challenge-fail', player, {
          target: actionPlayer.name,
          targetColor: actionPlayer.color,
          card: 'Assassin',
          message: GameMessages.challenges.fail('Assassin')
        })];

        result.actionInProgress = {
          ...game.actionInProgress,
          losingPlayer: playerId,
          challengeInProgress: true,
          challengeDefense: true,
          responses: updatedResponses,
          revealedAssassinCardId: assassinCard?.id,
          loseTwo: true
        };
      } else {
        result.logs = [loggingService.createLog('challenge-success', player, {
          target: actionPlayer.name,
          targetColor: actionPlayer.color,
          card: 'Assassin',
          message: GameMessages.challenges.success('Assassin')
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
      const hasContessa = cardService.hasCardType(game.cards, blockingPlayer.id, 'Contessa');

      if (hasContessa) {
        const contessaCard = game.cards.find(
          c => c.playerId === blockingPlayer.id && 
          c.location === 'player' && 
          !c.revealed && 
          c.name === 'Contessa'
        );
        
        if (contessaCard) {
          const updatedCardsWithReveal = cardService.revealCard(game.cards, contessaCard.id);
          const cardsAfterReplacement = cardService.replaceCard(updatedCardsWithReveal, contessaCard.id);
          result.cards = cardsAfterReplacement;
        }
        
        result.logs = [loggingService.createLog('challenge-fail', player, {
          target: targetPlayer.name,
          targetColor: targetPlayer.color,
          card: 'Contessa',
          message: GameMessages.challenges.blockFail('Contessa')
        })];

        result.actionInProgress = {
          ...game.actionInProgress,
          losingPlayer: playerId,
          challengeInProgress: true,
          challengeDefense: true,
          responses: updatedResponses,
          revealedContessaCardId: contessaCard?.id
        };
      } else {
        result.logs = [loggingService.createLog('challenge-success', player, {
          target: targetPlayer.name,
          targetColor: targetPlayer.color,
          card: 'Contessa',
          message: GameMessages.challenges.blockSuccess('Contessa')
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
        if (playerId === game.actionInProgress.player) {
          const blockingPlayer = game.players[game.actionInProgress.blockingPlayer];
          
          result.logs = [loggingService.createLog('allow', player, {
            target: blockingPlayer.name,
            targetColor: blockingPlayer.color,
            message: GameMessages.responses.allowBlock
          })];
          
          // Remove the system message about the assassination being blocked

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
          message: GameMessages.responses.allow
        })];
      }

      return result;
    }

    return result;
  }
};