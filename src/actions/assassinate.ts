import { ActionContext, ActionHandler, ActionResponse, ActionResult, createLog, createSystemLog, advanceToNextLivingPlayer, applyInfluenceLoss, verifyPlayerHasRole, replaceRevealedCard } from './types';
import { GameMessages } from '../messages';

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
    
    // Get the target ID from the game state
    const targetId = game.actionInProgress.target;
    const targetPlayer = game.players[targetId];

    // Check if target player is eliminated
    if (targetPlayer.eliminated) {
      throw new Error('Cannot target an eliminated player');
    }

    // Check if player has enough coins
    if (player.coins < 3) {
      throw new Error('Assassinate requires 3 coins');
    }

    // Deduct the 3 coins cost
    const updatedPlayers = [...game.players];
    updatedPlayers[playerId].coins -= 3;

    const result: ActionResult = {
      players: updatedPlayers,
      logs: [createLog('assassinate', player, {
        target: targetPlayer.name,
        targetColor: targetPlayer.color,
        message: GameMessages.claims.assassinate
      })],
      actionInProgress: {
        type: 'assassinate',
        player: playerId,
        target: targetId,
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

      // If the action player was challenged regarding Assassin and won
      if (playerId !== game.actionInProgress.player && 
          game.actionInProgress.challengeInProgress && 
          !game.actionInProgress.blockingPlayer &&
          game.actionInProgress.player !== game.actionInProgress.losingPlayer) {
        
        // Replace the revealed Assassin card
        const replaceResult = replaceRevealedCard(
          updatedPlayers[game.actionInProgress.player],
          'Assassin',
          updatedGame
        );
        result.logs = result.logs.concat(replaceResult.logs);
      }
      
      // If a blocking player was challenged regarding Contessa and won
      if (game.actionInProgress.blockingPlayer !== undefined && 
          game.actionInProgress.challengeInProgress && 
          game.actionInProgress.blockingPlayer !== game.actionInProgress.losingPlayer) {
        
        // If this was the challenger losing influence (failed challenge to Contessa)
        if (playerId === game.actionInProgress.losingPlayer) {
          // Replace the revealed Contessa card
          const replaceResult = replaceRevealedCard(
            updatedPlayers[game.actionInProgress.blockingPlayer],
            'Contessa',
            updatedGame
          );
          result.logs = result.logs.concat(replaceResult.logs);
        }
      }
      
      // SPECIAL CASE: If target challenged the Assassin and lost
      const specialCase = playerId === game.actionInProgress.target && 
                         game.actionInProgress.challengeDefense === true;

      if (specialCase && !lossResult.eliminated) {
        // Target loses a second influence card if they unsuccessfully challenged Assassin
        const secondLoss = applyInfluenceLoss(
          updatedPlayers[playerId],
          undefined,
          updatedPlayers
        );
        
        result.logs.push(...secondLoss.logs);
        if (secondLoss.logs.length > 0) {
          // Use the GameMessages for consistent system messages
          result.logs.push(createSystemLog(GameMessages.system.secondInfluenceLoss(player.name)));
        }
      }

      // If this was the blocking player losing influence after a failed challenge
      if (game.actionInProgress.blockingPlayer === playerId) {
        // Contessa block failed, assassination proceeds
        // Check if target still has influence to lose
        const targetId = game.actionInProgress.target ?? 0;
        
        if (!updatedPlayers[targetId].eliminated) {
          // Use the GameMessages for consistent system messages
          result.logs.push(createSystemLog(GameMessages.system.contessaBlockFailed(targetPlayer.name)));
          
          // Set up for target to lose influence next
          result.actionInProgress = {
            ...game.actionInProgress,
            blockingPlayer: undefined,
            blockingCard: undefined,
            losingPlayer: targetId,
            responses: {}
          };
          
          result.players = updatedPlayers;
          return result;
        }
      } 
      // If this was the challenger losing influence (failed challenge)
      else if (game.actionInProgress.losingPlayer === playerId && 
               playerId !== game.actionInProgress.target &&
               !game.actionInProgress.blockingPlayer) {
        
        // If the challenge to the Assassin claim failed, and it was from a third party
        // Reset game state to allow target to respond with block
        
        // Only show the block message if we haven't already seen the target's Contessa
        // Check if player has already revealed Contessa previously
        const targetHasRevealedContessa = updatedPlayers[game.actionInProgress.target ?? 0].influence
          .some(card => card.revealed && card.card === 'Contessa');
        
        if (!targetHasRevealedContessa) {
          // Use the GameMessages for consistent system messages
          result.logs.push(createSystemLog(GameMessages.system.contessaBlock(targetPlayer.name)));
        }
        
        // Remove losingPlayer field to reset action state
        const { losingPlayer, challengeDefense, challengeInProgress, ...restActionProps } = game.actionInProgress;
        
        // Set up new action state
        result.actionInProgress = {
          ...restActionProps,
          responses: {} // Clear responses
        };
        
        result.players = updatedPlayers;
        return result;
      }

      // If we reach here, we're finishing the assassination action
      // Complete the action
      result.players = updatedPlayers;
      result.actionInProgress = null;
      result.currentTurn = advanceToNextLivingPlayer(updatedPlayers, game.currentTurn);
      
      return result;
    }

    // Handle block with Contessa
    if (response.type === 'block' && response.card === 'Contessa') {
      // Only the target can block an assassination
      if (playerId !== game.actionInProgress.target) {
        throw new Error('Only the target can block an assassination');
      }

      result.logs = [createLog('block', player, {
        target: actionPlayer.name,
        targetColor: actionPlayer.color,
        card: 'Contessa',
        message: `claim Contessa to block Assassin`
      })];

      result.actionInProgress = {
        ...game.actionInProgress,
        blockingPlayer: playerId,
        blockingCard: 'Contessa',
        responses: {
          [playerId]: responseData
        }
      };

      return result;
    } 

    // Handle challenge to the Assassin claim
    if (response.type === 'challenge' && game.actionInProgress.blockingPlayer === undefined) {
      const hasAssassin = verifyPlayerHasRole(actionPlayer, 'Assassin');

      if (hasAssassin) {
        // Challenge fails, challenger loses influence
        result.logs = [createLog('challenge-fail', player, {
          target: actionPlayer.name,
          targetColor: actionPlayer.color,
          card: 'Assassin',
          message: `challenges Assassin claim! Fails`
        })];

        // SPECIAL CASE: If target challenged the Assassin and lost, flag for double influence loss
        const specialCase = playerId === game.actionInProgress.target;
        
        result.actionInProgress = {
          ...game.actionInProgress,
          losingPlayer: playerId,
          challengeInProgress: true,
          challengeDefense: specialCase,
          responses: updatedResponses
        };
      } else {
        // Challenge succeeds, Assassin player loses influence
        result.logs = [createLog('challenge-success', player, {
          target: actionPlayer.name,
          targetColor: actionPlayer.color,
          card: 'Assassin',
          message: `challenges Assassin claim! Success`
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
    // Handle challenge to a Contessa block
    else if (response.type === 'challenge' && game.actionInProgress.blockingPlayer !== undefined) {
      const blockingPlayer = game.players[game.actionInProgress.blockingPlayer];
      const hasContessa = verifyPlayerHasRole(blockingPlayer, 'Contessa');

      if (hasContessa) {
        // Challenge fails, challenger loses influence
        result.logs = [createLog('challenge-fail', player, {
          target: blockingPlayer.name,
          targetColor: blockingPlayer.color,
          card: 'Contessa',
          message: `challenges Contessa block! Fails`
        })];

        result.actionInProgress = {
          ...game.actionInProgress,
          losingPlayer: playerId,
          challengeInProgress: true,
          challengeDefense: true, // Add flag to indicate card should be replaced
          responses: updatedResponses
        };
      } else {
        // Challenge succeeds, blocker loses influence
        result.logs = [createLog('challenge-success', player, {
          target: blockingPlayer.name,
          targetColor: blockingPlayer.color,
          card: 'Contessa',
          message: `challenges Contessa block! Success`
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
            message: `allows Contessa block`
          })];
          
          // Use the GameMessages for consistent system messages
          result.logs.push(createSystemLog(GameMessages.system.assassinationBlocked));

          result.actionInProgress = null;
          result.currentTurn = advanceToNextLivingPlayer(game.players, game.currentTurn);
          
          return result;
        }
        
        // For blocks, only the action player's response matters
        return result;
      }

      // For normal assassination (no block), check if target has responded
      // Only the target player can respond initially
      const targetHasResponded = updatedResponses[game.actionInProgress.target!] !== undefined;
      
      if (targetHasResponded && updatedResponses[game.actionInProgress.target!].type === 'allow') {
        // Target allowed the assassination
        result.actionInProgress = {
          ...game.actionInProgress,
          losingPlayer: game.actionInProgress.target
        };
        
        result.logs = [createLog('allow', targetPlayer, {
          target: actionPlayer.name,
          targetColor: actionPlayer.color,
          message: `allows assassination`
        })];
      }

      return result;
    }

    return result;
  }
};