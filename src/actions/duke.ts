import { ActionContext, ActionHandler, ActionResponse, ActionResult, createLog, advanceToNextLivingPlayer, applyInfluenceLoss, verifyPlayerHasRole, replaceRevealedCard } from './types';
import { GameMessages } from '../messages';

export const dukeAction: ActionHandler = {
  execute: async ({ game, player, playerId }) => {
    // Check if player is eliminated
    if (player.eliminated) {
      throw new Error('Eliminated players cannot perform actions');
    }

    // Create the initial action state
    const result: ActionResult = {
      logs: [createLog('duke', player, {
        message: GameMessages.claims.tax
      })],
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
      const updatedGame = {...game, players: updatedPlayers};
      
      // Apply influence loss
      const lossResult = applyInfluenceLoss(
        updatedPlayers[playerId], 
        response.card ? updatedPlayers[playerId].influence.findIndex(i => !i.revealed && i.card === response.card) : undefined,
        updatedPlayers
      );
      
      result.logs = lossResult.logs;

      // If action player was challenged successfully and lost influence
      if (playerId === game.actionInProgress.player) {
        // Action fails, turn passes
        result.players = updatedPlayers;
        result.actionInProgress = null;
        result.currentTurn = advanceToNextLivingPlayer(updatedPlayers, game.currentTurn);
      } 
      // Challenger lost influence due to failed challenge
      else {
        // If this was a failed challenge and action player needs to replace their revealed Duke
        if (game.actionInProgress.challengeInProgress && game.actionInProgress.challengeDefense) {
          const replaceResult = replaceRevealedCard(
            updatedPlayers[game.actionInProgress.player],
            'Duke',
            updatedGame
          );
          result.logs = result.logs.concat(replaceResult.logs);
          
          // Update the deck in the game
          result.actionInProgress = {
            ...game.actionInProgress,
            challengeInProgress: false,
            challengeDefense: false
          };
        }
        
        // Duke action succeeds - action player gains 3 coins
        updatedPlayers[game.actionInProgress.player].coins += 3;
        
        result.logs.push(createLog('duke', actionPlayer, {
          coins: 3,
          message: GameMessages.results.tax
        }));
        
        result.players = updatedPlayers;
        result.actionInProgress = null;
        result.currentTurn = advanceToNextLivingPlayer(updatedPlayers, game.currentTurn);
      }

      return result;
    }

    // Handle challenge
    if (response.type === 'challenge') {
      const hasDuke = verifyPlayerHasRole(actionPlayer, 'Duke');
      
      if (hasDuke) {
        // Challenge fails - challenger loses influence and action player will replace their card
        result.logs = [createLog('challenge-fail', player, {
          target: actionPlayer.name,
          targetColor: actionPlayer.color,
          card: 'Duke',
          message: GameMessages.challenges.failDuke
        })];
        
        result.actionInProgress = {
          ...game.actionInProgress,
          losingPlayer: playerId,
          challengeInProgress: true,
          challengeDefense: true, // Flag to indicate the action player successfully defended and needs to replace their card
          responses: updatedResponses
        };
      } else {
        // Challenge succeeds - action player loses influence
        result.logs = [createLog('challenge-success', player, {
          target: actionPlayer.name,
          targetColor: actionPlayer.color,
          card: 'Duke',
          message: GameMessages.challenges.succeedDuke
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
    
    // Handle allow
    if (response.type === 'allow') {
      result.actionInProgress = {
        ...game.actionInProgress,
        responses: updatedResponses
      };
      
      // Check if all other non-eliminated players have allowed
      const otherPlayers = game.players.filter(p => 
        p.id !== game.actionInProgress!.player + 1 && !p.eliminated
      );
      
      const allResponded = otherPlayers.every(p => 
        updatedResponses[p.id - 1] !== undefined
      );
      
      // If all players have responded with allow, proceed with Duke action
      if (allResponded && Object.values(updatedResponses).every(r => r.type === 'allow')) {
        const updatedPlayers = [...game.players];
        updatedPlayers[game.actionInProgress.player].coins += 3;
        
        result.logs = [createLog('duke', actionPlayer, {
          coins: 3,
          message: GameMessages.results.tax
        })];
        
        result.players = updatedPlayers;
        result.actionInProgress = null;
        result.currentTurn = advanceToNextLivingPlayer(updatedPlayers, game.currentTurn);
      }
      
      return result;
    }
    
    return result;
  }
};