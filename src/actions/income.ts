import { ActionContext, ActionHandler, ActionResult } from './types';

export const incomeAction: ActionHandler = {
  execute: async ({ game, player, playerId, transaction }) => {
    const updatedPlayers = [...game.players];
    updatedPlayers[playerId] = {
      ...updatedPlayers[playerId],
      coins: updatedPlayers[playerId].coins + 1
    };

    const result: ActionResult = {
      players: updatedPlayers,
      logs: [{
        type: 'income',
        player: player.name,
        playerColor: player.color,
        timestamp: Date.now()
      }],
      currentTurn: (game.currentTurn + 1) % game.players.length,
      actionInProgress: null,
      responses: {}
    };

    return result;
  },
  respond: async () => {
    // Income cannot be responded to
  }
};