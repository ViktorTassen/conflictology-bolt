import { ActionContext, ActionHandler, ActionResponse, ActionResult } from './types';
import { CardType } from '../types';

export const foreignAidAction: ActionHandler = {
  execute: async ({ game, player, playerId }) => {
    // Check if player is eliminated
    if (player.eliminated) {
      throw new Error('Eliminated players cannot perform actions');
    }

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

      // If this was the blocking player losing influence after a failed block
      if (game.actionInProgress.blockingPlayer === playerId) {
        // Original player gets Foreign Aid
        updatedPlayers[game.actionInProgress.player].coins += 2;
        result.logs.push({
          type: 'foreign-aid',
          player: actionPlayer.name,
          playerColor: actionPlayer.color,
          coins: 2,
          timestamp: Date.now(),
          message: `With the block failed, ${actionPlayer.name} takes foreign aid (+2 coins).`
        });
      }

      result.players = updatedPlayers;
      result.actionInProgress = null;

      // Find next valid turn (skip eliminated players)
      let nextTurn = (game.currentTurn + 1) % game.players.length;
      while (updatedPlayers[nextTurn].eliminated) {
        nextTurn = (nextTurn + 1) % game.players.length;
      }
      result.currentTurn = nextTurn;

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
        timestamp: Date.now(),
        message: `${player.name} blocked Foreign Aid with Duke.`
      }];

      // Clear previous responses when a block occurs
      // Critical for proper Foreign Aid handling - everyone needs to respond to the block
      const clearResponses = {};
      
      result.actionInProgress = {
        ...game.actionInProgress,
        blockingPlayer: playerId,
        blockingCard: 'Duke',
        responses: {
          [playerId]: responseData  // Only keep the blocker's response
        }
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
        
        // IMPORTANT: If the original player accepts the block, it resolves immediately
        // This is a key rule for Foreign Aid in the core implementation
        if (playerId === game.actionInProgress.player) {
          result.logs = [{
            type: 'allow',
            player: player.name,
            playerColor: player.color,
            target: blockingPlayer.name,
            targetColor: blockingPlayer.color,
            timestamp: Date.now(),
            message: `${player.name} accepted the block.`
          }];
          
          result.logs.push({
            type: 'system',
            player: 'System',
            playerColor: '#9CA3AF',
            timestamp: Date.now(),
            message: `The block succeeded and the Foreign Aid action failed.`
          });

          result.actionInProgress = null;
          
          // Find next valid turn (skip eliminated players)
          let nextTurn = (game.currentTurn + 1) % game.players.length;
          while (game.players[nextTurn].eliminated) {
            nextTurn = (nextTurn + 1) % game.players.length;
          }
          result.currentTurn = nextTurn;
          
          return result;
        }
        
        // If someone other than the action player responded to a block
        // We need to check if all OTHER players have responded
        const otherPlayers = game.players.filter(p => 
          !p.eliminated && 
          p.id !== game.actionInProgress!.player + 1 && 
          p.id !== game.actionInProgress!.blockingPlayer + 1
        );
        
        const allOtherPlayersResponded = otherPlayers.every(p => 
          updatedResponses[p.id - 1] !== undefined
        );
        
        // If all other players have responded, we're just waiting for the action player
        if (allOtherPlayersResponded) {
          // All other players have responded, but we're still waiting for the action player
          // No state change needed yet
          return result;
        }
        
        // Otherwise, continue waiting for other players to respond
        return result;
      }

      // No block yet, handling regular allow responses to the Foreign Aid
      
      // Check if all other non-eliminated players have allowed
      const otherPlayers = game.players.filter(p => 
        p.id !== game.actionInProgress!.player + 1 && !p.eliminated
      );
      
      const allResponded = otherPlayers.every(p => 
        updatedResponses[p.id - 1] !== undefined
      );

      if (allResponded) {
        // Check if anyone blocked
        const anyPlayerBlocked = Object.values(updatedResponses).some(
          r => r.type === 'block'
        );
        
        // If no one blocked, complete Foreign Aid
        if (!anyPlayerBlocked) {
          const updatedPlayers = [...game.players];
          updatedPlayers[game.actionInProgress.player].coins += 2;
  
          result.logs = [{
            type: 'foreign-aid',
            player: actionPlayer.name,
            playerColor: actionPlayer.color,
            coins: 2,
            timestamp: Date.now(),
            message: `${actionPlayer.name} successfully took foreign aid (+2 coins).`
          }];
  
          result.players = updatedPlayers;
          result.actionInProgress = null;
          
          // Find next valid turn (skip eliminated players)
          let nextTurn = (game.currentTurn + 1) % game.players.length;
          while (updatedPlayers[nextTurn].eliminated) {
            nextTurn = (nextTurn + 1) % game.players.length;
          }
          result.currentTurn = nextTurn;
        }
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
          timestamp: Date.now(),
          message: `${player.name} challenged ${blockingPlayer.name}'s Duke claim and failed.`
        }];

        result.actionInProgress = {
          ...game.actionInProgress,
          losingPlayer: playerId,
          responses: updatedResponses
        };
        
        // Add specific message for the Duke block being valid
        result.logs.push({
          type: 'system',
          player: 'System',
          playerColor: '#9CA3AF',
          timestamp: Date.now(),
          message: `${blockingPlayer.name} revealed Duke to prove the block. The Foreign Aid is blocked.`
        });
      } else {
        // Challenge succeeds, blocker loses influence
        result.logs = [{
          type: 'challenge-success',
          player: player.name,
          playerColor: player.color,
          target: blockingPlayer.name,
          targetColor: blockingPlayer.color,
          timestamp: Date.now(),
          message: `${player.name} challenged ${blockingPlayer.name}'s Duke claim and succeeded.`
        }];

        result.actionInProgress = {
          ...game.actionInProgress,
          losingPlayer: game.actionInProgress.blockingPlayer,
          responses: updatedResponses
        };
        
        // Add specific message for the Duke block failing
        result.logs.push({
          type: 'system',
          player: 'System',
          playerColor: '#9CA3AF',
          timestamp: Date.now(),
          message: `${blockingPlayer.name} revealed a card that is not Duke. The block fails.`
        });
      }

      return result;
    }

    return result;
  }
};