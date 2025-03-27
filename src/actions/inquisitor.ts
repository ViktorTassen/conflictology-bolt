import { ActionHandler, ActionResponse, ActionResult, createLog, advanceToNextTurn, applyInfluenceLoss, verifyPlayerHasRole, replaceRevealedCard, validateCardCounts } from './types';
import { GameMessages } from '../messages';
import { CardType, Player } from '../types';

// Inquisitor has two main actions:
// 1. Investigate: Look at another player's card and decide to keep or swap it
// 2. Swap: Similar to Ambassador's exchange but with 1 card

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
    const targetHasCards = targetPlayer.influence.some(i => !i.revealed);
    if (!targetHasCards) {
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

    // If we have a target, get their information
    let targetPlayer: Player | undefined;
    let targetPlayerId: number | undefined;
    if (game.actionInProgress.target !== undefined) {
      targetPlayerId = game.actionInProgress.target;
      targetPlayer = game.players[targetPlayerId];
    }
    
    // Handle card selection for investigation
    if (response.type === 'select_card_for_investigation' && response.card && targetPlayerId !== undefined && playerId === targetPlayerId) {
      // Make sure this is the target player responding
      if (playerId !== game.actionInProgress.target) {
        throw new Error('Only the targeted player can select a card for investigation');
      }
      
      // Find the index of the card the player wants to show
      const cardIndex = player.influence.findIndex(i => !i.revealed && i.card === response.card);
      if (cardIndex === -1) {
        throw new Error('Selected card not found or already revealed');
      }
      
      // Record the investigated card and continue to decision phase
      result.logs = [createLog('system', { name: 'System', color: '#9CA3AF' } as any, {
        message: `${player.name} shows a card to ${actionPlayer.name}.`
      })];
      
      result.actionInProgress = {
        ...game.actionInProgress,
        investigateCard: {
          card: response.card,
          cardIndex: cardIndex
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
      
      const updatedPlayers = [...game.players];
      
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
        if (game.deck.length === 0) {
          result.logs = [createLog('system', { name: 'System', color: '#9CA3AF' } as any, {
            message: `No cards left in the deck for swap. Card remains unchanged.`
          })];
          
          result.actionInProgress = null;
          result.players = updatedPlayers;
          
          // Get next turn and reset actionUsedThisTurn flag
          const nextTurn = advanceToNextTurn(updatedPlayers, game.currentTurn);
          result.currentTurn = nextTurn.currentTurn;
          result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
          
          return result;
        }
        
        // Get the card to be replaced
        const cardToReplace = targetPlayer.influence[investigateCard.cardIndex].card;
        
        // Validate card counts and correct the deck if needed
        const validationLogs = validateCardCounts(game);
        if (validationLogs.length > 0) {
          // Add validation logs to the result
          result.logs = [...validationLogs, ...result.logs];
        }
        
        // Count occurrences of this card type in the game
        const countInDeck = game.deck.filter(c => c === cardToReplace).length;
        const countInHands = game.players.reduce((count, p) => 
          count + p.influence.filter(i => i.card === cardToReplace).length, 0
        );
        
        // Only add the card back if it wouldn't exceed the limit of 3 per type
        if (countInDeck + countInHands < 3) {
          game.deck.push(cardToReplace);
        } else {
          result.logs.push(createLog('system', { name: 'System', color: '#9CA3AF' } as any, {
            message: `Card ${cardToReplace} already has 3 copies in play. Not returning to deck.`
          }));
        }
        
        // Shuffle the deck thoroughly using Fisher-Yates
        for (let i = game.deck.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [game.deck[i], game.deck[j]] = [game.deck[j], game.deck[i]];
        }
        
        // Make sure the deck is thoroughly shuffled before drawing the new card
        // Shuffle the deck again to ensure randomness
        for (let i = game.deck.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [game.deck[i], game.deck[j]] = [game.deck[j], game.deck[i]];
        }
        
        // Draw a new card for the target player
        const newCard = game.deck.pop()!;
        updatedPlayers[targetId].influence[investigateCard.cardIndex].card = newCard;
        
        // Log the swap
        result.logs = [createLog('investigate-result', player, {
          target: targetPlayer.name,
          targetColor: targetPlayer.color,
          message: GameMessages.results.investigateSwap(targetPlayer.name)
        })];
      }
      
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
        
        // Replace the revealed Inquisitor card
        const replaceResult = replaceRevealedCard(
          updatedPlayers[game.actionInProgress.player],
          'Inquisitor',
          updatedGame
        );
        result.logs = result.logs.concat(replaceResult.logs);
        
        // Resume with the original action
        result.logs.push(createLog('system', { name: 'System', color: '#9CA3AF' } as any, {
          message: `${actionPlayer.name} will now continue with the Investigate action.`
        }));
        
        // Reset action state for investigation
        const { losingPlayer, challengeInProgress, challengeDefense, ...restActionProps } = game.actionInProgress;
        
        result.actionInProgress = {
          ...restActionProps,
          responses: {} // Clear responses for investigation phase
        };
        
        result.players = updatedPlayers;
        
        return result;
      }
      
      // Action player lost influence (successful challenge)
      // No investigation happens
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
      const hasInquisitor = verifyPlayerHasRole(actionPlayer, 'Inquisitor');

      if (hasInquisitor) {
        // Challenge fails, challenger loses influence
        result.logs = [createLog('challenge-fail', player, {
          target: actionPlayer.name,
          targetColor: actionPlayer.color,
          message: `challenges Inquisitor claim! Fails`
        })];

        result.actionInProgress = {
          ...game.actionInProgress,
          losingPlayer: playerId,
          challengeInProgress: true,
          challengeDefense: true,
          responses: updatedResponses
        };
      } else {
        // Challenge succeeds, Inquisitor player loses influence
        result.logs = [createLog('challenge-success', player, {
          target: actionPlayer.name,
          targetColor: actionPlayer.color,
          message: `challenges Inquisitor claim! Success`
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
    
    // Handle swap selection (similar to exchange_selection)
    if (response.type === 'exchange_selection' && response.selectedIndices) {
      // Make sure this is the player who initiated the swap
      if (playerId !== game.actionInProgress.player) {
        throw new Error('Only the player who initiated the swap can select cards');
      }
      
      // Make sure we have swap cards available
      if (!game.actionInProgress.exchangeCards) {
        throw new Error('No swap cards available');
      }
      
      // Process the swap (similar to exchange)
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
      
      // Log the swap completion
      result.logs = [createLog('swap-complete', player, {
        message: GameMessages.results.swapComplete
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
        
        // Replace the revealed Inquisitor card
        const replaceResult = replaceRevealedCard(
          updatedPlayers[game.actionInProgress.player],
          'Inquisitor',
          updatedGame
        );
        result.logs = result.logs.concat(replaceResult.logs);
        
        // Set up for swap phase
        // Ensure the deck is properly shuffled before drawing
        // Shuffle the deck thoroughly using Fisher-Yates
        for (let i = game.deck.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [game.deck[i], game.deck[j]] = [game.deck[j], game.deck[i]];
        }
        
        // Draw 1 card from the deck for swap
        const drawnCards = game.deck.splice(0, 1);
        
        if (drawnCards.length < 1) {
          // Not enough cards in deck
          result.logs.push(createLog('system', { name: 'System', color: '#9CA3AF' } as any, {
            message: `Not enough cards in the deck for swap. Swap canceled.`
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
          message: `${actionPlayer.name} will now swap cards.`
        }));
        
        // Reset action state for swap phase
        const { losingPlayer, challengeInProgress, challengeDefense, ...restActionProps } = game.actionInProgress;
        
        result.actionInProgress = {
          ...restActionProps,
          exchangeCards: drawnCards,
          responses: {} // Clear responses for swap phase
        };
        
        result.players = updatedPlayers;
        return result;
      }
      
      // Action player lost influence (successful challenge)
      // No swap happens
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
      const hasInquisitor = verifyPlayerHasRole(actionPlayer, 'Inquisitor');

      if (hasInquisitor) {
        // Challenge fails, challenger loses influence
        result.logs = [createLog('challenge-fail', player, {
          target: actionPlayer.name,
          targetColor: actionPlayer.color,
          message: `challenges Inquisitor claim! Fails`
        })];

        result.actionInProgress = {
          ...game.actionInProgress,
          losingPlayer: playerId,
          challengeInProgress: true,
          challengeDefense: true,
          responses: updatedResponses
        };
      } else {
        // Challenge succeeds, Inquisitor player loses influence
        result.logs = [createLog('challenge-success', player, {
          target: actionPlayer.name,
          targetColor: actionPlayer.color,
          message: `challenges Inquisitor claim! Success`
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
        // All players allowed - process swap action
        // Ensure the deck is properly shuffled before drawing
        // Shuffle the deck thoroughly using Fisher-Yates
        for (let i = game.deck.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [game.deck[i], game.deck[j]] = [game.deck[j], game.deck[i]];
        }
        
        // Draw 1 card for the swap
        const drawnCards = game.deck.splice(0, 1);
        
        result.logs = [createLog('system', { name: 'System', color: '#9CA3AF' } as any, {
          message: `Swap allowed. ${actionPlayer.name} selecting cards.`
        })];
        
        // Set up for swap phase
        result.actionInProgress = {
          ...game.actionInProgress,
          exchangeCards: drawnCards,
          responses: {} // Clear responses for swap phase
        };
        
        result.players = [...game.players];
      }

      return result;
    }

    return result;
  }
};