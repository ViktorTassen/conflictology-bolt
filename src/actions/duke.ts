import { ActionContext, ActionHandler, ActionResponse, ActionResult } from './types';

export const dukeAction: ActionHandler = {
  execute: async ({ game, player, playerId }) => {
    // Check if player is eliminated
    if (player.eliminated) {
      throw new Error('Eliminated players cannot perform actions');
    }

    const result: ActionResult = {
      logs: [{
        type: 'tax',
        player: player.name,
        playerColor: player.color,
        timestamp: Date.now()
      }],
      actionInProgress: {
        type: 'duke',
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

    // Check if player is eliminated
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

    // Handle losing influence after a challenge
    if (response.type === 'lose_influence') {
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

      // If this was the challenger losing influence (failed challenge)
      if (game.actionInProgress.losingPlayer === playerId && 
          playerId !== game.actionInProgress.player) {
        // Original player gets tax because challenge failed
        updatedPlayers[game.actionInProgress.player].coins += 3;
        result.logs.push({
          type: 'tax',
          player: actionPlayer.name,
          playerColor: actionPlayer.color,
          coins: 3,
          timestamp: Date.now()
        });
      }
      // If this was the Duke player losing influence (successful challenge)
      // They don't get any coins as they lost the challenge

      result.players = updatedPlayers;
      result.actionInProgress = null;
      
      // Find next valid turn
      let nextTurn = (game.currentTurn + 1) % game.players.length;
      while (updatedPlayers[nextTurn].eliminated) {
        nextTurn = (nextTurn + 1) % game.players.length;
      }
      result.currentTurn = nextTurn;
      
      return result;
    }

    // Handle challenge
    if (response.type === 'challenge') {
      const hasDuke = actionPlayer.influence.some(i => !i.revealed && i.card === 'Duke');

      if (hasDuke) {
        // Challenge fails, challenger loses influence
        result.logs = [{
          type: 'challenge-fail',
          player: player.name,
          playerColor: player.color,
          target: actionPlayer.name,
          targetColor: actionPlayer.color,
          timestamp: Date.now()
        }];

        result.actionInProgress = {
          ...game.actionInProgress,
          losingPlayer: playerId,
          responses: updatedResponses,
          challengeInProgress: true
        };
      } else {
        // Challenge succeeds, Duke player loses influence
        result.logs = [{
          type: 'challenge-success',
          player: player.name,
          playerColor: player.color,
          target: actionPlayer.name,
          targetColor: actionPlayer.color,
          timestamp: Date.now()
        }];

        result.actionInProgress = {
          ...game.actionInProgress,
          losingPlayer: game.actionInProgress.player,
          responses: updatedResponses,
          challengeInProgress: true
        };
      }

      return result;
    }

    // Handle allow responses
    if (response.type === 'allow') {
      result.actionInProgress = {
        ...game.actionInProgress,
        responses: updatedResponses
      };

      // Check if all other non-eliminated players have allowed
      const otherPlayers = game.players.filter((p, index) => 
        index !== game.actionInProgress!.player && !p.eliminated
      );
      const allResponded = otherPlayers.every((p) => {
        // Convert from player index to ID for responses object
        const playerId = p.id - 1;
        return updatedResponses[playerId] && updatedResponses[playerId].type === 'allow';
      });

      if (allResponded) {
        // All players allowed - complete Duke action
        const updatedPlayers = [...game.players];
        updatedPlayers[game.actionInProgress.player].coins += 3;

        result.logs = [{
          type: 'tax',
          player: actionPlayer.name,
          playerColor: actionPlayer.color,
          coins: 3,
          timestamp: Date.now()
        }];

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

    return result;
  }
};