import { ActionHandler, ActionResponse, ActionResult, advanceToNextTurn } from './types';
import { GameMessages } from '../messages';
import { cardService } from '../services/CardService';
import { loggingService } from '../services/LoggingService';
import { GameLogEntry, LogType } from '../types';

export const investigateAction: ActionHandler = {
  execute: async ({ game, player, playerId }) => {
    if (player.eliminated) {
      throw new Error('Eliminated players cannot perform actions');
    }

    const targetId = game.actionInProgress?.target;
    if (targetId === undefined) {
      throw new Error('Investigate requires a target');
    }

    if (game.players[targetId].eliminated) {
      throw new Error('Cannot investigate an eliminated player');
    }

    const targetPlayer = game.players[targetId];
    const targetCards = cardService.getPlayerCards(game.cards, targetPlayer.id);
    if (targetCards.length === 0) {
      throw new Error('Target player has no cards to investigate');
    }

    const result: ActionResult = {
      logs: [loggingService.createLog('investigate', player, {
        target: targetPlayer.name,
        targetColor: targetPlayer.color,
        targetId: targetId,
        message: GameMessages.actions.investigate,
        playerId: playerId
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

    if (player.eliminated) {
      throw new Error('Eliminated players cannot respond to actions');
    }

    const actionPlayer = game.players[game.actionInProgress.player];
    const result: ActionResult = {};
    
    if (response.type === 'select_card_for_investigation' && response.card) {
      if (playerId !== game.actionInProgress.target) {
        throw new Error('Only the targeted player can select a card for investigation');
      }
      
      const playerCards = cardService.getPlayerCards(game.cards, player.id);
      const selectedCard = playerCards.find(c => c.name === response.card);
      
      if (!selectedCard) {
        throw new Error('Selected card not found or already revealed');
      }
      
      const investigator = game.players[game.actionInProgress.player];
      // Create a custom log for show-card with explicit target player
      const showCardLog: GameLogEntry = {
        type: 'show-card' as LogType,
        player: player.name,
        playerColor: player.color,
        timestamp: Date.now(),
        playerId: playerId,
        targetId: game.actionInProgress.player,
        target: investigator.name,
        targetColor: investigator.color,
        message: `${GameMessages.results.showCard} ${investigator.name}`,
        messageParts: [
          { type: 'text', content: `${GameMessages.results.showCard} ` },
          { type: 'player', content: investigator.name, playerId: game.actionInProgress.player, color: investigator.color }
        ]
      };
      result.logs = [showCardLog];
      
      // Add system message about investigator deciding next
      result.logs.push(loggingService.createSpecificSystemLog('decideInvestigation', {
        playerName: investigator.name
      }));
      
      result.actionInProgress = {
        ...game.actionInProgress,
        investigateCard: {
          cardId: selectedCard.id,
          cardIndex: game.cards.indexOf(selectedCard)
        }
      };
      
      return result;
    }
    
    if (response.type === 'investigate_decision' && playerId === game.actionInProgress.player) {
      if (!game.actionInProgress.investigateCard) {
        throw new Error('No card has been selected for investigation');
      }
      
      const targetId = game.actionInProgress.target!;
      const targetPlayer = game.players[targetId];
      const investigateCard = game.actionInProgress.investigateCard;
      const keepCard = response.keepCard === true;
      
      if (keepCard) {
        // Create a custom log for investigate-result with "keeps their card" message
        const investigateResultLog: GameLogEntry = {
          type: 'investigate-result' as LogType,
          player: player.name,
          playerColor: player.color,
          timestamp: Date.now(),
          playerId: playerId,
          targetId: targetId,
          target: targetPlayer.name,
          targetColor: targetPlayer.color,
          message: `${GameMessages.results.investigateKeep} ${targetPlayer.name} ${GameMessages.results.investigateKeepSuffix}`,
          messageParts: [
            { type: 'text', content: `${GameMessages.results.investigateKeep} ` },
            { type: 'player', content: targetPlayer.name, playerId: targetId, color: targetPlayer.color },
            { type: 'text', content: ` ${GameMessages.results.investigateKeepSuffix}` }
          ]
        };
        result.logs = [investigateResultLog];
      } else {
        const updatedCards = cardService.drawCards(game.cards, 1, 'investigate');
        const drawnCard = updatedCards.find(c => c.location === 'investigate');
        
        const cardsWithReturnedCard = cardService.returnCardsToDeck(updatedCards, [investigateCard.cardId]);
        
        // Find the position of the card being replaced
        const replacedCardPosition = game.cards[investigateCard.cardIndex].position;
        
        const finalCards = cardsWithReturnedCard.map(card => {
          if (drawnCard && card.id === drawnCard.id) {
            return {
              ...card,
              playerId: targetPlayer.id,
              location: 'player' as any,
              revealed: false,
              position: replacedCardPosition // Maintain the same position
            };
          }
          return card;
        });
        
        result.cards = finalCards;
        // Create a custom log for investigate-result with "forces to swap" message
        const investigateSwapLog: GameLogEntry = {
          type: 'investigate-result' as LogType,
          player: player.name,
          playerColor: player.color,
          timestamp: Date.now(),
          playerId: playerId,
          targetId: targetId,
          target: targetPlayer.name,
          targetColor: targetPlayer.color,
          message: `${GameMessages.results.investigateSwap} ${targetPlayer.name} ${GameMessages.results.investigateSwapSuffix}`,
          messageParts: [
            { type: 'text', content: `${GameMessages.results.investigateSwap} ` },
            { type: 'player', content: targetPlayer.name, playerId: targetId, color: targetPlayer.color },
            { type: 'text', content: ` ${GameMessages.results.investigateSwapSuffix}` }
          ]
        };
        result.logs = [investigateSwapLog];
      }
      
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

    if (response.type === 'lose_influence') {
      const playerCards = cardService.getPlayerCards(game.cards, player.id);
      
      if (playerCards.length === 0) {
        const updatedPlayers = [...game.players];
        updatedPlayers[playerId].eliminated = true;
        
        result.logs = [loggingService.createSystemLog(GameMessages.system.playerEliminated(player.name))];
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

      const updatedCards = cardService.revealCard(game.cards, cardToReveal.id);
      result.cards = updatedCards;
      result.logs = [loggingService.createLog('lose-influence', player)];
      
      const remainingCards = cardService.getPlayerCards(updatedCards, player.id);
      if (remainingCards.length === 0) {
        const updatedPlayers = [...game.players];
        updatedPlayers[playerId].eliminated = true;
        result.players = updatedPlayers;
        result.logs.push(loggingService.createSystemLog(GameMessages.system.playerEliminated(player.name)));
      }

      if (game.actionInProgress.losingPlayer !== undefined &&  
          game.actionInProgress.losingPlayer !== game.actionInProgress.player && 
          playerId === game.actionInProgress.player && 
          game.actionInProgress.challengeDefense) {
          
          
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
      
      if (game.actionInProgress.losingPlayer === playerId &&
          playerId !== game.actionInProgress.player) {
        const targetPlayer = game.players[game.actionInProgress.target ?? 0];
        
        const targetPlayerCards = cardService.getPlayerCards(updatedCards, targetPlayer.id);
        const targetHasCards = targetPlayerCards.length > 0;
        
        if (!targetHasCards) {
          result.logs.push(loggingService.createSystemLog(GameMessages.system.playerEliminated(targetPlayer.name)));
          result.actionInProgress = null;
          const nextTurn = advanceToNextTurn(game.players, game.currentTurn);
          result.currentTurn = nextTurn.currentTurn;
          result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
          return result;
        }
        
          
        // Add system message about selecting card to show after losing challenge
        result.logs.push(loggingService.createSpecificSystemLog('selectCardToShow', {
          playerName: targetPlayer.name
        }));
        
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
      
      result.actionInProgress = null;
      const nextTurn = advanceToNextTurn(game.players, game.currentTurn);
      result.currentTurn = nextTurn.currentTurn;
      result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
      
      return result;
    }

    if (response.type === 'challenge') {
      const hasPolice = cardService.hasCardType(game.cards, actionPlayer.id, 'Police');

      if (hasPolice) {
        const policeCard = game.cards.find(
          c => c.playerId === actionPlayer.id && 
          c.location === 'player' && 
          !c.revealed && 
          c.name === 'Police'
        );
        
        if (policeCard) {
          const updatedCardsWithReveal = cardService.revealCard(game.cards, policeCard.id);
          const cardsAfterReplacement = cardService.replaceCard(updatedCardsWithReveal, policeCard.id);
          result.cards = cardsAfterReplacement;
        }
        
        result.logs = [loggingService.createLog('challenge-fail', player, {
          target: actionPlayer.name,
          targetColor: actionPlayer.color,
          message: GameMessages.challenges.fail('Police')
        })];

        result.actionInProgress = {
          ...game.actionInProgress,
          losingPlayer: playerId,
          challengeInProgress: true,
          challengeDefense: true,
          revealedPoliceCardId: policeCard?.id,
          responses: updatedResponses
        };
      } else {
        result.logs = [loggingService.createLog('challenge-success', player, {
          target: actionPlayer.name,
          targetColor: actionPlayer.color,
          message: GameMessages.challenges.success('Police')
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

    if (response.type === 'allow') {
      result.actionInProgress = {
        ...game.actionInProgress,
        responses: updatedResponses
      };

      if (playerId === game.actionInProgress.target) {
        result.logs = [loggingService.createLog('allow', player, {
          target: actionPlayer.name,
          targetColor: actionPlayer.color,
          targetId: game.actionInProgress.player,
          actionType: 'investigate',
          message: GameMessages.responses.allowInvestigation,
          playerId: playerId
        })];
        
        // Add system message about selecting card to show
        result.logs.push(loggingService.createSpecificSystemLog('selectCardToShow', {
          playerName: player.name,
          playerId: playerId
        }));
        
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
  execute: async ({ player, playerId }) => {
    if (player.eliminated) {
      throw new Error('Eliminated players cannot perform actions');
    }

    const result: ActionResult = {
      logs: [loggingService.createLog('swap', player, {
        message: GameMessages.actions.swap,
        playerId: playerId
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

    if (player.eliminated) {
      throw new Error('Eliminated players cannot respond to actions');
    }

    const actionPlayer = game.players[game.actionInProgress.player];
    const result: ActionResult = {};
    
    if (response.type === 'exchange_selection' && response.selectedIndices) {
      if (playerId !== game.actionInProgress.player) {
        throw new Error('Only the player who initiated the swap can select cards');
      }
      
      if (!game.actionInProgress.exchangeCards) {
        throw new Error('No swap cards available');
      }
      
      const playerCards = cardService.getPlayerCards(game.cards, actionPlayer.id);
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
      
      // Track which positions are already filled
      const existingPlayerCards = playerCards.map(card => card.id);
      const newKeptCards = keptCardIds.filter(id => !existingPlayerCards.includes(id));
      const keptExistingCards = keptCardIds.filter(id => existingPlayerCards.includes(id));
      
      // First, handle cards that are already in the player's hand (maintain their positions)
      keptExistingCards.forEach(cardId => {
        // These already have the correct position, just ensure they stay in player's hand
        const cardIndex = updatedCards.findIndex(c => c.id === cardId);
        if (cardIndex !== -1) {
          updatedCards[cardIndex] = {
            ...updatedCards[cardIndex],
            playerId: actionPlayer.id,
            location: 'player'
            // position remains unchanged
          };
        }
      });
      
      // Now assign new cards to positions that aren't filled
      // Get positions that are now available (from cards that were discarded)
      const availablePositions = [0, 1].filter(pos => {
        return !updatedCards.some(card => 
          card.playerId === actionPlayer.id && 
          card.location === 'player' && 
          !card.revealed && 
          keptExistingCards.includes(card.id) && 
          card.position === pos
        );
      });
      
      // Assign new cards to available positions
      newKeptCards.forEach((cardId, index) => {
        if (index < availablePositions.length) {
          const cardIndex = updatedCards.findIndex(c => c.id === cardId);
          if (cardIndex !== -1) {
            updatedCards[cardIndex] = {
              ...updatedCards[cardIndex],
              playerId: actionPlayer.id,
              location: 'player',
              position: availablePositions[index]
            };
          }
        }
      });
      
      updatedCards = cardService.returnCardsToDeck(updatedCards, returnCardIds);
      
      result.logs = [loggingService.createLog('swap-complete', player, {
        message: GameMessages.results.swap,
        playerId: playerId
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

    if (response.type === 'lose_influence') {
      const playerCards = cardService.getPlayerCards(game.cards, player.id);
      
      if (playerCards.length === 0) {
        const updatedPlayers = [...game.players];
        updatedPlayers[playerId].eliminated = true;
        
        result.logs = [loggingService.createSystemLog(GameMessages.system.playerEliminated(player.name))];
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

      const updatedCards = cardService.revealCard(game.cards, cardToReveal.id);
      result.cards = updatedCards;
      result.logs = [loggingService.createLog('lose-influence', player)];
      
      const remainingCards = cardService.getPlayerCards(updatedCards, player.id);
      if (remainingCards.length === 0) {
        const updatedPlayers = [...game.players];
        updatedPlayers[playerId].eliminated = true;
        result.players = updatedPlayers;
        result.logs.push(loggingService.createSystemLog(GameMessages.system.playerEliminated(player.name)));
      }

      if (game.actionInProgress.losingPlayer !== undefined &&  
          game.actionInProgress.losingPlayer !== game.actionInProgress.player && 
          playerId === game.actionInProgress.player && 
          game.actionInProgress.challengeDefense) {
        
        const cardsWithExchange = cardService.drawCards(updatedCards, 1, 'exchange');
        const drawnCardIds = cardsWithExchange
          .filter(c => c.location === 'exchange')
          .map(c => c.id);
        
        // Add system message about selecting a card to swap
        result.logs.push(loggingService.createSpecificSystemLog('swapAllowed', {
          playerName: player.name
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
        const cardsWithExchange = cardService.drawCards(updatedCards, 1, 'exchange');
        const drawnCardIds = cardsWithExchange
          .filter(c => c.location === 'exchange')
          .map(c => c.id);
        
        // Add system message about selecting a card to swap 
        result.logs.push(loggingService.createSpecificSystemLog('swapAllowed', {
          playerName: game.players[game.actionInProgress.player].name
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

    if (response.type === 'challenge') {
      const hasPolice = cardService.hasCardType(game.cards, actionPlayer.id, 'Police');

      if (hasPolice) {
        const policeCard = game.cards.find(
          c => c.playerId === actionPlayer.id && 
          c.location === 'player' && 
          !c.revealed && 
          c.name === 'Police'
        );
        
        if (policeCard) {
          const updatedCardsWithReveal = cardService.revealCard(game.cards, policeCard.id);
          const cardsAfterReplacement = cardService.replaceCard(updatedCardsWithReveal, policeCard.id);
          result.cards = cardsAfterReplacement;
        }
        
        result.logs = [loggingService.createLog('challenge-fail', player, {
          target: actionPlayer.name,
          targetColor: actionPlayer.color,
          message: GameMessages.challenges.fail('Police')
        })];

        result.actionInProgress = {
          ...game.actionInProgress,
          losingPlayer: playerId,
          challengeInProgress: true,
          challengeDefense: true,
          revealedPoliceCardId: policeCard?.id,
          responses: updatedResponses
        };
      } else {
        result.logs = [loggingService.createLog('challenge-success', player, {
          target: actionPlayer.name,
          targetColor: actionPlayer.color,
          message: GameMessages.challenges.success('Police')
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
        const updatedCards = cardService.drawCards(game.cards, 1, 'exchange');
        const drawnCardIds = updatedCards
          .filter(c => c.location === 'exchange')
          .map(c => c.id);
        
        result.logs = [loggingService.createSystemLog(GameMessages.responses.allowSwap)];
        
        result.logs.push(loggingService.createSpecificSystemLog('swapAllowed', {
          playerName: actionPlayer.name
        }));
        
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