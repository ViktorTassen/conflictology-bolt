import { ActionContext, ActionHandler, ActionResponse, ActionResult } from './types';
import { CardType } from '../types';

export const foreignAidAction: ActionHandler = {
  execute: async ({ game, player, playerId }) => {
    const result: ActionResult = {
      logs: [{
        type: 'foreign-aid',
        player: player.name,
        playerColor: player.color,
        timestamp: Date.now()
      }],
      actionInProgress: {
        type: 'foreign-aid',
        player: playerId,
        responseDeadline: Date.now() + 10000,
        responses: {},
        resolved: false
      }
    };

    return result;
  },

  respond: async ({ game, player, playerId }, response: ActionResponse) => {
    if (!game.actionInProgress) return {};

    const actionPlayer = game.players[game.actionInProgress.player];
    const result: ActionResult = {};
    
    // Only include card in responses if it's provided
    const responseData = response.card 
      ? { type: response.type, card: response.card }
      : { type: response.type };
      
    const updatedResponses = {
      ...game.actionInProgress.responses,
      [playerId]: responseData
    };

    // Handle losing influence after a challenge
    if (response.type === 'lose_influence') {
      const updatedPlayers = [...game.players];
      const playerInfluence = updatedPlayers[playerId].influence;
      
      if (response.card !== undefined) {
        playerInfluence[response.card].revealed = true;
      }

      result.logs = [{
        type: 'lose-influence',
        player: player.name,
        playerColor: player.color,
        timestamp: Date.now()
      }];

      // If this was the blocking player losing influence after a failed block
      if (game.actionInProgress.blockingPlayer === playerId) {
        // Original player gets Foreign Aid
        updatedPlayers[game.actionInProgress.player].coins += 2;
        result.logs.push({
          type: 'foreign-aid',
          player: actionPlayer.name,
          playerColor: actionPlayer.color,
          coins: 2,
          timestamp: Date.now()
        });
      }

      result.players = updatedPlayers;
      result.actionInProgress = null;
      result.currentTurn = (game.currentTurn + 1) % game.players.length;
      return result;
    }

    // Handle block with Duke
    if (response.type === 'block' && response.card === 'Duke') {
      result.logs = [{
        type: 'block',
        player: player.name,
        playerColor: player.color,
        target: actionPlayer.name,
        targetColor: actionPlayer.color,
        card: 'Duke',
        timestamp: Date.now()
      }];

      result.actionInProgress = {
        ...game.actionInProgress,
        blockingPlayer: playerId,
        blockingCard: 'Duke',
        responses: updatedResponses
      };

      return result;
    } 
    // Handle allow responses
    else if (response.type === 'allow') {
      result.actionInProgress = {
        ...game.actionInProgress,
        responses: updatedResponses
      };

      // If this is accepting a block
      if (game.actionInProgress.blockingPlayer !== undefined) {
        const blockingPlayer = game.players[game.actionInProgress.blockingPlayer];
        
        // If the original player accepts the block
        if (playerId === game.actionInProgress.player) {
          result.logs = [{
            type: 'allow',
            player: player.name,
            playerColor: player.color,
            target: blockingPlayer.name,
            targetColor: blockingPlayer.color,
            timestamp: Date.now()
          }];

          result.actionInProgress = null;
          result.currentTurn = (game.currentTurn + 1) % game.players.length;
          return result;
        }
      }

      // Check if all other players have allowed (for initial foreign aid)
      const otherPlayers = game.players.filter(p => p.id !== game.actionInProgress!.player + 1);
      const allResponded = otherPlayers.every(p => 
        updatedResponses[p.id - 1] && updatedResponses[p.id - 1].type === 'allow'
      );

      if (allResponded) {
        // All players allowed - complete Foreign Aid
        const updatedPlayers = [...game.players];
        updatedPlayers[game.actionInProgress.player].coins += 2;

        result.logs = [{
          type: 'foreign-aid',
          player: actionPlayer.name,
          playerColor: actionPlayer.color,
          coins: 2,
          timestamp: Date.now()
        }];

        result.players = updatedPlayers;
        result.actionInProgress = null;
        result.currentTurn = (game.currentTurn + 1) % game.players.length;
      }

      return result;
    }
    // Handle challenge of a block
    else if (response.type === 'challenge' && game.actionInProgress.blockingPlayer !== undefined) {
      const blockingPlayer = game.players[game.actionInProgress.blockingPlayer];
      const hasDuke = blockingPlayer.influence.some(i => !i.revealed && i.card === 'Duke');

      if (hasDuke) {
        // Challenge fails, challenger loses influence
        result.logs = [{
          type: 'challenge-fail',
          player: player.name,
          playerColor: player.color,
          target: blockingPlayer.name,
          targetColor: blockingPlayer.color,
          timestamp: Date.now()
        }];

        result.actionInProgress = {
          ...game.actionInProgress,
          losingPlayer: playerId,
          responses: updatedResponses
        };
      } else {
        // Challenge succeeds, blocker loses influence
        result.logs = [{
          type: 'challenge-success',
          player: player.name,
          playerColor: player.color,
          target: blockingPlayer.name,
          targetColor: blockingPlayer.color,
          timestamp: Date.now()
        }];

        result.actionInProgress = {
          ...game.actionInProgress,
          losingPlayer: game.actionInProgress.blockingPlayer,
          responses: updatedResponses
        };
      }

      return result;
    }

    return result;
  }
};