import { ActionHandler, ActionResponse, ActionResult, advanceToNextTurn } from './types';
import { GameMessages } from '../messages';
import { cardService } from '../services/CardService';
import { loggingService } from '../services/LoggingService';

export const foreignAidAction: ActionHandler = {
  execute: async ({ game, player, playerId }) => {
    if (player.eliminated) {
      throw new Error('Eliminated players cannot perform actions');
    }

    const result: ActionResult = {
      logs: [loggingService.createLog('foreign-aid', player, {
        message: GameMessages.actions.foreignAid
      })],
      actionInProgress: {
        type: 'foreign-aid',
        player: playerId,
        responses: {},
        resolved: false
      }
    };

    return result;
  },

  respond: async ({ game, player, playerId }, response: ActionResponse) => {
    if (!game.actionInProgress) return {};

    if (player.eliminated) {
      throw new Error('Eliminated players cannot respond to actions');
    }

    const actionPlayer = game.players[game.actionInProgress.player];
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
      if (remainingCards.length === 0) {
        const updatedPlayers = [...game.players];
        updatedPlayers[playerId].eliminated = true;
        result.players = updatedPlayers;
        result.logs.push(loggingService.createSystemLog(GameMessages.system.playerEliminated(player.name)));
      }
      
      if (game.actionInProgress.blockingPlayer !== undefined && 
          playerId === game.actionInProgress.losingPlayer && 
          game.actionInProgress.blockingPlayer !== game.actionInProgress.losingPlayer &&
          game.actionInProgress.challengeDefense) {
        
        const blockingPlayer = game.players[game.actionInProgress.blockingPlayer];
      }

      if (game.actionInProgress.blockingPlayer === playerId) {
        const updatedPlayers = [...game.players];
        updatedPlayers[game.actionInProgress.player].coins += 2;
        
        result.logs.push(loggingService.createLog('foreign-aid', actionPlayer, {
          coins: 2, 
          message: GameMessages.results.foreignAid
        }));
        
        result.players = updatedPlayers;
      }

      result.actionInProgress = null;
      
      const nextTurn = advanceToNextTurn(game.players, game.currentTurn);
      result.currentTurn = nextTurn.currentTurn;
      result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;

      return result;
    }

    if (response.type === 'block' && response.card === 'Duke') {
      result.logs = [loggingService.createLog('block', player, {
        target: actionPlayer.name,
        targetColor: actionPlayer.color,
        card: 'Duke',
        message: GameMessages.blocks.generic('Duke')
      })];

      result.actionInProgress = {
        ...game.actionInProgress,
        blockingPlayer: playerId,
        blockingCard: 'Duke',
        responses: {
          [playerId]: responseData
        }
      };

      return result;
    } 
    
    if (response.type === 'allow') {
      result.actionInProgress = {
        ...game.actionInProgress,
        responses: updatedResponses
      };

      if (game.actionInProgress.blockingPlayer !== undefined) {
        if (playerId === game.actionInProgress.player) {
          result.logs = [loggingService.createLog('allow', player, {
            target: actionPlayer.name,
            targetColor: actionPlayer.color,
            message: GameMessages.responses.allow
          })];

          result.actionInProgress = null;
          
          const nextTurn = advanceToNextTurn(game.players, game.currentTurn);
          result.currentTurn = nextTurn.currentTurn;
          result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
          
          return result;
        }
        
        const otherPlayers = game.players.filter((p, index) => 
          !p.eliminated && 
          index !== game.actionInProgress!.player && 
          index !== game.actionInProgress!.blockingPlayer
        );
        
        const allOtherPlayersResponded = otherPlayers.every(p => {
          const playerIdx = game.players.indexOf(p);
          const hasResponded = updatedResponses[playerIdx] !== undefined;
          return hasResponded;
        });
        
        if (allOtherPlayersResponded) {
          return result;
        }
        
        return result;
      }

      const otherPlayers = game.players.filter((p, index) => 
        index !== game.actionInProgress!.player && !p.eliminated
      );
      
      const allResponded = otherPlayers.every(p => {
        const playerIdx = game.players.indexOf(p);
        const hasResponded = updatedResponses[playerIdx] !== undefined;
        return hasResponded;
      });

      if (allResponded) {
        const anyPlayerBlocked = otherPlayers.some(p => {
          const playerIdx = game.players.indexOf(p);
          const response = updatedResponses[playerIdx];
          return response && response.type === 'block';
        });
        
        if (!anyPlayerBlocked) {
          const updatedPlayers = [...game.players];
          updatedPlayers[game.actionInProgress.player].coins += 2;
  
          result.logs = [loggingService.createLog('foreign-aid', actionPlayer, {
            coins: 2,
            message: GameMessages.results.foreignAid
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