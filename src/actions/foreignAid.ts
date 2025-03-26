import { ActionContext, ActionHandler, ActionResponse, ActionResult, createLog, createSystemLog, advanceToNextTurn, applyInfluenceLoss, verifyPlayerHasRole, markPlayerAsLosing, replaceRevealedCard } from './types';
import { GameMessages } from '../messages';

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
        // Create a player-specific message showing who got the Foreign Aid
        result.logs.push(createLog('foreign-aid', actionPlayer, {
          coins: 2, 
          message: GameMessages.results.foreignAidSuccess
        }));
      }

      result.players = updatedPlayers;
      result.actionInProgress = null;
      
      // Get next turn and reset actionUsedThisTurn flag
      const nextTurn = advanceToNextTurn(updatedPlayers, game.currentTurn);
      result.currentTurn = nextTurn.currentTurn;
      result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;

      return result;
    }

    // Handle block with Duke
    if (response.type === 'block' && response.card === 'Duke') {
      result.logs = [createLog('block', player, {
        target: actionPlayer.name,
        targetColor: actionPlayer.color,
        card: 'Duke',
        message: GameMessages.blocks.dukeBlockForeignAid
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
            message: GameMessages.responses.allowBlock
          })];
          

          result.actionInProgress = null;
          
          // Get next turn and reset actionUsedThisTurn flag
          const nextTurn = advanceToNextTurn(game.players, game.currentTurn);
          result.currentTurn = nextTurn.currentTurn;
          result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
          
          return result;
        }
        
        // If someone other than the action player responded to a block
        // We need to check if all OTHER players have responded
        const otherPlayers = game.players.filter((p, index) => 
          !p.eliminated && 
          index !== game.actionInProgress!.player && 
          index !== game.actionInProgress!.blockingPlayer
        );
        
        console.log('Other players who need to respond to block:', otherPlayers.map(p => ({ name: p.name, index: game.players.indexOf(p) })));
        
        const allOtherPlayersResponded = otherPlayers.every(p => {
          const playerIdx = game.players.indexOf(p);
          const hasResponded = updatedResponses[playerIdx] !== undefined;
          console.log(`Player ${p.name} (index ${playerIdx}) has responded to block:`, hasResponded);
          return hasResponded;
        });
        
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
      // Use index-based filtering instead of ID-based to avoid mismatches
      const otherPlayers = game.players.filter((p, index) => 
        index !== game.actionInProgress!.player && !p.eliminated
      );
      
      console.log('Other players who need to respond to Foreign Aid:', otherPlayers.map(p => ({ name: p.name, id: p.id, index: game.players.indexOf(p) })));
      console.log('Current responses for Foreign Aid:', updatedResponses);
      
      const allResponded = otherPlayers.every(p => {
        // Get the player's index which is used as the key in responses
        const playerIdx = game.players.indexOf(p);
        const hasResponded = updatedResponses[playerIdx] !== undefined;
        console.log(`Player ${p.name} (index ${playerIdx}) has responded:`, hasResponded);
        return hasResponded;
      });

      if (allResponded) {
        // Check if anyone blocked using the specific player responses
        const anyPlayerBlocked = otherPlayers.some(p => {
          const playerIdx = game.players.indexOf(p);
          const response = updatedResponses[playerIdx];
          return response && response.type === 'block';
        });
        
        console.log('Any player blocked Foreign Aid?', anyPlayerBlocked);
        console.log('Should complete Foreign Aid?', allResponded && !anyPlayerBlocked);
        
        // If no one blocked, complete Foreign Aid
        if (!anyPlayerBlocked) {
          const updatedPlayers = [...game.players];
          updatedPlayers[game.actionInProgress.player].coins += 2;
  
          result.logs = [createLog('foreign-aid', actionPlayer, {
            coins: 2,
            message: GameMessages.results.foreignAidSuccess
          })];
  
          result.players = updatedPlayers;
          result.actionInProgress = null;
          
          // Get next turn and reset actionUsedThisTurn flag
          const nextTurn = advanceToNextTurn(updatedPlayers, game.currentTurn);
          result.currentTurn = nextTurn.currentTurn;
          result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
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
          card: 'Duke',
          message: GameMessages.challenges.failDuke
        })];

        result.actionInProgress = {
          ...game.actionInProgress,
          losingPlayer: playerId,
          challengeInProgress: true,
          challengeDefense: true, // Flag to indicate the blocking player successfully defended and needs to replace their card
          responses: updatedResponses
        };
        
        // // Add specific message for the Duke block being valid using createSystemLog
        // result.logs.push(createSystemLog(GameMessages.system.dukeRevealedSuccess(blockingPlayer.name)));
      } else {
        // Challenge succeeds, blocker loses influence
        result.logs = [createLog('challenge-success', player, {
          target: blockingPlayer.name,
          targetColor: blockingPlayer.color,
          card: 'Duke',
          message: GameMessages.challenges.succeedDuke
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

    return result;
  }
};