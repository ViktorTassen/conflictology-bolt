import { ActionContext, ActionHandler, ActionResponse, ActionResult, createLog, advanceToNextLivingPlayer, applyInfluenceLoss, verifyPlayerHasRole, replaceRevealedCard } from './types';
import { CardType } from '../types';

export const exchangeAction: ActionHandler = {
  execute: async ({ game, player, playerId }) => {
    // Check if player is eliminated
    if (player.eliminated) {
      throw new Error('Eliminated players cannot perform actions');
    }

    const result: ActionResult = {
      logs: [createLog('exchange', player, {
        message: `initiated an exchange.`
      })],
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
    
    // Handle exchange selection
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
      
      // Get all available cards (player's non-revealed cards + drawn cards)
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
      
      // Create a new deck ensuring we don't exceed 3 of each card type
      const updatedDeck = [...game.deck];
      cardsToReturnToDeck.forEach(card => {
        // Count current occurrences of this card type in the deck
        const cardCount = updatedDeck.filter(c => c === card).length;
        // Only add if we haven't reached the limit of 3
        if (cardCount < 3) {
          updatedDeck.push(card);
        }
      });
      
      // Shuffle the updated deck
      updatedDeck.sort(() => Math.random() - 0.5);
      
      // Update the deck in the game
      game.deck = updatedDeck;
      
      // Log the exchange completion
      result.logs = [createLog('exchange-complete', player, {
        message: `${player.name} completed the exchange.`
      })];
      
      result.logs.push(createLog('system', { name: 'System', color: '#9CA3AF' } as any, {
        message: `${player.name} returned ${cardsToReturnToDeck.length} card${cardsToReturnToDeck.length !== 1 ? 's' : ''} to the deck.`
      }));
      
      // Update the game state
      result.players = updatedPlayers;
      result.actionInProgress = null;
      result.currentTurn = advanceToNextLivingPlayer(updatedPlayers, game.currentTurn);
      
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
      const updatedGame = {...game, players: updatedPlayers};
      
      // Apply influence loss
      const lossResult = applyInfluenceLoss(
        updatedPlayers[playerId], 
        response.card ? updatedPlayers[playerId].influence.findIndex(i => !i.revealed && i.card === response.card) : undefined,
        updatedPlayers
      );
      
      result.logs = lossResult.logs;

      // If challenger lost influence (failed challenge) and action player should replace their card
      if (game.actionInProgress.losingPlayer === playerId && 
          playerId !== game.actionInProgress.player &&
          game.actionInProgress.challengeDefense) {
        
        // First, replace the Ambassador card that was revealed during challenge
        const replaceResult = replaceRevealedCard(
          updatedPlayers[game.actionInProgress.player],
          'Ambassador',
          updatedGame
        );
        result.logs = result.logs.concat(replaceResult.logs);
        
        // Set up for exchange phase
        // Draw 2 cards from the deck for exchange - using the updated deck from replaceRevealedCard
        // Make sure we're using the updated deck from updatedGame, which contains changes from replaceRevealedCard
        const updatedDeck = [...updatedGame.deck]; 
        
        if (updatedDeck.length < 2) {
          // Not enough cards in deck
          result.logs.push(createLog('system', { name: 'System', color: '#9CA3AF' } as any, {
            message: `Not enough cards in the deck for exchange. Exchange canceled.`
          }));
          
          result.players = updatedPlayers;
          result.actionInProgress = null;
          result.currentTurn = advanceToNextLivingPlayer(updatedPlayers, game.currentTurn);
          
          return result;
        }
        
        // Draw 2 cards for exchange
        const drawnCards = updatedDeck.splice(0, 2);
        
        result.logs.push(createLog('system', { name: 'System', color: '#9CA3AF' } as any, {
          message: `${actionPlayer.name} will now exchange cards.`
        }));
        
        // Reset action state for exchange phase
        const { losingPlayer, challengeInProgress, challengeDefense, ...restActionProps } = game.actionInProgress;
        
        result.actionInProgress = {
          ...restActionProps,
          exchangeCards: drawnCards,
          responses: {} // Clear responses for exchange phase
        };
        
        // Use the updated game state with the replaced card and updated deck
        result.players = updatedPlayers;
        // Update the game's deck
        game.deck = updatedDeck;
        
        return result;
      }
      
      // Action player lost influence (successful challenge)
      // No exchange happens
      result.players = updatedPlayers;
      result.actionInProgress = null;
      result.currentTurn = advanceToNextLivingPlayer(updatedPlayers, game.currentTurn);
      
      return result;
    }

    // Handle challenge
    if (response.type === 'challenge') {
      const hasAmbassador = verifyPlayerHasRole(actionPlayer, 'Ambassador');

      if (hasAmbassador) {
        // Challenge fails, challenger loses influence
        result.logs = [createLog('challenge-fail', player, {
          target: actionPlayer.name,
          targetColor: actionPlayer.color,
          message: `${player.name} challenged ${actionPlayer.name}'s Ambassador claim and failed.`
        })];

        result.actionInProgress = {
          ...game.actionInProgress,
          losingPlayer: playerId,
          challengeInProgress: true,
          challengeDefense: true, // Flag to indicate the action player successfully defended and needs to replace their card
          responses: updatedResponses
        };
      } else {
        // Challenge succeeds, Ambassador player loses influence
        result.logs = [createLog('challenge-success', player, {
          target: actionPlayer.name,
          targetColor: actionPlayer.color,
          message: `${player.name} challenged ${actionPlayer.name}'s Ambassador claim and succeeded.`
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
      
      const allResponded = otherPlayers.every(p => 
        updatedResponses[p.id - 1] !== undefined
      );

      if (allResponded && Object.values(updatedResponses).every(r => r.type === 'allow')) {
        // All players allowed - process exchange action
        const updatedPlayers = [...game.players];
        const updatedDeck = [...game.deck];
        
        // Draw 2 cards from the deck
        if (updatedDeck.length < 2) {
          // Not enough cards, skip exchange
          result.logs = [createLog('system', { name: 'System', color: '#9CA3AF' } as any, {
            message: `Not enough cards in the deck for exchange. Exchange canceled.`
          })];
          
          result.actionInProgress = null;
          result.currentTurn = advanceToNextLivingPlayer(updatedPlayers, game.currentTurn);
          
          return result;
        }
        
        // Draw 2 cards for the exchange
        const drawnCards = updatedDeck.splice(0, 2);
        
        result.logs = [createLog('system', { name: 'System', color: '#9CA3AF' } as any, {
          message: `${actionPlayer.name} will now exchange cards.`
        })];
        
        result.logs.push(createLog('system', { name: 'System', color: '#9CA3AF' } as any, {
          message: `All players have allowed the exchange. Waiting for ${actionPlayer.name} to select cards.`
        }));
        
        // Set up for exchange phase
        result.actionInProgress = {
          ...game.actionInProgress,
          exchangeCards: drawnCards,
          responses: {} // Clear responses for exchange phase
        };
        
        result.players = updatedPlayers;
        game.deck = updatedDeck;
      }

      return result;
    }

    return result;
  }
};