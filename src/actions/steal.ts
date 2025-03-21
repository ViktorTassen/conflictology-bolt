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
        
        // Add an explanatory message - no replacement card because player lost influence
        result.logs.push({
          type: 'system',
          player: 'System',
          playerColor: '#9CA3AF',
          timestamp: Date.now() + 1,
          message: `${player.name} loses influence.`
        });
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
          
          // Create a new object without the losingPlayer field
          const { losingPlayer, ...restActionProps } = game.actionInProgress;
          
          result.actionInProgress = {
            ...restActionProps,
            responses: filteredResponses
            // Omitting losingPlayer entirely to avoid Firebase errors
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
      if (playerId === game.actionInProgress.player) {
        // No replacement card for successful challenge - they simply lose influence
        result.logs.push({
          type: 'system',
          player: 'System',
          playerColor: '#9CA3AF',
          timestamp: Date.now(),
          message: `${player.name} was caught bluffing and loses influence.`
        });
      }
      
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
          // The action player needs to reveal their Captain
          
          // Find the Captain card index
          const captainCardIndex = actionPlayer.influence.findIndex(i => !i.revealed && i.card === 'Captain');
          
          if (captainCardIndex !== -1) {
            // Add appropriate logs
            result.logs = [{
              type: 'challenge-fail',
              player: player.name,
              playerColor: player.color,
              target: actionPlayer.name,
              targetColor: actionPlayer.color,
              timestamp: Date.now()
            }];
    
            // Add informative message for all players
            result.logs.push({
              type: 'system',
              player: 'System',
              playerColor: '#9CA3AF',
              timestamp: Date.now() + 1,
              message: `${player.name}'s challenge failed. ${actionPlayer.name} revealed their Captain, which will be shuffled back into the deck. ${player.name} must lose influence.`
            });
            
            // Step 1: Add the revealed Captain back to the deck
            const updatedPlayers = [...game.players];
            const updatedDeck = [...game.deck, 'Captain'];
            
            // Step 2: Shuffle the deck
            updatedDeck.sort(() => Math.random() - 0.5);
            
            // Step 3: Draw a replacement card for the revealed Captain
            if (updatedDeck.length > 0) {
              const newCard = updatedDeck.pop();
              
              // Step 4: Replace the Captain card with the new one
              updatedPlayers[game.actionInProgress.player].influence[captainCardIndex].card = newCard;
              
              result.logs.push({
                type: 'system',
                player: 'System',
                playerColor: '#9CA3AF',
                timestamp: Date.now() + 2,
                message: `${actionPlayer.name} showed Captain and returned it to the deck, drawing a replacement card.`
              });
            } else {
              result.logs.push({
                type: 'system',
                player: 'System',
                playerColor: '#9CA3AF',
                timestamp: Date.now() + 2,
                message: `The deck is empty. ${actionPlayer.name} could not draw a replacement card.`
              });
            }
            
            // Update the deck in the game
            game.deck = updatedDeck;
            result.players = updatedPlayers;
          } else {
            // This should never happen since we checked hasCaptain already
            result.logs = [{
              type: 'challenge-fail',
              player: player.name,
              playerColor: player.color,
              target: actionPlayer.name,
              targetColor: actionPlayer.color,
              timestamp: Date.now()
            }];
          }

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