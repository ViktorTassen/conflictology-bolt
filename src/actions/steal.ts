import { ActionContext, ActionHandler, ActionResponse, ActionResult } from './types';
import { CardType } from '../types';

export const stealAction: ActionHandler = {
  execute: async ({ game, player, playerId }) => {
    // Check if player is eliminated
    if (player.eliminated) {
      throw new Error('Eliminated players cannot perform actions');
    }

    // Steal requires a target
    if (game.actionInProgress?.target === undefined) {
      throw new Error('Steal requires a target');
    }

    const result: ActionResult = {
      logs: [{
        type: 'steal',
        player: player.name,
        playerColor: player.color,
        target: game.players[game.actionInProgress.target].name,
        targetColor: game.players[game.actionInProgress.target].color,
        timestamp: Date.now()
      }],
      actionInProgress: {
        type: 'steal',
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

      // If this was the blocking player losing influence (failed block)
      if (game.actionInProgress.blockingPlayer === playerId) {
        // Successful steal - calculate coins
        const stolenCoins = Math.min(targetPlayer.coins, 2);
        
        // Transfer coins
        updatedPlayers[game.actionInProgress.target ?? 0].coins -= stolenCoins;
        updatedPlayers[game.actionInProgress.player].coins += stolenCoins;
        
        result.logs.push({
          type: 'steal',
          player: actionPlayer.name,
          playerColor: actionPlayer.color,
          target: targetPlayer.name,
          targetColor: targetPlayer.color,
          coins: stolenCoins,
          timestamp: Date.now()
        });
      }
      // If this was the challenger losing influence (failed challenge)
      else if (game.actionInProgress.losingPlayer === playerId && 
               playerId !== game.actionInProgress.player) {
        // Resolve the action - either continue to blocking phase or execute the steal
        
        // If this was a challenge to the Captain claim, and target hasn't blocked yet
        if (playerId !== game.actionInProgress.target) {
          // Reset game state to action_response to allow target to block
          result.logs.push({
            type: 'system',
            player: 'System',
            playerColor: '#9CA3AF',
            timestamp: Date.now(),
            message: `${targetPlayer.name} may now block with Captain or Ambassador`
          });
          
          // Clear responses except for challenger who lost
          const filteredResponses = { [playerId]: updatedResponses[playerId] };
          
          result.actionInProgress = {
            ...game.actionInProgress,
            responses: filteredResponses,
            // Clear the challenge state since it's resolved
            losingPlayer: undefined
          };
          
          result.players = updatedPlayers;
          return result;
        }
        
        // If target was the one who challenged and lost, proceed with steal
        const stolenCoins = Math.min(targetPlayer.coins, 2);
        
        // Transfer coins
        updatedPlayers[game.actionInProgress.target ?? 0].coins -= stolenCoins;
        updatedPlayers[game.actionInProgress.player].coins += stolenCoins;
        
        result.logs.push({
          type: 'steal',
          player: actionPlayer.name,
          playerColor: actionPlayer.color,
          target: targetPlayer.name,
          targetColor: targetPlayer.color,
          coins: stolenCoins,
          timestamp: Date.now()
        });
      }
      // If this was the Captain player losing influence (successful challenge)
      // They don't get to steal coins
      
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

    // Handle block with Captain or Ambassador
    if (response.type === 'block' && (response.card === 'Captain' || response.card === 'Ambassador')) {
      result.logs = [{
        type: 'block',
        player: player.name,
        playerColor: player.color,
        target: actionPlayer.name,
        targetColor: actionPlayer.color,
        card: response.card,
        timestamp: Date.now()
      }];

      result.actionInProgress = {
        ...game.actionInProgress,
        blockingPlayer: playerId,
        blockingCard: response.card,
        responses: updatedResponses
      };

      return result;
    } 

    // Handle challenge
    if (response.type === 'challenge') {
      // Handle challenge to Captain claim
      if (game.actionInProgress.blockingPlayer === undefined) {
        const hasCaptain = actionPlayer.influence.some(i => !i.revealed && i.card === 'Captain');

        if (hasCaptain) {
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
            responses: updatedResponses
          };
        } else {
          // Challenge succeeds, Captain player loses influence
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
      // Handle challenge to a block
      else {
        const blockingPlayer = game.players[game.actionInProgress.blockingPlayer];
        const blockingCard = game.actionInProgress.blockingCard as CardType;
        const hasCard = blockingPlayer.influence.some(i => !i.revealed && i.card === blockingCard);

        if (hasCard) {
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
      
      // For targeted actions, target must have responded
      const targetResponded = game.actionInProgress.target === undefined ||
        updatedResponses[game.actionInProgress.target] !== undefined;
      
      const allResponded = targetResponded && otherPlayers.every(p => 
        updatedResponses[p.id - 1] && updatedResponses[p.id - 1].type === 'allow'
      );

      if (allResponded) {
        // All players allowed - complete steal
        const updatedPlayers = [...game.players];
        const targetId = game.actionInProgress.target ?? 0;
        
        // Calculate coins to steal (up to 2)
        const stolenCoins = Math.min(updatedPlayers[targetId].coins, 2);
        
        // Transfer coins
        updatedPlayers[targetId].coins -= stolenCoins;
        updatedPlayers[game.actionInProgress.player].coins += stolenCoins;

        result.logs = [{
          type: 'steal',
          player: actionPlayer.name,
          playerColor: actionPlayer.color,
          target: targetPlayer.name,
          targetColor: targetPlayer.color,
          coins: stolenCoins,
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