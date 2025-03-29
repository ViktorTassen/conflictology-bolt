import { ActionHandler, ActionResponse, ActionResult, advanceToNextTurn } from './types';
import { GameMessages } from '../messages';
import { CardType } from '../types';
import { cardService } from '../services/CardService';
import { loggingService } from '../services/LoggingService';

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

    if (player.eliminated) {
      throw new Error('Eliminated players cannot respond to actions');
    }

    const actionPlayer = game.players[game.actionInProgress.player];
    const targetPlayer = game.players[game.actionInProgress.target ?? 0];
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
      
      result.logs = [loggingService.createSystemLog(`${player.name} shows a card to ${actionPlayer.name}.`)];
      
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
        result.logs = [loggingService.createLog('investigate-result', player, {
          target: targetPlayer.name,
          targetColor: targetPlayer.color,
          message: GameMessages.results.investigateKeep(targetPlayer.name)
        })];
      } else {
        const updatedCards = cardService.drawCards(game.cards, 1, 'investigate');
        const drawnCard = updatedCards.find(c => c.location === 'investigate');
        
        if (!drawnCard) {
          result.logs = [loggingService.createSystemLog(`No cards left in the deck for swap. Card remains unchanged.`)];
          result.actionInProgress = null;
          const nextTurn = advanceToNextTurn(game.players, game.currentTurn);
          result.currentTurn = nextTurn.currentTurn;
          result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
          return result;
        }
        
        const cardsWithReturnedCard = cardService.returnCardsToDeck(updatedCards, [investigateCard.cardId]);
        
        const finalCards = cardsWithReturnedCard.map(card => {
          if (card.id === drawnCard.id) {
            return {
              ...card,
              playerId: targetPlayer.id,
              location: 'player' as any,
              revealed: false
            };
          }
          return card;
        });
        
        result.cards = finalCards;
        result.logs = [loggingService.createLog('investigate-result', player, {
          target: targetPlayer.name,
          targetColor: targetPlayer.color,
          message: GameMessages.results.investigateSwap(targetPlayer.name)
        })];
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
        
        result.logs = [loggingService.createSystemLog(GameMessages.system.noMoreCards(player.name))];
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
        result.logs.push(loggingService.createSystemLog(GameMessages.system.noMoreCards(player.name)));
      }

      if (game.actionInProgress.losingPlayer !== undefined &&  
          game.actionInProgress.losingPlayer !== game.actionInProgress.player && 
          playerId === game.actionInProgress.player && 
          game.actionInProgress.challengeDefense) {
          
        result.logs.push(loggingService.createSystemLog(`${actionPlayer.name} will now continue with the Investigate action.`));
          
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
          result.logs.push(loggingService.createSystemLog(`${targetPlayer.name} has no cards to investigate.`));
          result.actionInProgress = null;
          const nextTurn = advanceToNextTurn(game.players, game.currentTurn);
          result.currentTurn = nextTurn.currentTurn;
          result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
          return result;
        }
        
        result.logs.push(loggingService.createSystemLog(`${actionPlayer.name} will now continue with the investigation.`));
          
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
      const actionPlayer = game.players[game.actionInProgress.player];
      const hasInquisitor = cardService.hasCardType(game.cards, actionPlayer.id, 'Inquisitor');

      if (hasInquisitor) {
        const inquisitorCard = game.cards.find(
          c => c.playerId === actionPlayer.id && 
          c.location === 'player' && 
          !c.revealed && 
          c.name === 'Inquisitor'
        );
        
        if (inquisitorCard) {
          const updatedCardsWithReveal = cardService.revealCard(game.cards, inquisitorCard.id);
          const cardsAfterReplacement = cardService.replaceCard(updatedCardsWithReveal, inquisitorCard.id);
          result.cards = cardsAfterReplacement;
        }
        
        result.logs = [loggingService.createLog('challenge-fail', player, {
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
        result.logs = [loggingService.createLog('challenge-success', player, {
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

    if (response.type === 'allow') {
      result.actionInProgress = {
        ...game.actionInProgress,
        responses: updatedResponses
      };

      if (playerId === game.actionInProgress.target) {
        result.logs = [loggingService.createSystemLog(`${player.name} selecting a card to show.`)];
        
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
    if (player.eliminated) {
      throw new Error('Eliminated players cannot perform actions');
    }

    const result: ActionResult = {
      logs: [loggingService.createLog('swap', player, {
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
      
      updatedCards = cardService.returnCardsToDeck(updatedCards, returnCardIds);
      
      result.logs = [loggingService.createLog('swap-complete', player, {
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

    if (response.type === 'lose_influence') {
      const playerCards = cardService.getPlayerCards(game.cards, player.id);
      
      if (playerCards.length === 0) {
        const updatedPlayers = [...game.players];
        updatedPlayers[playerId].eliminated = true;
        
        result.logs = [loggingService.createSystemLog(GameMessages.system.noMoreCards(player.name))];
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
        result.logs.push(loggingService.createSystemLog(GameMessages.system.noMoreCards(player.name)));
      }

      if (game.actionInProgress.losingPlayer !== undefined &&  
          game.actionInProgress.losingPlayer !== game.actionInProgress.player && 
          playerId === game.actionInProgress.player && 
          game.actionInProgress.challengeDefense) {
        
        const cardsWithExchange = cardService.drawCards(updatedCards, 1, 'exchange');
        const drawnCardIds = cardsWithExchange
          .filter(c => c.location === 'exchange')
          .map(c => c.id);
        
        result.logs.push(loggingService.createSystemLog(`${actionPlayer.name} will now swap cards.`));
        
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
        
        result.logs.push(loggingService.createSystemLog(`${actionPlayer.name} will now swap cards.`));
        
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
      const actionPlayer = game.players[game.actionInProgress.player];
      const hasInquisitor = cardService.hasCardType(game.cards, actionPlayer.id, 'Inquisitor');

      if (hasInquisitor) {
        const inquisitorCard = game.cards.find(
          c => c.playerId === actionPlayer.id && 
          c.location === 'player' && 
          !c.revealed && 
          c.name === 'Inquisitor'
        );
        
        if (inquisitorCard) {
          const updatedCardsWithReveal = cardService.revealCard(game.cards, inquisitorCard.id);
          const cardsAfterReplacement = cardService.replaceCard(updatedCardsWithReveal, inquisitorCard.id);
          result.cards = cardsAfterReplacement;
        }
        
        result.logs = [loggingService.createLog('challenge-fail', player, {
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
        result.logs = [loggingService.createLog('challenge-success', player, {
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
        
        result.logs = [loggingService.createSystemLog(`Swap allowed. ${actionPlayer.name} selecting cards.`)];
        
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