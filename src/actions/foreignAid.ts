import { ActionContext, ActionHandler, ActionResponse, ActionResult, createLog, advanceToNextLivingPlayer, applyInfluenceLoss, verifyPlayerHasRole, markPlayerAsLosing, replaceRevealedCard } from './types';

export const foreignAidAction: ActionHandler = {
  execute: async ({ game, player, playerId }) => {
    // Check if player is eliminated
    if (player.eliminated) {
      throw new Error('Eliminated players cannot perform actions');
    }

    const result: ActionResult = {
      logs: [createLog('foreign-aid', player)],
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
      
      // If a blocking player won a challenge and needs to replace their Duke card
      if (game.actionInProgress.blockingPlayer !== undefined && 
          playerId !== game.actionInProgress.blockingPlayer && 
          game.actionInProgress.challengeDefense) {
        
        // If this was a challenger losing influence (failed challenge to Duke)
        const replaceResult = replaceRevealedCard(
          updatedPlayers[game.actionInProgress.blockingPlayer],
          'Duke',
          updatedGame
        );
        result.logs = result.logs.concat(replaceResult.logs);
      }

      // If this was the blocking player losing influence after a failed block
      if (game.actionInProgress.blockingPlayer === playerId) {
        // Original player gets Foreign Aid
        updatedPlayers[game.actionInProgress.player].coins += 2;
        result.logs.push(createLog('foreign-aid', actionPlayer, {
          coins: 2,
          message: `With the block failed, ${actionPlayer.name} takes foreign aid (+2 coins).`
        }));
      }

      result.players = updatedPlayers;
      result.actionInProgress = null;
      result.currentTurn = advanceToNextLivingPlayer(updatedPlayers, game.currentTurn);

      return result;
    }

    // Handle block with Duke
    if (response.type === 'block' && response.card === 'Duke') {
      result.logs = [createLog('block', player, {
        target: actionPlayer.name,
        targetColor: actionPlayer.color,
        card: 'Duke',
        message: `claims Duke to block Foreign Aid`
      })];

      // Clear previous responses when a block occurs
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
        
        // If the original player accepts the block, it resolves immediately
        if (playerId === game.actionInProgress.player) {
          result.logs = [createLog('allow', player, {
            target: blockingPlayer.name,
            targetColor: blockingPlayer.color,
            message: `accepted the block`
          })];
          
          result.logs.push(createLog('system', {
            name: 'System',
            color: '#9CA3AF'
          } as any, {
            message: `Foreign Aid was blocked`
          }));

          result.actionInProgress = null;
          result.currentTurn = advanceToNextLivingPlayer(game.players, game.currentTurn);
          
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
  
          result.logs = [createLog('foreign-aid', actionPlayer, {
            coins: 2,
            message: `took Foreign Aid +2M`
          })];
  
          result.players = updatedPlayers;
          result.actionInProgress = null;
          result.currentTurn = advanceToNextLivingPlayer(updatedPlayers, game.currentTurn);
        }
      }

      return result;
    }
    // Handle challenge of a block
    else if (response.type === 'challenge' && game.actionInProgress.blockingPlayer !== undefined) {
      const blockingPlayer = game.players[game.actionInProgress.blockingPlayer];
      const hasDuke = verifyPlayerHasRole(blockingPlayer, 'Duke');

      if (hasDuke) {
        // Challenge fails, challenger loses influence
        result.logs = [createLog('challenge-fail', player, {
          target: blockingPlayer.name,
          targetColor: blockingPlayer.color,
          message: `challenged Duke and failed.`
        })];

        result.actionInProgress = {
          ...game.actionInProgress,
          losingPlayer: playerId,
          challengeInProgress: true,
          challengeDefense: true, // Flag to indicate the blocking player successfully defended and needs to replace their card
          responses: updatedResponses
        };
        
        // Add specific message for the Duke block being valid
        result.logs.push(createLog('system', {
          name: 'System',
          color: '#9CA3AF'
        } as any, {
          message: `${blockingPlayer.name} revealed Duke to prove the block. The Foreign Aid is blocked.`
        }));
      } else {
        // Challenge succeeds, blocker loses influence
        result.logs = [createLog('challenge-success', player, {
          target: blockingPlayer.name,
          targetColor: blockingPlayer.color,
          message: `${player.name} challenged ${blockingPlayer.name}'s Duke claim and succeeded.`
        })];

        result.actionInProgress = {
          ...game.actionInProgress,
          losingPlayer: game.actionInProgress.blockingPlayer,
          challengeInProgress: true,
          responses: updatedResponses
        };
        
        // Add specific message for the Duke block failing
        result.logs.push(createLog('system', {
          name: 'System',
          color: '#9CA3AF'
        } as any, {
          message: `${blockingPlayer.name} revealed a card that is not Duke. The block fails.`
        }));
      }

      return result;
    }

    return result;
  }
};