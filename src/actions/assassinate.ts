import { ActionContext, ActionHandler, ActionResponse, ActionResult } from './types';
import { CardType } from '../types';

export const assassinateAction: ActionHandler = {
  execute: async ({ game, player, playerId }) => {
    // Check if player is eliminated
    if (player.eliminated) {
      throw new Error('Eliminated players cannot perform actions');
    }

    // Assassinate requires a target
    if (game.actionInProgress?.target === undefined) {
      throw new Error('Assassinate requires a target');
    }

    // Check if player has enough coins
    if (player.coins < 3) {
      throw new Error('Assassinate requires 3 coins');
    }

    // Deduct the 3 coins cost
    const updatedPlayers = [...game.players];
    updatedPlayers[playerId] = {
      ...updatedPlayers[playerId],
      coins: updatedPlayers[playerId].coins - 3
    };

    const result: ActionResult = {
      players: updatedPlayers,
      logs: [{
        type: 'assassinate',
        player: player.name,
        playerColor: player.color,
        target: game.players[game.actionInProgress.target].name,
        targetColor: game.players[game.actionInProgress.target].color,
        timestamp: Date.now()
      }],
      actionInProgress: {
        type: 'assassinate',
        player: playerId,
        target: game.actionInProgress.target,
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
    const targetPlayer = game.players[game.actionInProgress.target ?? 0];
    const result: ActionResult = {};
    
    const responseData = response.card 
      ? { type: response.type, card: response.card }
      : { type: response.type };
      
    const updatedResponses = {
      ...game.actionInProgress.responses,
      [playerId]: responseData
    };

    // Handle losing influence after a challenge or as a result of assassination
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

      // SPECIAL CASE: If target challenged the Assassin and lost (Scenario 2A)
      if (game.actionInProgress.losingPlayer === playerId && 
          playerId === game.actionInProgress.target && 
          !game.actionInProgress.blockingPlayer) {
        
        // Target loses a second influence card - special case
        if (remainingCards === 1) {
          // Find the last remaining card and eliminate it
          const lastCardIndex = playerInfluence.findIndex(card => !card.revealed);
          if (lastCardIndex !== -1) {
            playerInfluence[lastCardIndex].revealed = true;
            updatedPlayers[playerId].eliminated = true;
            
            result.logs.push({
              type: 'lose-influence',
              player: player.name,
              playerColor: player.color,
              timestamp: Date.now(),
              message: `${player.name} loses a second influence for failing to challenge the Assassin`
            });
            
            result.logs.push({
              type: 'eliminated',
              player: player.name,
              playerColor: player.color,
              timestamp: Date.now(),
              message: `${player.name} has been eliminated!`
            });
          }
        }
      }
      // If this was the blocking player losing influence
      else if (game.actionInProgress.blockingPlayer === playerId) {
        // Contessa block failed, assassinate proceeds
        // Check if target still has influence to lose
        const targetId = game.actionInProgress.target ?? 0;
        
        if (!updatedPlayers[targetId].eliminated) {
          result.logs.push({
            type: 'system',
            player: 'System',
            playerColor: '#9CA3AF',
            timestamp: Date.now(),
            message: `With the Contessa block failed, ${targetPlayer.name} must now lose influence from the assassination`
          });
          
          // Set up for target to lose influence next
          result.actionInProgress = {
            ...game.actionInProgress,
            // Clear blockingPlayer to avoid confusion
            blockingPlayer: undefined,
            blockingCard: undefined,
            // Mark target as needing to lose influence
            losingPlayer: targetId,
            responses: {}
          };
          
          result.players = updatedPlayers;
          return result;
        }
      }
      // If this was the challenger losing influence (failed challenge)
      else if (game.actionInProgress.losingPlayer === playerId && 
               !game.actionInProgress.blockingPlayer) {
        
        // If the challenge to the Assassin claim failed, and it was from a third party
        if (playerId !== game.actionInProgress.target) {
          // Reset game state to allow target to respond with block
          result.logs.push({
            type: 'system',
            player: 'System',
            playerColor: '#9CA3AF',
            timestamp: Date.now(),
            message: `${targetPlayer.name} may now block with Contessa`
          });
          
          // Clear all responses
          result.actionInProgress = {
            ...game.actionInProgress,
            // Clear the challenge record
            losingPlayer: undefined,
            responses: {}
          };
          
          result.players = updatedPlayers;
          return result;
        }
      }

      // If the target is losing influence due to assassination
      if (playerId === game.actionInProgress.target && 
          !game.actionInProgress.losingPlayer && 
          !game.actionInProgress.blockingPlayer) {
        
        result.logs.unshift({
          type: 'assassinate',
          player: actionPlayer.name, 
          playerColor: actionPlayer.color,
          target: targetPlayer.name,
          targetColor: targetPlayer.color,
          timestamp: Date.now(),
          message: `${actionPlayer.name}'s assassination succeeded`
        });
      }

      // Complete the action
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

    // Handle block with Contessa
    if (response.type === 'block' && response.card === 'Contessa') {
      // Only the target can block an assassination
      if (playerId !== game.actionInProgress.target) {
        throw new Error('Only the target can block an assassination');
      }

      result.logs = [{
        type: 'block',
        player: player.name,
        playerColor: player.color,
        target: actionPlayer.name,
        targetColor: actionPlayer.color,
        card: 'Contessa',
        timestamp: Date.now()
      }];

      result.actionInProgress = {
        ...game.actionInProgress,
        blockingPlayer: playerId,
        blockingCard: 'Contessa',
        responses: updatedResponses
      };

      return result;
    } 

    // Handle challenge to the Assassin claim
    if (response.type === 'challenge' && game.actionInProgress.blockingPlayer === undefined) {
      const hasAssassin = actionPlayer.influence.some(i => !i.revealed && i.card === 'Assassin');

      if (hasAssassin) {
        // Challenge fails, challenger loses influence
        result.logs = [{
          type: 'challenge-fail',
          player: player.name,
          playerColor: player.color,
          target: actionPlayer.name,
          targetColor: actionPlayer.color,
          timestamp: Date.now()
        }];

        // SPECIAL CASE: If target challenged the Assassin and lost, they lose both influences
        const specialCase = playerId === game.actionInProgress.target;
        
        result.actionInProgress = {
          ...game.actionInProgress,
          losingPlayer: playerId,
          responses: updatedResponses,
          // Set a flag for the special double influence loss case
          challengeDefense: specialCase
        };
      } else {
        // Challenge succeeds, Assassin player loses influence
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
          responses: updatedResponses
        };
      }

      return result;
    }
    // Handle challenge to a Contessa block
    else if (response.type === 'challenge' && game.actionInProgress.blockingPlayer !== undefined) {
      const blockingPlayer = game.players[game.actionInProgress.blockingPlayer];
      const hasContessa = blockingPlayer.influence.some(i => !i.revealed && i.card === 'Contessa');

      if (hasContessa) {
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

    // Handle allow responses
    if (response.type === 'allow') {
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
          
          // Find next valid turn
          let nextTurn = (game.currentTurn + 1) % game.players.length;
          while (game.players[nextTurn].eliminated) {
            nextTurn = (nextTurn + 1) % game.players.length;
          }
          result.currentTurn = nextTurn;
          
          return result;
        }
      }

      // Check if all other non-eliminated players have allowed
      const otherPlayers = game.players.filter(p => 
        p.id !== game.actionInProgress!.player + 1 && 
        p.id !== (game.actionInProgress!.target ?? -1) + 1 && 
        !p.eliminated
      );
      
      // For targeted actions, target must have responded if no block
      const targetResponded = 
        game.actionInProgress.blockingPlayer !== undefined || 
        game.actionInProgress.target === undefined || 
        updatedResponses[game.actionInProgress.target] !== undefined;
      
      const allResponded = targetResponded && otherPlayers.every(p => 
        updatedResponses[p.id - 1] && updatedResponses[p.id - 1].type === 'allow'
      );

      if (allResponded) {
        // For assassination, set up the target to lose influence
        const updatedPlayers = [...game.players];
        
        // Target loses influence (the actual card loss happens in the lose_influence handler)
        result.logs = [{
          type: 'system',
          player: 'System',
          playerColor: '#9CA3AF',
          timestamp: Date.now(),
          message: `${targetPlayer.name} must lose an influence from assassination`
        }];

        result.players = updatedPlayers;
        result.actionInProgress = {
          ...game.actionInProgress,
          responses: {},  // Clear responses for new phase
          losingPlayer: game.actionInProgress.target 
        };
      }

      return result;
    }

    return result;
  }
};