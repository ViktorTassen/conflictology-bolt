import { ActionContext, ActionHandler, ActionResponse, ActionResult, createLog, advanceToNextLivingPlayer } from './types';
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

    const result: ActionResult = {
      players: updatedPlayers,
      logs: [
        createLog('income', player, { 
          coins: 1,
          message: GameMessages.results.income
        })
      ],
      currentTurn: advanceToNextLivingPlayer(updatedPlayers, game.currentTurn)
    };

    return result;
  },

  // Income has no response phase since it can't be blocked or challenged
  respond: async ({ game, player, playerId }, response: ActionResponse) => {
    return {};
  }
};