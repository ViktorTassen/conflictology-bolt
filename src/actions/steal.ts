import { ActionHandler, ActionResponse, ActionResult, createLog, advanceToNextLivingPlayer, applyInfluenceLoss, verifyPlayerHasRole, replaceRevealedCard } from './types';
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
    
    const targetPlayer = game.players[game.actionInProgress.target];
    
    // Check if target player is eliminated
    if (targetPlayer.eliminated) {
      throw new Error('Cannot target an eliminated player');
    }

    const result: ActionResult = {
      logs: [createLog('steal', player, {
        target: targetPlayer.name,
        targetColor: targetPlayer.color
      })],
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
    
    // Create response data with card if provided
    const responseData = response.card 
      ? { type: response.type, card: response.card }
      : { type: response.type };
      
    // Update responses
    const updatedResponses = {
      ...game.actionInProgress.responses,
      [playerId]: responseData
    };

    // Handle losing influence after a challenge
    if (response.type === 'lose_influence') {
      const updatedPlayers = [...game.players];
      const updatedGame = {...game, players: updatedPlayers};
      
      // Find card index if a specific card was chosen
      let cardIndex = undefined;
      if (response.card) {
        cardIndex = updatedPlayers[playerId].influence.findIndex(
          i => !i.revealed && i.card === response.card
        );
        // If card not found or already revealed, default to first hidden card
        if (cardIndex === -1) {
          cardIndex = undefined; // Let applyInfluenceLoss find the first hidden card
        }
      }
      
      // Apply influence loss
      const lossResult = applyInfluenceLoss(
        updatedPlayers[playerId], 
        cardIndex,
        updatedPlayers
      );
      
      result.logs = lossResult.logs;
      
      // If the action player was challenged regarding Captain and won
      if (playerId !== game.actionInProgress.player && 
          game.actionInProgress.challengeInProgress && 
          !game.actionInProgress.blockingPlayer &&
          game.actionInProgress.player !== game.actionInProgress.losingPlayer &&
          game.actionInProgress.challengeDefense) {
        
        // Replace the revealed Captain card
        const replaceResult = replaceRevealedCard(
          updatedPlayers[game.actionInProgress.player],
          'Captain',
          updatedGame
        );
        result.logs = result.logs.concat(replaceResult.logs);
      }
      
      // If a blocking player was challenged regarding their blocking card and won
      if (game.actionInProgress.blockingPlayer !== undefined && 
          game.actionInProgress.challengeInProgress && 
          game.actionInProgress.blockingPlayer !== game.actionInProgress.losingPlayer &&
          game.actionInProgress.challengeDefense) {
        
        // If this was the challenger losing influence (failed challenge to blocking card)
        if (playerId === game.actionInProgress.losingPlayer) {
          // Replace the revealed blocking card
          const replaceResult = replaceRevealedCard(
            updatedPlayers[game.actionInProgress.blockingPlayer],
            game.actionInProgress.blockingCard as CardType,
            updatedGame
          );
          result.logs = result.logs.concat(replaceResult.logs);
        }
      }

      // If this was the blocking player losing influence (failed block)
      if (game.actionInProgress.blockingPlayer === playerId) {
        // Successful steal - calculate coins
        const stolenCoins = Math.min(targetPlayer.coins, 2);
        
        // Transfer coins
        updatedPlayers[game.actionInProgress.target ?? 0].coins -= stolenCoins;
        updatedPlayers[game.actionInProgress.player].coins += stolenCoins;
        
        result.logs.push(createLog('steal', actionPlayer, {
          target: targetPlayer.name,
          targetColor: targetPlayer.color,
          coins: stolenCoins,
          message: `steals $${stolenCoins}M from`
        }));
      }
      // If this was the challenger losing influence (failed challenge)
      else if (game.actionInProgress.losingPlayer === playerId && 
               playerId !== game.actionInProgress.player) {
        
        // If this was a challenge to the Captain claim, and target hasn't blocked yet
        if (playerId !== game.actionInProgress.target) {
          // Reset game state to action_response to allow target to block
          result.logs.push(createLog('system', { name: 'System', color: '#9CA3AF' } as any, {
            message: `${targetPlayer.name} may now block with Captain or Ambassador.`
          }));
          
          // Reset state by removing specific properties
          const { losingPlayer, challengeInProgress, ...restActionProps } = game.actionInProgress;
          
          result.actionInProgress = {
            ...restActionProps,
            responses: {} // Clear all responses to allow new response phase
          };
          
          result.players = updatedPlayers;
          return result;
        }
        
        // If target was the one who challenged and lost, proceed with steal
        const stolenCoins = Math.min(targetPlayer.coins, 2);
        
        // Transfer coins
        updatedPlayers[game.actionInProgress.target ?? 0].coins -= stolenCoins;
        updatedPlayers[game.actionInProgress.player].coins += stolenCoins;
        
        result.logs.push(createLog('steal', actionPlayer, {
          target: targetPlayer.name,
          targetColor: targetPlayer.color,
          coins: stolenCoins,
          message: `steals $${stolenCoins}M from`
        }));
      }
      
      // Complete action
      result.players = updatedPlayers;
      result.actionInProgress = null;
      result.currentTurn = advanceToNextLivingPlayer(updatedPlayers, game.currentTurn);
      
      return result;
    }

    // Handle block with Captain or Ambassador
    if (response.type === 'block') {
      console.log('Processing block response with card:', response.card);
      
      // Verify a valid block card is specified
      if (!response.card || (response.card !== 'Captain' && response.card !== 'Ambassador')) {
        console.error('Invalid block card:', response.card);
        throw new Error('Must block with Captain or Ambassador');
      }
      
      // Only the target can block a steal
      if (playerId !== game.actionInProgress.target) {
        throw new Error('Only the target can block a steal');
      }
      
      // Create the block log
      result.logs = [createLog('block', player, {
        target: actionPlayer.name,
        targetColor: actionPlayer.color,
        card: response.card,
        message: `${player.name} blocked stealing with ${response.card}.`
      })];

      // Set up the block in the game state
      result.actionInProgress = {
        ...game.actionInProgress,
        blockingPlayer: playerId,
        blockingCard: response.card,
        responses: {
          [playerId]: responseData
        }
      };

      return result;
    } 

    // Handle challenge to Captain claim
    if (response.type === 'challenge' && game.actionInProgress.blockingPlayer === undefined) {
      const hasCaptain = verifyPlayerHasRole(actionPlayer, 'Captain');

      if (hasCaptain) {
        // Challenge fails, challenger loses influence
        result.logs = [createLog('challenge-fail', player, {
          target: actionPlayer.name,
          targetColor: actionPlayer.color,
          message: `${player.name} challenged ${actionPlayer.name}'s Captain claim and failed.`
        })];

        result.actionInProgress = {
          ...game.actionInProgress,
          losingPlayer: playerId,
          challengeInProgress: true,
          challengeDefense: true, // Flag to indicate the action player successfully defended and needs to replace their card
          responses: updatedResponses
        };
      } else {
        // Challenge succeeds, Captain player loses influence
        result.logs = [createLog('challenge-success', player, {
          target: actionPlayer.name,
          targetColor: actionPlayer.color,
          message: `${player.name} challenged ${actionPlayer.name}'s Captain claim and succeeded.`
        })];

        result.actionInProgress = {
          ...game.actionInProgress,
          losingPlayer: game.actionInProgress.player,
          challengeInProgress: true,
          responses: updatedResponses
        };
      }

      return result;
    }
    // Handle challenge to a block
    else if (response.type === 'challenge' && game.actionInProgress.blockingPlayer !== undefined) {
      const blockingPlayer = game.players[game.actionInProgress.blockingPlayer];
      const blockingCard = game.actionInProgress.blockingCard as CardType;
      const hasCard = verifyPlayerHasRole(blockingPlayer, blockingCard);

      if (hasCard) {
        // Challenge fails, challenger loses influence
        result.logs = [createLog('challenge-fail', player, {
          target: blockingPlayer.name,
          targetColor: blockingPlayer.color,
          message: `${player.name} challenged ${blockingPlayer.name}'s ${blockingCard} claim and failed.`
        })];

        result.actionInProgress = {
          ...game.actionInProgress,
          losingPlayer: playerId,
          challengeInProgress: true,
          challengeDefense: true, // Flag to indicate the blocking player successfully defended and needs to replace their card
          responses: updatedResponses
        };
      } else {
        // Challenge succeeds, blocker loses influence
        result.logs = [createLog('challenge-success', player, {
          target: blockingPlayer.name,
          targetColor: blockingPlayer.color,
          message: `${player.name} challenged ${blockingPlayer.name}'s ${blockingCard} claim and succeeded.`
        })];

        result.actionInProgress = {
          ...game.actionInProgress,
          losingPlayer: game.actionInProgress.blockingPlayer,
          challengeInProgress: true,
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
          result.logs = [createLog('allow', player, {
            target: blockingPlayer.name,
            targetColor: blockingPlayer.color,
            message: `${player.name} accepted the block.`
          })];
          
          result.logs.push(createLog('system', { name: 'System', color: '#9CA3AF' } as any, {
            message: `The steal was blocked.`
          }));

          result.actionInProgress = null;
          result.currentTurn = advanceToNextLivingPlayer(game.players, game.currentTurn);
          
          return result;
        }
        
        // For blocks, only the action player's response matters
        return result;
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
        updatedResponses[p.id - 1] !== undefined
      );

      if (allResponded) {
        // Check if anyone blocked
        const anyPlayerBlocked = Object.values(updatedResponses).some(
          r => r.type === 'block'
        );
        
        if (!anyPlayerBlocked) {
          // All players allowed - complete steal
          const updatedPlayers = [...game.players];
          const targetId = game.actionInProgress.target ?? 0;
          
          // Calculate coins to steal (up to 2)
          const stolenCoins = Math.min(updatedPlayers[targetId].coins, 2);
          
          // Transfer coins
          updatedPlayers[targetId].coins -= stolenCoins;
          updatedPlayers[game.actionInProgress.player].coins += stolenCoins;

          result.logs = [createLog('steal', actionPlayer, {
            target: targetPlayer.name,
            targetColor: targetPlayer.color,
            coins: stolenCoins,
            message: `steals $${stolenCoins}M from`
          })];

          result.players = updatedPlayers;
          result.actionInProgress = null;
          result.currentTurn = advanceToNextLivingPlayer(updatedPlayers, game.currentTurn);
        }
      }

      return result;
    }

    return result;
  }
};