import { ActionHandler, ActionResponse, ActionResult, createLog, advanceToNextTurn, applyInfluenceLoss, verifyPlayerHasRole, replaceRevealedCard, validateCardCounts } from './types';
import { CardType } from '../types';
import { GameMessages } from '../messages';

export const exchangeAction: ActionHandler = {
  execute: async ({ game, player, playerId }) => {
    // Check if player is eliminated
    if (player.eliminated) {
      throw new Error('Eliminated players cannot perform actions');
    }

    const result: ActionResult = {
      logs: [createLog('exchange', player, {
        message: GameMessages.claims.exchange
      })],
      actionInProgress: {
        type: 'exchange',
        player: playerId,
        responses: {},
        resolved: false
      }
    };

    return result;
  },

  respond: async ({ game, player, playerId }, response: ActionResponse) => {
    if (!game?.actionInProgress) return {};

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
      
      // Return all unchosen cards to the deck
      const cardsToReturnToDeck: CardType[] = availableCards
        .filter((_, idx) => !response.selectedIndices?.includes(idx))
        .map(card => card.card);
      
      // Validate card counts and correct the deck if needed
      const validationLogs = validateCardCounts(game);
      if (validationLogs.length > 0) {
        // Add validation logs to the result
        result.logs = [...validationLogs, ...result.logs];
      }
      
      // Add cards back to deck and count cards of each type to ensure we don't exceed 3 per type
      cardsToReturnToDeck.forEach(card => {
        // Count occurrences of this card type in the game
        const countInDeck = game.deck.filter(c => c === card).length;
        const countInHands = game.players.reduce((count, p) => 
          count + p.influence.filter(i => i.card === card).length, 0
        );
        
        // Only add the card back if it wouldn't exceed the limit of 3 per type
        if (countInDeck + countInHands < 3) {
          game.deck.push(card);
        }
      });
      
      // Shuffle the deck thoroughly using Fisher-Yates
      for (let i = game.deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [game.deck[i], game.deck[j]] = [game.deck[j], game.deck[i]];
      }
      
      // Log the exchange completion
      result.logs = [createLog('exchange-complete', player, {
        message: GameMessages.results.exchangeComplete
      })];
      
      // Update the game state
      result.players = updatedPlayers;
      result.actionInProgress = null;
      
      // Get next turn and reset actionUsedThisTurn flag
      const nextTurn = advanceToNextTurn(updatedPlayers, game.currentTurn);
      result.currentTurn = nextTurn.currentTurn;
      result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
      
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
        // Ensure the deck is properly shuffled before drawing
        // Shuffle the deck thoroughly using Fisher-Yates
        for (let i = game.deck.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [game.deck[i], game.deck[j]] = [game.deck[j], game.deck[i]];
        }
        
        // Draw 2 cards from the deck for exchange
        const drawnCards = game.deck.splice(0, 2);
        
        if (drawnCards.length < 2) {
          // Not enough cards in deck
          result.logs.push(createLog('system', { name: 'System', color: '#9CA3AF' } as any, {
            message: `Not enough cards in the deck for exchange. Exchange canceled.`
          }));
          
          result.players = updatedPlayers;
          result.actionInProgress = null;
          
          // Get next turn and reset actionUsedThisTurn flag
          const nextTurn = advanceToNextTurn(updatedPlayers, game.currentTurn);
          result.currentTurn = nextTurn.currentTurn;
          result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
          
          return result;
        }
        
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
        
        result.players = updatedPlayers;
        return result;
      }
      
      // Action player lost influence (successful challenge)
      // No exchange happens
      result.players = updatedPlayers;
      result.actionInProgress = null;
      
      // Get next turn and reset actionUsedThisTurn flag
      const nextTurn = advanceToNextTurn(updatedPlayers, game.currentTurn);
      result.currentTurn = nextTurn.currentTurn;
      result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
      
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
          message: `challenges Ambassador claim! Fails`
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
          message: `challenges Ambassador claim! Success`
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
        // All players allowed - process exchange action
        
        // Ensure the deck is properly shuffled before drawing
        // Shuffle the deck thoroughly using Fisher-Yates
        for (let i = game.deck.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [game.deck[i], game.deck[j]] = [game.deck[j], game.deck[i]];
        }
        
        // Draw 2 cards for the exchange
        const drawnCards = game.deck.splice(0, 2);
        
        result.logs = [createLog('system', { name: 'System', color: '#9CA3AF' } as any, {
          message: `Exchange allowed. ${actionPlayer.name} selecting cards.`
        })];
        
        // Set up for exchange phase
        result.actionInProgress = {
          ...game.actionInProgress,
          exchangeCards: drawnCards,
          responses: {} // Clear responses for exchange phase
        };
        
        result.players = [...game.players];
      }

      return result;
    }

    return result;
  }
};