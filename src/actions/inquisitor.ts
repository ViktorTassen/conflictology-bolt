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
      if (game.actionInProgress.losingPlayer !== undefined &&  
          game.actionInProgress.losingPlayer !== game.actionInProgress.player && 
          playerId === game.actionInProgress.player && 
          game.actionInProgress.challengeDefense) {
        
        // Inquisitor card was already replaced during the challenge
        console.log("INVESTIGATE DEBUG - ACTION PLAYER: Inquisitor card was already replaced during challenge");
          
        // Resume with the original action
        result.logs.push(createLog('system', { name: 'System', color: '#9CA3AF' } as any, {
          message: `${actionPlayer.name} will now continue with the Investigate action.`
        }));
          
        // Reset action state for investigation
        result.actionInProgress = {
          type: 'investigate',
          player: game.actionInProgress.player,
          target: game.actionInProgress.target,
          responses: { 
            [game.actionInProgress.target!]: { type: 'allow' }
          },
          resolved: false
        };
          
        return result;
      }
      
      // If this is the challenger who lost influence (failed challenge)
      if (game.actionInProgress.losingPlayer === playerId &&
          playerId !== game.actionInProgress.player) {
        // The Inquisitor card was already replaced during the challenge
        const targetPlayer = game.players[game.actionInProgress.target ?? 0];
        
        console.log("INVESTIGATE DEBUG: Inquisitor card was already replaced during challenge");
        
        // Check if the target player has at least one card to investigate
        const targetPlayerCards = getPlayerCards(updatedCards, targetPlayer.id);
        const targetHasCards = targetPlayerCards.length > 0;
        
        // Only proceed with investigation if target player still has cards
        if (!targetHasCards) {
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
        
        // The investigation can now continue - target player will select a card
        result.logs.push(createLog('system', { name: 'System', color: '#9CA3AF' } as any, {
          message: `${actionPlayer.name} will now continue with the investigation.`
        }));
          
        // Reset action state for investigation phase
        result.actionInProgress = {
          type: game.actionInProgress.type,
          player: game.actionInProgress.player,
          target: game.actionInProgress.target,
          responses: {
            [game.actionInProgress.target!]: { type: 'allow' }
          },
          resolved: false
        };
        
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
        console.log("CHALLENGE DEBUG: Player has Inquisitor, revealing card");
        
        const inquisitorCard = game.cards.find(
          c => c.playerId === actionPlayer.id && 
          c.location === 'player' && 
          !c.revealed && 
          c.name === 'Inquisitor'
        );
        
        console.log("CHALLENGE DEBUG: Found Inquisitor card:", inquisitorCard);
        
        if (inquisitorCard) {
          const updatedCardsWithReveal = revealCard(game.cards, inquisitorCard.id);
          const cardsAfterReplacement = replaceCard(updatedCardsWithReveal, inquisitorCard.id);
          result.cards = cardsAfterReplacement;
        }
        
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
          revealedInquisitorCardId: inquisitorCard?.id,
          responses: updatedResponses
        };
      } else {
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

      if (playerId === game.actionInProgress.target) {
        result.logs = [createLog('system', { name: 'System', color: '#9CA3AF' } as any, {
          message: `${player.name} selecting a card to show.`
        })];
        
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
      if (playerId !== game.actionInProgress.player) {
        throw new Error('Only the player who initiated the swap can select cards');
      }
      
      if (!game.actionInProgress.exchangeCards) {
        throw new Error('No swap cards available');
      }
      
      const playerCards = getPlayerCards(game.cards, actionPlayer.id);
      const exchangeCards = game.cards.filter(c => 
        game.actionInProgress!.exchangeCards!.includes(c.id)
      );
      
      const availableCards = [...playerCards, ...exchangeCards];
      
      if (response.selectedIndices.length !== playerCards.length) {
        throw new Error(`Must select ${playerCards.length} cards to keep`);
      }
      
      const keptCardIds = response.selectedIndices.map(idx => availableCards[idx].id);
      const returnCardIds = availableCards
        .filter(card => !keptCardIds.includes(card.id))
        .map(card => card.id);
      
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
      
      updatedCards = returnCardsToDeck(updatedCards, returnCardIds);
      
      result.logs = [createLog('swap-complete', player, {
        message: GameMessages.results.swapComplete
      })];
      
      result.cards = updatedCards;
      result.actionInProgress = null;
      
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
      const playerCards = getPlayerCards(game.cards, player.id);
      
      if (playerCards.length === 0) {
        const updatedPlayers = [...game.players];
        updatedPlayers[playerId].eliminated = true;
        
        result.logs = [createLog('system', { name: 'System', color: '#9CA3AF' } as any, {
          message: `${player.name} has no more cards to lose.`
        })];
        
        result.players = updatedPlayers;
        result.actionInProgress = null;
        
        const nextTurn = advanceToNextTurn(updatedPlayers, game.currentTurn);
        result.currentTurn = nextTurn.currentTurn;
        result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
        
        return result;
      }

      let cardToReveal = response.card ? 
        playerCards.find(c => c.name === response.card) : 
        playerCards[0];

      if (!cardToReveal) {
        cardToReveal = playerCards[0];
      }

      const updatedCards = revealCard(game.cards, cardToReveal.id);
      result.cards = updatedCards;
      result.logs = [createLog('lose-influence', player)];
      
      const remainingCards = getPlayerCards(updatedCards, player.id);
      if (remainingCards.length === 0) {
        const updatedPlayers = [...game.players];
        updatedPlayers[playerId].eliminated = true;
        result.players = updatedPlayers;
        result.logs.push(createSystemLog(GameMessages.system.noMoreCards(player.name)));
      }

      if (game.actionInProgress.losingPlayer !== undefined &&  
          game.actionInProgress.losingPlayer !== game.actionInProgress.player && 
          playerId === game.actionInProgress.player && 
          game.actionInProgress.challengeDefense) {
        
        const cardsWithExchange = drawCards(updatedCards, 1, 'exchange');
        const drawnCardIds = cardsWithExchange
          .filter(c => c.location === 'exchange')
          .map(c => c.id);
        
        result.logs.push(createLog('system', { name: 'System', color: '#9CA3AF' } as any, {
          message: `${actionPlayer.name} will now swap cards.`
        }));
        
        const { losingPlayer, challengeInProgress, challengeDefense, ...restActionProps } = game.actionInProgress;
        
        result.actionInProgress = {
          ...restActionProps,
          exchangeCards: drawnCardIds,
          responses: {}
        };
        
        result.cards = cardsWithExchange;
        return result;
      }
      
      if (game.actionInProgress.losingPlayer === playerId &&
          playerId !== game.actionInProgress.player) {
        const cardsWithExchange = drawCards(updatedCards, 1, 'exchange');
        const drawnCardIds = cardsWithExchange
          .filter(c => c.location === 'exchange')
          .map(c => c.id);
        
        result.logs.push(createLog('system', { name: 'System', color: '#9CA3AF' } as any, {
          message: `${actionPlayer.name} will now swap cards.`
        }));
        
        result.actionInProgress = {
          type: game.actionInProgress.type,
          player: game.actionInProgress.player,
          exchangeCards: drawnCardIds,
          responses: {},
          resolved: false
        };
        
        result.cards = cardsWithExchange;
        return result;
      }
      
      result.actionInProgress = null;
      
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
        console.log("SWAP CHALLENGE DEBUG: Player has Inquisitor, revealing card");
        
        const inquisitorCard = game.cards.find(
          c => c.playerId === actionPlayer.id && 
          c.location === 'player' && 
          !c.revealed && 
          c.name === 'Inquisitor'
        );
        
        console.log("SWAP CHALLENGE DEBUG: Found Inquisitor card:", inquisitorCard);
        
        if (inquisitorCard) {
          const updatedCardsWithReveal = revealCard(game.cards, inquisitorCard.id);
          const cardsAfterReplacement = replaceCard(updatedCardsWithReveal, inquisitorCard.id);
          result.cards = cardsAfterReplacement;
        }
        
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
          revealedInquisitorCardId: inquisitorCard?.id,
          responses: updatedResponses
        };
      } else {
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

      const otherPlayers = game.players.filter((p, index) => 
        index !== game.actionInProgress!.player && !p.eliminated
      );
      
      const allResponded = otherPlayers.every(p => {
        const playerIdx = game.players.indexOf(p);
        const hasResponded = updatedResponses[playerIdx] !== undefined;
        return hasResponded;
      });

      const allPlayersAllowed = allResponded && otherPlayers.every(p => {
        const playerIdx = game.players.indexOf(p);
        const response = updatedResponses[playerIdx];
        return response && response.type === 'allow';
      });
      
      if (allPlayersAllowed) {
        const updatedCards = drawCards(game.cards, 1, 'exchange');
        const drawnCardIds = updatedCards
          .filter(c => c.location === 'exchange')
          .map(c => c.id);
        
        result.logs = [createLog('system', { name: 'System', color: '#9CA3AF' } as any, {
          message: `Swap allowed. ${actionPlayer.name} selecting cards.`
        })];
        
        result.actionInProgress = {
          ...game.actionInProgress,
          exchangeCards: drawnCardIds,
          responses: {}
        };
        
        result.cards = updatedCards;
      }

      return result;
    }

    return result;
  }
};