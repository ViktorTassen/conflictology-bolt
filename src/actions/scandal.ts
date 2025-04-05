import { ActionHandler, ActionResponse, ActionResult, advanceToNextTurn } from './types';
import { GameMessages } from '../messages';
import { cardService } from '../services/CardService';
import { loggingService } from '../services/LoggingService';

export const scandalAction: ActionHandler = {
  execute: async ({ game, player, playerId }) => {
    if (player.eliminated) {
      throw new Error('Eliminated players cannot perform actions');
    }

    if (game.actionInProgress?.target === undefined) {
      throw new Error('Scandal requires a target');
    }

    if (player.coins < 7) {
      throw new Error('Scandal requires $7M');
    }
    
    const targetPlayerId = game.actionInProgress.target;
    const targetPlayer = game.players[targetPlayerId];
    
    if (!targetPlayer) {
      throw new Error('Target player not found');
    }
    
    if (targetPlayer.eliminated) {
      throw new Error('Cannot target an eliminated player');
    }
    
    const targetId = targetPlayer.id;
    const allTargetCards = cardService.getPlayerCards(game.cards, targetId);
    
    if (!allTargetCards || allTargetCards.length === 0) {
      throw new Error('Target player has no influence to lose');
    }

    const updatedPlayers = [...game.players];
    updatedPlayers[playerId].coins -= 7;

    const result: ActionResult = {
      players: updatedPlayers,
      logs: [loggingService.createLog('scandal', player, {
        target: targetPlayer.name,
        targetColor: targetPlayer.color,
        coins: 7, // Fixed cost of Scandal action
        message: `pays $7M to expose @@TARGET@@ in a ##Scandal##` // Special markers for target and bold
      })],
      actionInProgress: {
        type: 'scandal',
        player: playerId,
        target: targetPlayerId,
        losingPlayer: targetPlayerId,
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

    const result: ActionResult = {};

    if (response.type === 'lose_influence') {
      if (playerId !== game.actionInProgress.target) {
        throw new Error('Only the target can lose influence from a scandal');
      }

      const playerCards = cardService.getPlayerCards(game.cards, player.id);
      
      if (playerCards.length === 0) {
        const updatedPlayers = [...game.players];
        updatedPlayers[playerId].eliminated = true;
        
        result.players = updatedPlayers;
        result.actionInProgress = null;
        result.logs = [loggingService.createSystemLog(GameMessages.system.playerEliminated(player.name))];
        
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
      
      result.actionInProgress = null;
      
      const nextTurn = advanceToNextTurn(game.players, game.currentTurn);
      result.currentTurn = nextTurn.currentTurn;
      result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
    } else {
      throw new Error('Invalid response type for scandal action');
    }

    return result;
  }
};