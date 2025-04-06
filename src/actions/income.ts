import { ActionHandler, ActionResult, advanceToNextTurn } from './types';
import { GameMessages } from '../messages';
import { loggingService } from '../services/LoggingService';

export const incomeAction: ActionHandler = {
  execute: async ({ game, player, playerId }) => {
    if (player.eliminated) {
      throw new Error('Eliminated players cannot perform actions');
    }

    const updatedPlayers = [...game.players];
    updatedPlayers[playerId].coins += 1;

    const nextTurn = advanceToNextTurn(updatedPlayers, game.currentTurn);

    const result: ActionResult = {
      players: updatedPlayers,
      logs: [
        loggingService.createLog('income', player, { 
          coins: 1,
          message: GameMessages.actions.income,
          playerId: playerId
        })
      ],
      ...nextTurn
    };

    return result;
  },

  respond: async ({  }) => {
    return {};
  }
};