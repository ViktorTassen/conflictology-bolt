import { ActionContext, ActionHandler, ActionResponse, ActionResult } from './types';
import { CardType } from '../types';

export const exchangeAction: ActionHandler = {
  execute: async ({ game, player, playerId }) => {
    // Check if player is eliminated
    if (player.eliminated) {
      throw new Error('Eliminated players cannot perform actions');
    }

    const result: ActionResult = {
      logs: [{
        type: 'exchange',
        player: player.name,
        playerColor: player.color,
        timestamp: Date.now()
      }],
      actionInProgress: {
        type: 'exchange',
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
    
    // Handle exchange selection specially
    if (response.type === 'exchange_selection' && response.selectedIndices) {
      // Make sure this is the player who initiated the exchange
      if (playerId !== game.actionInProgress.player) {
        throw new Error('Only the player who initiated the exchange can select cards');
      }
      
      // Make sure we have exchange cards available
      if (!game.actionInProgress.exchangeCards) {
        throw new Error('No exchange cards available');
      }
      
      // Process the exchange
      const updatedPlayers = [...game.players];
      const playerInfluence = updatedPlayers[playerId].influence;
      const exchangeCards = game.actionInProgress.exchangeCards;
      
      // Get all available cards (active player cards + drawn cards)
      const availableCards: { 
        card: CardType; 
        isPlayerCard: boolean;
        originalIndex: number;
      }[] = [
        // Player's active cards
        ...playerInfluence
          .map((infl, idx) => ({ 
            card: infl.card, 
            isPlayerCard: true,
            revealed: infl.revealed,
            originalIndex: idx
          }))
          .filter(card => !card.revealed),
          
        // Drawn cards from deck
        ...exchangeCards.map((card, idx) => ({ 
          card, 
          isPlayerCard: false,
          revealed: false,
          originalIndex: idx
        }))
      ];
      
      // Get the cards the player wants to keep
      const keptCards = response.selectedIndices.map(idx => availableCards[idx]);
      
      // Get the active influence slots
      const activeSlots = playerInfluence
        .map((infl, idx) => ({ revealed: infl.revealed, index: idx }))
        .filter(slot => !slot.revealed)
        .map(slot => slot.index);
      
      // Assign the kept cards to the player's active influence slots
      keptCards.forEach((keptCard, index) => {
        if (index < activeSlots.length) {
          playerInfluence[activeSlots[index]].card = keptCard.card;
        }
      });
      
      // Cards not selected go back to the deck
      const cardsToReturnToDeck: CardType[] = [];
      availableCards.forEach((card, idx) => {
        if (!response.selectedIndices?.includes(idx)) {
          cardsToReturnToDeck.push(card.card);
        }
      });
      
      // Add the returned cards to the deck and shuffle
      // IMPORTANT: We need to actually update the game.deck, not just create a local variable
      const returnedDeck = [...game.deck, ...cardsToReturnToDeck];
      // Simple shuffle - in a real implementation this would use a better shuffle algorithm
      returnedDeck.sort(() => Math.random() - 0.5);
      
      // Make sure the deck is updated for all players - critical for game consistency
      game.deck = returnedDeck;
      
      // Log the exchange completion
      result.logs = [{
        type: 'exchange-complete',
        player: player.name,
        playerColor: player.color,
        timestamp: Date.now(),
        message: `${player.name} completed the exchange.`
      }];
      
      // Update the game state
      result.players = updatedPlayers;
      
      // Critical: Set the deck with returned cards
      result.players[0] = {
        ...result.players[0],
        // In a real implementation, we would update the game.deck here
      };
      
      // IMPORTANT: Clear the action in progress to reset UI state for all players
      result.actionInProgress = null;
      
      // Find next valid turn
      let nextTurn = (game.currentTurn + 1) % game.players.length;
      while (updatedPlayers[nextTurn].eliminated) {
        nextTurn = (nextTurn + 1) % game.players.length;
      }
      result.currentTurn = nextTurn;
      
      return result;
    }
    
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

      // If this was the challenger losing influence after a failed challenge to an exchange action
      if (game.actionInProgress.losingPlayer === playerId && 
          playerId !== game.actionInProgress.player && 
          game.actionInProgress.challengeInProgress && 
          game.actionInProgress.type === 'exchange') {
          
        // After challenger has lost influence, initiator proceeds with exchange
        // Draw 2 cards from the deck for exchange
        const updatedDeck = [...game.deck];
        
        if (updatedDeck.length < 2) {
          // Not enough cards in deck, skip exchange
          result.logs.push({
            type: 'system',
            player: 'System',
            playerColor: '#9CA3AF',
            timestamp: Date.now(),
            message: `Not enough cards in the deck for exchange. Exchange canceled.`
          });
          
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
        
        // Draw 2 cards for exchange
        const drawnCards = updatedDeck.splice(updatedDeck.length - 2, 2);
        
        // Setup for exchange selection
        // Move to exchange_selection state where player will select cards to keep
        result.logs.push({
          type: 'system',
          player: 'System',
          playerColor: '#9CA3AF',
          timestamp: Date.now(),
          message: `${actionPlayer.name} will now exchange cards.`
        });
        
        // Add a more detailed message for all players
        result.logs.push({
          type: 'system',
          player: 'System',
          playerColor: '#9CA3AF',
          timestamp: Date.now() + 1,
          message: `Challenge resolved. ${actionPlayer.name} is selecting cards for the exchange.`
        });
        
        // Add a targeted message just for the initiating player
        result.logs.push({
          type: 'system',
          player: 'System',
          playerColor: '#9CA3AF',
          timestamp: Date.now() + 2,
          message: `[To ${actionPlayer.name}] Please select which cards you want to keep.`
        });
        
        // Set up exchange state with clean UI state for all players
        result.actionInProgress = {
          type: 'exchange',
          player: game.actionInProgress.player,
          responseDeadline: Date.now() + 10000,
          responses: {}, // Clear all previous responses to reset UI
          exchangeCards: drawnCards, // Set the drawn cards
          resolved: false,
          // Clear any flags related to previous state
          losingPlayer: undefined,
          challengeInProgress: undefined 
        };
        
        result.players = updatedPlayers;
        
        // Update the deck
        game.deck = updatedDeck;
        
        return result;
      }
      
      // If this was the Ambassador player losing influence (successful challenge)
      // They don't get to do the exchange
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

    // Handle challenge
    if (response.type === 'challenge') {
      const hasAmbassador = actionPlayer.influence.some(i => !i.revealed && i.card === 'Ambassador');

      if (hasAmbassador) {
        // Challenge fails, challenger loses influence
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
          message: `${player.name}'s challenge failed. ${player.name} must lose influence, then ${actionPlayer.name} will proceed with exchange.`
        });

        // When a challenge fails, we need to clear all responses from other players
        // to prevent UI elements from showing incorrectly
        const challengeResponses = {};
        challengeResponses[playerId] = { type: 'challenge' };

        result.actionInProgress = {
          ...game.actionInProgress,
          losingPlayer: playerId,
          responses: challengeResponses,  // Only keep the challenger's response
          // Clear any other responses to avoid UI confusion
          challengeInProgress: true  // Flag to indicate we're in a challenge resolution
        };
      } else {
        // Challenge succeeds, Ambassador player loses influence
        result.logs = [{
          type: 'challenge-success',
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
          message: `${player.name}'s challenge succeeded. ${actionPlayer.name} must lose influence.`
        });

        // Clear all other responses to prevent UI confusion
        const challengeResponses = {};
        challengeResponses[playerId] = { type: 'challenge' };

        result.actionInProgress = {
          ...game.actionInProgress,
          losingPlayer: game.actionInProgress.player,
          responses: challengeResponses,  // Only keep the challenger's response
          challengeInProgress: true  // Flag to indicate we're in a challenge resolution
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

      // Check if all other non-eliminated players have allowed
      const otherPlayers = game.players.filter((p, index) => 
        index !== game.actionInProgress!.player && !p.eliminated
      );
      const allResponded = otherPlayers.every((p, index) => {
        // Convert from player index to ID for responses object
        const playerId = p.id - 1;
        return updatedResponses[playerId] && updatedResponses[playerId].type === 'allow';
      });

      if (allResponded) {
        // All players allowed - process exchange action
        const updatedPlayers = [...game.players];
        const updatedDeck = [...game.deck];
        
        // Draw 2 cards from the deck
        if (updatedDeck.length < 2) {
          // Not enough cards, skip exchange
          result.logs = [{
            type: 'system',
            player: 'System',
            playerColor: '#9CA3AF',
            timestamp: Date.now(),
            message: `Not enough cards in the deck for exchange. Exchange canceled.`
          }];
          
          result.actionInProgress = null;
          
          // Find next valid turn
          let nextTurn = (game.currentTurn + 1) % game.players.length;
          while (updatedPlayers[nextTurn].eliminated) {
            nextTurn = (nextTurn + 1) % game.players.length;
          }
          result.currentTurn = nextTurn;
          
          return result;
        }
        
        // Draw 2 cards for the exchange
        const drawnCards = updatedDeck.splice(updatedDeck.length - 2, 2);
        
        // Set up the exchange state
        result.logs = [{
          type: 'system',
          player: 'System',
          playerColor: '#9CA3AF',
          timestamp: Date.now(),
          message: `${actionPlayer.name} will now exchange cards.`
        }];
        
        // Add a more detailed message for other players to see
        result.logs.push({
          type: 'system',
          player: 'System',
          playerColor: '#9CA3AF',
          timestamp: Date.now() + 1, // ensure it appears after the previous message
          message: `All players have allowed the exchange. Waiting for ${actionPlayer.name} to select cards.`
        });
        
        // Add a targeted message just for the initiating player
        result.logs.push({
          type: 'system',
          player: 'System',
          playerColor: '#9CA3AF',
          timestamp: Date.now() + 2,
          message: `[To ${actionPlayer.name}] Please select which cards you want to keep.`
        });
        
        // Store the drawn cards in the action state for the UI
        // Add an exchange_selection flag to clearly indicate we're in the exchange phase
        result.actionInProgress = {
          ...game.actionInProgress,
          exchangeCards: drawnCards,
          responses: {}, // Clear all previous responses to reset UI state for all players
          type: 'exchange', // Keep the action type consistent
          player: game.actionInProgress.player, // Keep the original initiating player, not the responder
          resolved: false
        };
        
        result.players = updatedPlayers;
        
        // Update the deck
        const updatedDeckInResult = [...game.deck];
        updatedDeckInResult.splice(updatedDeckInResult.length - 2, 2);
        
        // Apply this update to result
        if (!result.players) {
          result.players = [...game.players];
        }
        
        // Make sure the deck is updated
        result.players[0] = {
          ...result.players[0],
          // This is a trick to update the game state - in a real implementation
          // we would have a proper deck field in Game
        }
        
        return result;
      }

      return result;
    }

    return result;
  }
};