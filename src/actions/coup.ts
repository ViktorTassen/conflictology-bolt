import { ActionContext, ActionHandler, ActionResponse, ActionResult } from './types';
import { CardType } from '../types';

export const coupAction: ActionHandler = {
  execute: async ({ game, player, playerId }) => {
    // Check if player is eliminated
    if (player.eliminated) {
      throw new Error('Eliminated players cannot perform actions');
    }

    // Coup requires a target
    if (game.actionInProgress?.target === undefined) {
      throw new Error('Coup requires a target');
    }

    // Check if player has enough coins
    if (player.coins < 7) {
      throw new Error('Coup requires 7 coins');
    }

    // Deduct the 7 coins cost and set up for target to lose influence
    const updatedPlayers = [...game.players];
    updatedPlayers[playerId] = {
      ...updatedPlayers[playerId],
      coins: updatedPlayers[playerId].coins - 7
    };

    const targetPlayer = game.players[game.actionInProgress.target];

    const result: ActionResult = {
      players: updatedPlayers,
      logs: [{
        type: 'coup',
        player: player.name,
        playerColor: player.color,
        target: targetPlayer.name,
        targetColor: targetPlayer.color,
        timestamp: Date.now()
      }],
      actionInProgress: {
        type: 'coup',
        player: playerId,
        target: game.actionInProgress.target,
        // Mark target as needing to lose influence immediately
        losingPlayer: game.actionInProgress.target,
        responseDeadline: Date.now() + 10000,
        responses: {},
        resolved: false
      }
    };

    return result;
  },

  respond: async ({ game, player, playerId }, response: ActionResponse) => {
    if (!game.actionInProgress) return {};

    // Check if player is eliminated
    if (player.eliminated) {
      throw new Error('Eliminated players cannot respond to actions');
    }

    const result: ActionResult = {};

    // Coup can only be responded to by losing influence
    if (response.type === 'lose_influence') {
      // Confirm this is the target player
      if (playerId !== game.actionInProgress.target) {
        throw new Error('Only the target can lose influence from a coup');
      }

      const updatedPlayers = [...game.players];
      const playerInfluence = updatedPlayers[playerId].influence;
      
      if (response.card !== undefined) {
        playerInfluence[response.card].revealed = true;
      }

      // Check if player is eliminated
      const remainingCards = playerInfluence.filter(card => !card.revealed).length;
      if (remainingCards === 0) {
        updatedPlayers[playerId].eliminated = true;
        result.logs = [
          {
            type: 'lose-influence',
            player: player.name,
            playerColor: player.color,
            timestamp: Date.now()
          },
          {
            type: 'eliminated',
            player: player.name,
            playerColor: player.color,
            timestamp: Date.now(),
            message: `${player.name} has been eliminated!`
          }
        ];
      } else {
        result.logs = [{
          type: 'lose-influence',
          player: player.name,
          playerColor: player.color,
          timestamp: Date.now()
        }];
      }

      // Move to next player's turn
      result.players = updatedPlayers;
      result.actionInProgress = null;
      
      // Find next valid turn
      let nextTurn = (game.currentTurn + 1) % game.players.length;
      while (updatedPlayers[nextTurn].eliminated) {
        nextTurn = (nextTurn + 1) % game.players.length;
      }
      result.currentTurn = nextTurn;
    }

    return result;
  }
};