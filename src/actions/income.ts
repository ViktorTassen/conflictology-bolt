import { ActionContext, ActionHandler, ActionResult } from './types';

export const incomeAction: ActionHandler = {
  execute: async ({ game, player, playerId }) => {
    // Check if player is eliminated
    if (player.eliminated) {
      throw new Error('Eliminated players cannot perform actions');
    }

    const updatedPlayers = [...game.players];
    updatedPlayers[playerId] = {
      ...updatedPlayers[playerId],
      coins: updatedPlayers[playerId].coins + 1
    };

    // Find next valid turn (skip eliminated players)
    let nextTurn = (game.currentTurn + 1) % game.players.length;
    while (updatedPlayers[nextTurn].eliminated) {
      nextTurn = (nextTurn + 1) % game.players.length;
    }

    const result: ActionResult = {
      players: updatedPlayers,
      logs: [{
        type: 'income',
        player: player.name,
        playerColor: player.color,
        timestamp: Date.now()
      }],
      currentTurn: nextTurn,
      actionInProgress: null,
      responses: {}
    };

    return result;
  },
  respond: async () => {
    // Income cannot be responded to
    return {};
  }
};