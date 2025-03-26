import { ActionHandler, ActionResponse, ActionResult, createLog, advanceToNextTurn, applyInfluenceLoss } from './types';
import { GameMessages } from '../messages';

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
    
    // Get target player
    const targetPlayer = game.players[game.actionInProgress.target];
    
    // Verify target player isn't eliminated
    if (targetPlayer.eliminated) {
      throw new Error('Cannot target an eliminated player');
    }
    
    // Verify target has influence to lose
    if (!targetPlayer.influence.some(i => !i.revealed)) {
      throw new Error('Target player has no influence to lose');
    }

    // Deduct the 7 coins cost
    const updatedPlayers = [...game.players];
    updatedPlayers[playerId].coins -= 7;

    const result: ActionResult = {
      players: updatedPlayers,
      logs: [createLog('coup', player, {
        target: targetPlayer.name,
        targetColor: targetPlayer.color,
        coins: player.coins >= 10 ? player.coins : undefined,
        message: player.coins >= 10 ? GameMessages.claims.coupWithExcess : GameMessages.claims.coup
      })],
      actionInProgress: {
        type: 'coup',
        player: playerId,
        target: game.actionInProgress.target,
        // Mark target as needing to lose influence immediately
        losingPlayer: game.actionInProgress.target,
        responses: {},
        resolved: false
      }
    };

    return result;
  },

  respond: async ({ game, player, playerId }, response: ActionResponse) => {
    if (!game?.actionInProgress) return {};

    // Check if player is eliminated
    if (player.eliminated) {
      throw new Error('Eliminated players cannot respond to actions');
    }

    const actionPlayer = game.players[game.actionInProgress.player];
    const result: ActionResult = {};

    // Coup can only be responded to by losing influence
    if (response.type === 'lose_influence') {
      // Confirm this is the target player
      if (playerId !== game.actionInProgress.target) {
        throw new Error('Only the target can lose influence from a coup');
      }

      const updatedPlayers = [...game.players];
      
      // Apply influence loss
      const lossResult = applyInfluenceLoss(
        updatedPlayers[playerId], 
        response.card ? updatedPlayers[playerId].influence.findIndex(i => !i.revealed && i.card === response.card) : undefined,
        updatedPlayers
      );
      
      result.logs = lossResult.logs;
      
      // Move to next player's turn
      result.players = updatedPlayers;
      result.actionInProgress = null;
      
      // Get next turn and reset actionUsedThisTurn flag
      const nextTurn = advanceToNextTurn(updatedPlayers, game.currentTurn);
      result.currentTurn = nextTurn.currentTurn;
      result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
    } else {
      // Invalid response type for coup
      throw new Error('Invalid response type for coup action');
    }

    return result;
  }
};