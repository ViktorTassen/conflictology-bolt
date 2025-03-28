import { ActionHandler, ActionResponse, ActionResult, createLog, advanceToNextTurn } from './types';
import { GameMessages } from '../messages';
import { hasCardType, revealCard, replaceCard, drawCards, returnCardsToDeck, getPlayerCards } from '../utils/cardUtils';

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
      
      // Get all available cards (player's non-revealed cards + drawn cards)
      // Use player's actual ID (from player object), not the array index
      const actionPlayer = game.players[game.actionInProgress.player];
      const playerCards = getPlayerCards(game.cards, actionPlayer.id);
      const exchangeCards = game.cards.filter(c => 
        game.actionInProgress!.exchangeCards!.includes(c.id)
      );
      
      const availableCards = [...playerCards, ...exchangeCards];
      
      // Validate selection count matches active cards
      if (response.selectedIndices.length !== playerCards.length) {
        throw new Error(`Must select ${playerCards.length} cards to keep`);
      }
      
      // Get the cards the player wants to keep
      const keptCardIds = response.selectedIndices.map(idx => availableCards[idx].id);
      
      // Get the cards to return to the deck
      const returnCardIds = availableCards
        .filter(card => !keptCardIds.includes(card.id))
        .map(card => card.id);
      
      // Update kept cards to be assigned to the player who initiated the exchange
      let updatedCards = [...game.cards];
      keptCardIds.forEach(cardId => {
        const cardIndex = updatedCards.findIndex(c => c.id === cardId);
        if (cardIndex !== -1) {
          updatedCards[cardIndex] = {
            ...updatedCards[cardIndex],
            playerId: actionPlayer.id, // Use action initiator's player ID (not index)
            location: 'player'
          };
        }
      });
      
      // Return unchosen cards to deck
      updatedCards = returnCardsToDeck(updatedCards, returnCardIds);
      
      // Log the exchange completion
      result.logs = [createLog('exchange-complete', player, {
        message: GameMessages.results.exchangeComplete
      })];
      
      // Update the game state
      result.cards = updatedCards;
      result.actionInProgress = null;
      
      // Get next turn and reset actionUsedThisTurn flag
      const nextTurn = advanceToNextTurn(game.players, game.currentTurn);
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
      // Find the card to reveal
      const playerCards = getPlayerCards(game.cards, player.id);
      
      if (playerCards.length === 0) {
        // Player has no cards left to lose
        const updatedPlayers = [...game.players];
        updatedPlayers[playerId].eliminated = true;
        
        result.logs = [createLog('system', { name: 'System', color: '#9CA3AF' } as any, {
          message: `${player.name} has no more cards to lose.`
        })];
        
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
      
      // Check if player has any unrevealed cards left after this card is revealed
      const remainingCards = getPlayerCards(updatedCards, player.id);
      if (remainingCards.length === 0) {
        // Player has no more cards - mark them as eliminated
        const updatedPlayers = [...game.players];
        updatedPlayers[playerId].eliminated = true;
        result.players = updatedPlayers;
        result.logs.push(createSystemLog(GameMessages.system.noMoreCards(player.name)));
      }

      // Only the action player should replace their revealed card and draw for exchange
      // This happens when:
      // 1. They were challenged about having Ambassador
      // 2. They revealed Ambassador (proved they had it)
      // 3. The challenger lost influence
      if (game.actionInProgress.losingPlayer !== undefined &&  // Someone lost influence
          game.actionInProgress.losingPlayer !== game.actionInProgress.player && // Not the action player
          playerId === game.actionInProgress.player && // This player is the action player
          game.actionInProgress.challengeDefense) { // The action player successfully defended
        
        // Find the card that matches the claim (Ambassador)
        const ambassadorCard = getPlayerCards(game.cards, player.id)
          .find(c => c.name === 'Ambassador');
        
        if (ambassadorCard) {
          // Replace the Ambassador card
          const updatedCards = replaceCard(result.cards || game.cards, ambassadorCard.id);
          result.cards = updatedCards;
          
          // Draw 2 cards for exchange
          const cardsWithExchange = drawCards(updatedCards, 2, 'exchange');
          const drawnCardIds = cardsWithExchange
            .filter(c => c.location === 'exchange')
            .map(c => c.id);
          
          result.logs.push(createLog('system', { name: 'System', color: '#9CA3AF' } as any, {
            message: `${actionPlayer.name} will now exchange cards.`
          }));
          
          // Reset action state for exchange phase
          const { losingPlayer, challengeInProgress, challengeDefense, ...restActionProps } = game.actionInProgress;
          
          result.actionInProgress = {
            ...restActionProps,
            exchangeCards: drawnCardIds,
            responses: {} // Clear responses for exchange phase
          };
          
          result.cards = cardsWithExchange;
          return result;
        }
      }
      
      // If this is the challenger who lost influence (failed challenge)
      // We need to trigger the action player to finish the exchange action
      if (game.actionInProgress.losingPlayer === playerId &&
          playerId !== game.actionInProgress.player) {
        // Already revealed the card above - now the Ambassador player should proceed with exchange
        const actionPlayer = game.players[game.actionInProgress.player];
        
        // Find the Ambassador card to replace
        const ambassadorCard = getPlayerCards(game.cards, actionPlayer.id)
          .find(c => c.name === 'Ambassador');
        
        if (ambassadorCard) {
          // Replace the revealed Ambassador card
          const updatedCards = replaceCard(result.cards || game.cards, ambassadorCard.id);
          
          // Draw 2 cards for exchange
          const cardsWithExchange = drawCards(updatedCards, 2, 'exchange');
          const drawnCardIds = cardsWithExchange
            .filter(c => c.location === 'exchange')
            .map(c => c.id);
          
          result.logs.push(createLog('system', { name: 'System', color: '#9CA3AF' } as any, {
            message: `${actionPlayer.name} will now exchange cards.`
          }));
          
          // Reset action state for exchange phase - without losingPlayer field
          result.actionInProgress = {
            type: game.actionInProgress.type,
            player: game.actionInProgress.player,
            exchangeCards: drawnCardIds,
            responses: {},
            resolved: false
          };
          
          result.cards = cardsWithExchange;
        } else {
          // No Ambassador card found (shouldn't happen)
          // End the action
          result.actionInProgress = null;
          
          // Get next turn and reset actionUsedThisTurn flag
          const nextTurn = advanceToNextTurn(game.players, game.currentTurn);
          result.currentTurn = nextTurn.currentTurn;
          result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
        }
        
        return result;
      }
      
      // Action player lost influence (successful challenge)
      // No exchange happens
      result.actionInProgress = null;
      
      // Get next turn and reset actionUsedThisTurn flag
      const nextTurn = advanceToNextTurn(game.players, game.currentTurn);
      result.currentTurn = nextTurn.currentTurn;
      result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
      
      return result;
    }

    // Handle challenge
    if (response.type === 'challenge') {
      const actionPlayer = game.players[game.actionInProgress.player];
      const hasAmbassador = hasCardType(game.cards, actionPlayer.id, 'Ambassador');

      if (hasAmbassador) {
        // Challenge fails, challenger loses influence
        result.logs = [createLog('challenge-fail', player, {
          target: actionPlayer.name,
          targetColor: actionPlayer.color,
          message: GameMessages.challenges.failAmbassador
        })];

        result.actionInProgress = {
          ...game.actionInProgress,
          losingPlayer: playerId,
          challengeInProgress: true,
          challengeDefense: true,
          responses: updatedResponses
        };
      } else {
        // Challenge succeeds, Ambassador player loses influence
        result.logs = [createLog('challenge-success', player, {
          target: actionPlayer.name,
          targetColor: actionPlayer.color,
          message: GameMessages.challenges.succeedAmbassador
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
        // Draw 2 cards for the exchange
        const updatedCards = drawCards(game.cards, 2, 'exchange');
        const drawnCardIds = updatedCards
          .filter(c => c.location === 'exchange')
          .map(c => c.id);
        
        result.logs = [createLog('system', { name: 'System', color: '#9CA3AF' } as any, {
          message: `Exchange allowed. ${actionPlayer.name} selecting cards.`
        })];
        
        // Set up for exchange phase
        result.actionInProgress = {
          ...game.actionInProgress,
          exchangeCards: drawnCardIds,
          responses: {} // Clear responses for exchange phase
        };
        
        result.cards = updatedCards;
      }

      return result;
    }

    return result;
  }
};