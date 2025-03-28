import { ActionContext, ActionHandler, ActionResponse, ActionResult, createLog, advanceToNextTurn, createSystemLog } from './types';
import { GameMessages } from '../messages';
import { hasCardType, revealCard, replaceCard, getPlayerCards } from '../utils/cardUtils';

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
      // Find the card to reveal
      const playerCards = getPlayerCards(game.cards, player.id);
      
      if (playerCards.length === 0) {
        // Player has no cards left to lose
        const updatedPlayers = [...game.players];
        updatedPlayers[playerId].eliminated = true;
        
        result.logs = [createSystemLog(GameMessages.system.noMoreCards(player.name))];
        result.players = updatedPlayers;
        result.actionInProgress = null;
        
        // Get next turn and reset actionUsedThisTurn flag
        const nextTurn = advanceToNextTurn(updatedPlayers, game.currentTurn);
        result.currentTurn = nextTurn.currentTurn;
        result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
        
        return result;
      }

      // If a specific card was chosen, find it
      let cardToReveal = response.card ? 
        playerCards.find(c => c.name === response.card) : 
        playerCards[0];

      if (!cardToReveal) {
        cardToReveal = playerCards[0];
      }

      // Reveal the card
      const updatedCards = revealCard(game.cards, cardToReveal.id);
      result.cards = updatedCards;
      result.logs = [createLog('lose-influence', player)];

      // If action player was challenged successfully and lost influence
      if (playerId === game.actionInProgress.player) {
        // Action fails, turn passes
        result.actionInProgress = null;
        
        // Get next turn and reset actionUsedThisTurn flag
        const nextTurn = advanceToNextTurn(game.players, game.currentTurn);
        result.currentTurn = nextTurn.currentTurn;
        result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
      } 
      // Challenger lost influence due to failed challenge
      else {
        // If this was a failed challenge and action player needs to replace their Duke
        if (game.actionInProgress.challengeInProgress && game.actionInProgress.challengeDefense) {
          // Replace the revealed Duke card
          const updatedCards = replaceCard(result.cards || game.cards, cardToReveal.id);
          result.cards = updatedCards;
          
          // Duke action succeeds - action player gains 3 coins
          const updatedPlayers = [...game.players];
          updatedPlayers[game.actionInProgress.player].coins += 3;
          
          result.logs.push(createLog('duke', actionPlayer, {
            coins: 3,
            message: GameMessages.results.tax
          }));
          
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

    // Handle challenge
    if (response.type === 'challenge') {
      const actionPlayer = game.players[game.actionInProgress.player];
      const hasDuke = hasCardType(game.cards, actionPlayer.id, 'Duke');
      
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
      const otherPlayers = game.players.filter((p, index) => 
        index !== game.actionInProgress!.player && !p.eliminated
      );
      
      const allResponded = otherPlayers.every(p => {
        const playerIdx = game.players.indexOf(p);
        const hasResponded = updatedResponses[playerIdx] !== undefined;
        return hasResponded;
      });
      
      // Check that each response from other players is 'allow'
      const allPlayersAllowed = allResponded && otherPlayers.every(p => {
        const playerIdx = game.players.indexOf(p);
        const response = updatedResponses[playerIdx];
        return response && response.type === 'allow';
      });
      
      if (allPlayersAllowed) {
        const updatedPlayers = [...game.players];
        updatedPlayers[game.actionInProgress.player].coins += 3;
        
        result.logs = [createLog('duke', actionPlayer, {
          coins: 3,
          message: GameMessages.results.tax
        })];
        
        result.players = updatedPlayers;
        result.actionInProgress = null;
        
        // Get next turn and reset actionUsedThisTurn flag
        const nextTurn = advanceToNextTurn(updatedPlayers, game.currentTurn);
        result.currentTurn = nextTurn.currentTurn;
        result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
      }
      
      return result;
    }
    
    return result;
  }
};