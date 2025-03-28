import { ActionHandler, ActionResponse, ActionResult, createLog, advanceToNextTurn, createSystemLog } from './types';
import { GameMessages } from '../messages';
import { hasCardType, revealCard, replaceCard, drawCards, returnCardsToDeck, getPlayerCards } from '../utils/cardUtils';

// Inquisitor has two main actions:
// 1. Investigate: Look at another player's card and decide to keep or swap it
// 2. Swap: Similar to Ambassador's exchange but with 1 card

// Adding debug logging to help troubleshoot Inquisitor action issues
console.log("Loading Inquisitor actions module");

export const investigateAction: ActionHandler = {
  execute: async ({ game, player, playerId }) => {
    // Check if player is eliminated
    if (player.eliminated) {
      throw new Error('Eliminated players cannot perform actions');
    }

    // Ensure a target is provided for investigate action
    const targetId = game.actionInProgress?.target;
    if (targetId === undefined) {
      throw new Error('Investigate action requires a target player');
    }

    // Check if target is not eliminated
    if (game.players[targetId].eliminated) {
      throw new Error('Cannot investigate an eliminated player');
    }

    // Check if target has any non-revealed cards
    const targetPlayer = game.players[targetId];
    const targetCards = getPlayerCards(game.cards, targetPlayer.id);
    if (targetCards.length === 0) {
      throw new Error('Target player has no cards to investigate');
    }

    const result: ActionResult = {
      logs: [createLog('investigate', player, {
        target: targetPlayer.name,
        targetColor: targetPlayer.color,
        message: GameMessages.claims.investigate
      })],
      actionInProgress: {
        type: 'investigate',
        player: playerId,
        target: targetId,
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
    
    // Handle card selection for investigation
    if (response.type === 'select_card_for_investigation' && response.card) {
      // Make sure this is the target player responding
      if (playerId !== game.actionInProgress.target) {
        throw new Error('Only the targeted player can select a card for investigation');
      }
      
      // Find the card to show
      const playerCards = getPlayerCards(game.cards, player.id);
      const selectedCard = playerCards.find(c => c.name === response.card);
      
      if (!selectedCard) {
        throw new Error('Selected card not found or already revealed');
      }
      
      // Record the investigated card and continue to decision phase
      result.logs = [createLog('system', { name: 'System', color: '#9CA3AF' } as any, {
        message: `${player.name} shows a card to ${actionPlayer.name}.`
      })];
      
      result.actionInProgress = {
        ...game.actionInProgress,
        investigateCard: {
          cardId: selectedCard.id,
          cardIndex: game.cards.indexOf(selectedCard)
        }
      };
      
      return result;
    }
    
    // Handle Inquisitor's decision after seeing the card
    if (response.type === 'investigate_decision' && playerId === game.actionInProgress.player) {
      // Make sure we have an investigate card
      if (!game.actionInProgress.investigateCard) {
        throw new Error('No card has been selected for investigation');
      }
      
      const targetId = game.actionInProgress.target!;
      const targetPlayer = game.players[targetId];
      const investigateCard = game.actionInProgress.investigateCard;
      const keepCard = response.keepCard === true;
      
      if (keepCard) {
        // If Inquisitor lets target keep the card
        result.logs = [createLog('investigate-result', player, {
          target: targetPlayer.name,
          targetColor: targetPlayer.color,
          message: GameMessages.results.investigateKeep(targetPlayer.name)
        })];
      } else {
        // If Inquisitor wants to swap the card
        // Draw a new card from the deck
        const updatedCards = drawCards(game.cards, 1, 'investigate');
        const drawnCard = updatedCards.find(c => c.location === 'investigate');
        
        if (!drawnCard) {
          result.logs = [createLog('system', { name: 'System', color: '#9CA3AF' } as any, {
            message: `No cards left in the deck for swap. Card remains unchanged.`
          })];
          
          result.actionInProgress = null;
          
          // Get next turn and reset actionUsedThisTurn flag
          const nextTurn = advanceToNextTurn(game.players, game.currentTurn);
          result.currentTurn = nextTurn.currentTurn;
          result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
          
          return result;
        }
        
        // Return the old card to the deck
        const cardsWithReturnedCard = returnCardsToDeck(updatedCards, [investigateCard.cardId]);
        
        // Give the new card to the target player
        const finalCards = cardsWithReturnedCard.map(card => 
          card.id === drawnCard.id ? {
            ...card,
            playerId: targetPlayer.id,
            location: 'player'
          } : card
        );
        
        result.cards = finalCards;
        result.logs = [createLog('investigate-result', player, {
          target: targetPlayer.name,
          targetColor: targetPlayer.color,
          message: GameMessages.results.investigateSwap(targetPlayer.name)
        })];
      }
      
      // Update the game state
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

      // Only the action player should replace their revealed card and continue investigation
      // This happens when:
      // 1. They were challenged about having Inquisitor
      // 2. They revealed Inquisitor (proved they had it)
      // 3. The challenger lost influence
      console.log("LOSE_INFLUENCE DEBUG: Checking if action player needs to replace revealed card");
      console.log("LOSE_INFLUENCE DEBUG: losingPlayer:", game.actionInProgress.losingPlayer);
      console.log("LOSE_INFLUENCE DEBUG: actionPlayer:", game.actionInProgress.player);
      console.log("LOSE_INFLUENCE DEBUG: current player:", playerId);
      console.log("LOSE_INFLUENCE DEBUG: challengeDefense:", game.actionInProgress.challengeDefense);
      console.log("LOSE_INFLUENCE DEBUG: revealedInquisitorCardId:", game.actionInProgress.revealedInquisitorCardId);
      
      if (game.actionInProgress.losingPlayer !== undefined &&  // Someone lost influence
          game.actionInProgress.losingPlayer !== game.actionInProgress.player && // Not the action player
          playerId === game.actionInProgress.player && // This player is the action player
          game.actionInProgress.challengeDefense) { // The action player successfully defended
        
        // Find the Inquisitor card to replace
        // Note: We need to find the card that is still marked as "player" but is revealed
        console.log("INVESTIGATE DEBUG - ACTION PLAYER: Finding Inquisitor card to replace");
        
        let inquisitorCard;
        
        // First try using the stored ID if available
        if (game.actionInProgress.revealedInquisitorCardId) {
          console.log("INVESTIGATE DEBUG - ACTION PLAYER: Using stored Inquisitor card ID");
          inquisitorCard = updatedCards.find(c => c.id === game.actionInProgress.revealedInquisitorCardId);
        }
        
        // Fallback to searching for the card
        if (!inquisitorCard) {
          console.log("INVESTIGATE DEBUG - ACTION PLAYER: Falling back to search for Inquisitor card");
          inquisitorCard = updatedCards.find(
            c => c.playerId === player.id && 
            c.location === 'player' && 
            c.revealed === true && 
            c.name === 'Inquisitor'
          );
        }
        
        console.log("INVESTIGATE DEBUG - ACTION PLAYER: Found inquisitor card:", inquisitorCard);
        
        if (inquisitorCard) {
          // Replace the revealed Inquisitor card
          const cardsAfterReplacement = replaceCard(updatedCards, inquisitorCard.id);
          result.cards = cardsAfterReplacement;
          
          // Resume with the original action
          result.logs.push(createLog('system', { name: 'System', color: '#9CA3AF' } as any, {
            message: `${actionPlayer.name} will now continue with the Investigate action.`
          }));
          
          // Reset action state for investigation - we need to clear all responses and any challenge state
          // BUT we need to preserve the target for the investigation to continue
          result.actionInProgress = {
            type: 'investigate',
            player: game.actionInProgress.player,
            target: game.actionInProgress.target,
            responses: { 
              // Add automatic allow response for the target to proceed immediately to card selection
              [game.actionInProgress.target!]: { type: 'allow' }
            },
            resolved: false
          };
          
          return result;
        }
      }
      
      // If this is the challenger who lost influence (failed challenge)
      // We need to trigger the action player to finish the investigate action
      if (game.actionInProgress.losingPlayer === playerId &&
          playerId !== game.actionInProgress.player) {
        // Already revealed the card above - now the Inquisitor player should proceed with investigation
        const actionPlayer = game.players[game.actionInProgress.player];
        const targetPlayer = game.players[game.actionInProgress.target ?? 0];
        
        // Find the Inquisitor card to replace
        // Note: We need to find the card that is still marked as "player" but is revealed
        console.log("INVESTIGATE DEBUG: Finding Inquisitor card to replace");
        console.log("INVESTIGATE DEBUG: Revealed Inquisitor ID:", game.actionInProgress.revealedInquisitorCardId);
        
        let inquisitorCard;
        
        // First try using the stored ID if available
        if (game.actionInProgress.revealedInquisitorCardId) {
          console.log("INVESTIGATE DEBUG: Using stored Inquisitor card ID");
          inquisitorCard = updatedCards.find(c => c.id === game.actionInProgress.revealedInquisitorCardId);
        }
        
        // Fallback to searching for the card
        if (!inquisitorCard) {
          console.log("INVESTIGATE DEBUG: Falling back to search for Inquisitor card");
          inquisitorCard = updatedCards.find(
            c => c.playerId === actionPlayer.id && 
            c.location === 'player' && 
            c.revealed === true && 
            c.name === 'Inquisitor'
          );
        }
        
        console.log("INVESTIGATE DEBUG: Found inquisitor card:", inquisitorCard);
        
        // Check if the target player has at least one card to investigate
        const targetPlayerCards = getPlayerCards(updatedCards, targetPlayer.id);
        const targetHasCards = targetPlayerCards.length > 0;
        
        // Only proceed with investigation if target player still has cards
        if (!targetHasCards) {
          // Target player has no cards to investigate, end the action
          result.logs.push(createLog('system', { name: 'System', color: '#9CA3AF' } as any, {
            message: `${targetPlayer.name} has no cards to investigate.`
          }));
          
          result.actionInProgress = null;
          
          // Get next turn and reset actionUsedThisTurn flag
          const nextTurn = advanceToNextTurn(game.players, game.currentTurn);
          result.currentTurn = nextTurn.currentTurn;
          result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
          
          return result;
        }
        
        if (inquisitorCard) {
          // Replace the revealed Inquisitor card
          const cardsAfterReplacement = replaceCard(updatedCards, inquisitorCard.id);
          result.cards = cardsAfterReplacement;
          
          // The investigation can now continue - target player will select a card
          result.logs.push(createLog('system', { name: 'System', color: '#9CA3AF' } as any, {
            message: `${actionPlayer.name} will now continue with the investigation.`
          }));
          
          // Reset action state for investigation phase - without losingPlayer field
          result.actionInProgress = {
            type: game.actionInProgress.type,
            player: game.actionInProgress.player,
            target: game.actionInProgress.target,
            responses: {
              // Add automatic allow response for the target to proceed immediately to card selection
              [game.actionInProgress.target!]: { type: 'allow' }
            },
            resolved: false
          };
        } else {
          // No Inquisitor card found (shouldn't happen)
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
      // No investigation happens
      result.actionInProgress = null;
      
      // Get next turn and reset actionUsedThisTurn flag
      const nextTurn = advanceToNextTurn(game.players, game.currentTurn);
      result.currentTurn = nextTurn.currentTurn;
      result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
      
      return result;
    }

    // Handle challenge for investigate action
    if (response.type === 'challenge') {
      const actionPlayer = game.players[game.actionInProgress.player];
      const hasInquisitor = hasCardType(game.cards, actionPlayer.id, 'Inquisitor');

      if (hasInquisitor) {
        // For debugging
        console.log("CHALLENGE DEBUG: Player has Inquisitor, revealing card");
        
        // Find the Inquisitor card to reveal - it must be revealed when successfully defending
        const inquisitorCard = game.cards.find(
          c => c.playerId === actionPlayer.id && 
          c.location === 'player' && 
          !c.revealed && 
          c.name === 'Inquisitor'
        );
        
        console.log("CHALLENGE DEBUG: Found Inquisitor card:", inquisitorCard);
        
        if (inquisitorCard) {
          // Reveal the Inquisitor card
          const updatedCardsWithReveal = revealCard(game.cards, inquisitorCard.id);
          result.cards = updatedCardsWithReveal;
        }
        
        // Challenge fails, challenger loses influence
        result.logs = [createLog('challenge-fail', player, {
          target: actionPlayer.name,
          targetColor: actionPlayer.color,
          message: GameMessages.challenges.failInquisitor
        })];

        result.actionInProgress = {
          ...game.actionInProgress,
          losingPlayer: playerId,
          challengeInProgress: true,
          challengeDefense: true,
          revealedInquisitorCardId: inquisitorCard?.id, // Store the ID of the revealed Inquisitor card
          responses: updatedResponses
        };
      } else {
        // Challenge succeeds, Inquisitor player loses influence
        result.logs = [createLog('challenge-success', player, {
          target: actionPlayer.name,
          targetColor: actionPlayer.color,
          message: GameMessages.challenges.succeedInquisitor
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

      // Check if all other non-eliminated players (except the target and action player) have allowed
      const otherPlayers = game.players.filter((p, index) => 
        index !== game.actionInProgress!.player && 
        index !== game.actionInProgress!.target && 
        !p.eliminated
      );
      
      // If this is the target player allowing
      if (playerId === game.actionInProgress.target) {
        result.logs = [createLog('system', { name: 'System', color: '#9CA3AF' } as any, {
          message: `${player.name} selecting a card to show.`
        })];
        
        // Clear all responses and move to card selection phase
        result.actionInProgress = {
          ...game.actionInProgress,
          responses: {
            [playerId]: { type: 'allow' }
          }
        };
        
        return result;
      }

      return result;
    }

    return result;
  }
};

export const swapAction: ActionHandler = {
  execute: async ({ game, player, playerId }) => {
    // Check if player is eliminated
    if (player.eliminated) {
      throw new Error('Eliminated players cannot perform actions');
    }

    const result: ActionResult = {
      logs: [createLog('swap', player, {
        message: GameMessages.claims.swap
      })],
      actionInProgress: {
        type: 'swap',
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
    
    // Handle swap selection
    if (response.type === 'exchange_selection' && response.selectedIndices) {
      // Make sure this is the player who initiated the swap
      if (playerId !== game.actionInProgress.player) {
        throw new Error('Only the player who initiated the swap can select cards');
      }
      
      // Make sure we have swap cards available
      if (!game.actionInProgress.exchangeCards) {
        throw new Error('No swap cards available');
      }
      
      // Get all available cards (player's non-revealed cards + drawn cards)
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
      
      // Update kept cards to be player's cards
      let updatedCards = [...game.cards];
      keptCardIds.forEach(cardId => {
        const cardIndex = updatedCards.findIndex(c => c.id === cardId);
        if (cardIndex !== -1) {
          updatedCards[cardIndex] = {
            ...updatedCards[cardIndex],
            playerId: actionPlayer.id,
            location: 'player'
          };
        }
      });
      
      // Return unchosen cards to deck
      updatedCards = returnCardsToDeck(updatedCards, returnCardIds);
      
      // Log the swap completion
      result.logs = [createLog('swap-complete', player, {
        message: GameMessages.results.swapComplete
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

      // Only the action player should replace their revealed card and draw for swap
      // This happens when:
      // 1. They were challenged about having Inquisitor
      // 2. They revealed Inquisitor (proved they had it)
      // 3. The challenger lost influence
      if (game.actionInProgress.losingPlayer !== undefined &&  // Someone lost influence
          game.actionInProgress.losingPlayer !== game.actionInProgress.player && // Not the action player
          playerId === game.actionInProgress.player && // This player is the action player
          game.actionInProgress.challengeDefense) { // The action player successfully defended
        
        // Find the card that matches the claim (Inquisitor)
        // Note: We need to find the card that is still marked as "player" but is revealed
        let inquisitorCard;
        
        // First try using the stored ID if available
        if (game.actionInProgress.revealedInquisitorCardId) {
          inquisitorCard = updatedCards.find(c => c.id === game.actionInProgress.revealedInquisitorCardId);
        }
        
        // Fallback to searching for the card
        if (!inquisitorCard) {
          inquisitorCard = updatedCards.find(
            c => c.playerId === player.id && 
            c.location === 'player' && 
            c.revealed === true && 
            c.name === 'Inquisitor'
          );
        }
        
        if (inquisitorCard) {
          // Replace the Inquisitor card
          const cardsAfterReplacement = replaceCard(updatedCards, inquisitorCard.id);
          result.cards = cardsAfterReplacement;
          
          // Draw 1 card for swap
          const cardsWithExchange = drawCards(updatedCards, 1, 'exchange');
          const drawnCardIds = cardsWithExchange
            .filter(c => c.location === 'exchange')
            .map(c => c.id);
          
          result.logs.push(createLog('system', { name: 'System', color: '#9CA3AF' } as any, {
            message: `${actionPlayer.name} will now swap cards.`
          }));
          
          // Reset action state for swap phase
          const { losingPlayer, challengeInProgress, challengeDefense, ...restActionProps } = game.actionInProgress;
          
          result.actionInProgress = {
            ...restActionProps,
            exchangeCards: drawnCardIds,
            responses: {} // Clear responses for swap phase
          };
          
          result.cards = cardsWithExchange;
          return result;
        }
      }
      
      // If this is the challenger who lost influence (failed challenge)
      // We need to trigger the action player to finish the swap action
      if (game.actionInProgress.losingPlayer === playerId &&
          playerId !== game.actionInProgress.player) {
        // Already revealed the card above - now the Inquisitor player should proceed with swap
        const actionPlayer = game.players[game.actionInProgress.player];
        
        // Find the Inquisitor card to replace
        let inquisitorCard;
        
        // First try using the stored ID if available
        if (game.actionInProgress.revealedInquisitorCardId) {
          inquisitorCard = updatedCards.find(c => c.id === game.actionInProgress.revealedInquisitorCardId);
        }
        
        // Fallback to searching for the card
        if (!inquisitorCard) {
          inquisitorCard = updatedCards.find(
            c => c.playerId === actionPlayer.id && 
            c.location === 'player' && 
            c.revealed === true && 
            c.name === 'Inquisitor'
          );
        }
        
        if (inquisitorCard) {
          // Replace the revealed Inquisitor card
          const cardsAfterReplacement = replaceCard(updatedCards, inquisitorCard.id);
          result.cards = cardsAfterReplacement;
          
          // Draw 1 card for swap
          const cardsWithExchange = drawCards(cardsAfterReplacement, 1, 'exchange');
          const drawnCardIds = cardsWithExchange
            .filter(c => c.location === 'exchange')
            .map(c => c.id);
          
          result.logs.push(createLog('system', { name: 'System', color: '#9CA3AF' } as any, {
            message: `${actionPlayer.name} will now swap cards.`
          }));
          
          // Reset action state for swap phase - without losingPlayer field
          result.actionInProgress = {
            type: game.actionInProgress.type,
            player: game.actionInProgress.player,
            exchangeCards: drawnCardIds,
            responses: {},
            resolved: false
          };
          
          result.cards = cardsWithExchange;
        } else {
          // No Inquisitor card found (shouldn't happen)
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
      // No swap happens
      result.actionInProgress = null;
      
      // Get next turn and reset actionUsedThisTurn flag
      const nextTurn = advanceToNextTurn(game.players, game.currentTurn);
      result.currentTurn = nextTurn.currentTurn;
      result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
      
      return result;
    }

    // Handle challenge for swap action
    if (response.type === 'challenge') {
      const actionPlayer = game.players[game.actionInProgress.player];
      const hasInquisitor = hasCardType(game.cards, actionPlayer.id, 'Inquisitor');

      if (hasInquisitor) {
        // For debugging
        console.log("SWAP CHALLENGE DEBUG: Player has Inquisitor, revealing card");
        
        // Find the Inquisitor card to reveal - it must be revealed when successfully defending
        const inquisitorCard = game.cards.find(
          c => c.playerId === actionPlayer.id && 
          c.location === 'player' && 
          !c.revealed && 
          c.name === 'Inquisitor'
        );
        
        console.log("SWAP CHALLENGE DEBUG: Found Inquisitor card:", inquisitorCard);
        
        if (inquisitorCard) {
          // Reveal the Inquisitor card
          const updatedCardsWithReveal = revealCard(game.cards, inquisitorCard.id);
          result.cards = updatedCardsWithReveal;
        }
        
        // Challenge fails, challenger loses influence
        result.logs = [createLog('challenge-fail', player, {
          target: actionPlayer.name,
          targetColor: actionPlayer.color,
          message: GameMessages.challenges.failInquisitor
        })];

        result.actionInProgress = {
          ...game.actionInProgress,
          losingPlayer: playerId,
          challengeInProgress: true,
          challengeDefense: true,
          revealedInquisitorCardId: inquisitorCard?.id, // Store the ID of the revealed Inquisitor card
          responses: updatedResponses
        };
      } else {
        // Challenge succeeds, Inquisitor player loses influence
        result.logs = [createLog('challenge-success', player, {
          target: actionPlayer.name,
          targetColor: actionPlayer.color,
          message: GameMessages.challenges.succeedInquisitor
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
        // Draw 1 card for the swap
        const updatedCards = drawCards(game.cards, 1, 'exchange');
        const drawnCardIds = updatedCards
          .filter(c => c.location === 'exchange')
          .map(c => c.id);
        
        result.logs = [createLog('system', { name: 'System', color: '#9CA3AF' } as any, {
          message: `Swap allowed. ${actionPlayer.name} selecting cards.`
        })];
        
        // Set up for swap phase
        result.actionInProgress = {
          ...game.actionInProgress,
          exchangeCards: drawnCardIds,
          responses: {} // Clear responses for swap phase
        };
        
        result.cards = updatedCards;
      }

      return result;
    }

    return result;
  }
};