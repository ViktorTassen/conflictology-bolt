import { ActionContext, ActionHandler, ActionResponse, ActionResult, createLog, advanceToNextTurn } from './types';
import { GameMessages } from '../messages';

export const incomeAction: ActionHandler = {
  execute: async ({ game, player, playerId }) => {
    // Check if player is eliminated
    if (player.eliminated) {
      throw new Error('Eliminated players cannot perform actions');
    }

    // Perform income action - add 1 coin to player
    const updatedPlayers = [...game.players];
    updatedPlayers[playerId].coins += 1;

    // Get next turn and reset actionUsedThisTurn flag
    const nextTurn = advanceToNextTurn(updatedPlayers, game.currentTurn);

    const result: ActionResult = {
      players: updatedPlayers,
      logs: [
        createLog('income', player, { 
          coins: 1,
          message: GameMessages.results.income
        })
      ],
      ...nextTurn // Spread nextTurn which includes currentTurn and actionUsedThisTurn
    };

    return result;
  },

  // Income has no response phase since it can't be blocked or challenged
  respond: async ({ game, player, playerId }, response: ActionResponse) => {
    return {};
  }
};