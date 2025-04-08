import { ActionHandler, ActionResponse, ActionResult, advanceToNextTurn } from './types';
import { GameMessages } from '../messages';
import { cardService } from '../services/CardService';
import { loggingService } from '../services/LoggingService';

export const exchangeAction: ActionHandler = {
  execute: async ({ player, playerId }) => {
    if (player.eliminated) {
      throw new Error('Eliminated players cannot perform actions');
    }

    const result: ActionResult = {
      logs: [loggingService.createLog('exchange', player, {
        message: GameMessages.actions.exchange,
        playerId: playerId
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

    if (player.eliminated) {
      throw new Error('Eliminated players cannot respond to actions');
    }

    const actionPlayer = game.players[game.actionInProgress.player];
    const result: ActionResult = {};
    
    if (response.type === 'exchange_selection' && response.selectedIndices) {
      if (playerId !== game.actionInProgress.player) {
        throw new Error('Only the player who initiated the exchange can select cards');
      }
      
      if (!game.actionInProgress.exchangeCards) {
        throw new Error('No exchange cards available');
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
      
      result.logs = [loggingService.createLog('exchange-complete', player, {
        message: GameMessages.results.exchange,
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
      result.logs = [loggingService.createLog('lose-influence', player, {
        playerId: playerId
      })];
      
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
        
        const cardsWithExchange = cardService.drawCards(updatedCards, 2, 'exchange');
        const drawnCardIds = cardsWithExchange
          .filter(c => c.location === 'exchange')
          .map(c => c.id);
        
        result.logs.push(loggingService.createSpecificSystemLog('exchangeSelecting', {
          playerName: actionPlayer.name
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
        const cardsWithExchange = cardService.drawCards(updatedCards, 2, 'exchange');
        const drawnCardIds = cardsWithExchange
          .filter(c => c.location === 'exchange')
          .map(c => c.id);
        
        result.logs.push(loggingService.createSpecificSystemLog('exchangeSelecting', {
          playerName: actionPlayer.name
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
      const hasReporter = cardService.hasCardType(game.cards, actionPlayer.id, 'Reporter');

      if (hasReporter) {
        const reporterCard = game.cards.find(
          c => c.playerId === actionPlayer.id && 
          c.location === 'player' && 
          !c.revealed && 
          c.name === 'Reporter'
        );
        
        if (reporterCard) {
          const updatedCardsWithReveal = cardService.revealCard(game.cards, reporterCard.id);
          const cardsAfterReplacement = cardService.replaceCard(updatedCardsWithReveal, reporterCard.id);
          result.cards = cardsAfterReplacement;
        }
        
        result.logs = [loggingService.createLog('challenge-fail', player, {
          target: actionPlayer.name,
          targetColor: actionPlayer.color,
          message: GameMessages.challenges.fail('Reporter')
        })];

        result.actionInProgress = {
          ...game.actionInProgress,
          losingPlayer: playerId,
          challengeInProgress: true,
          challengeDefense: true,
          responses: updatedResponses,
          revealedReporterCardId: reporterCard?.id
        };
      } else {
        result.logs = [loggingService.createLog('challenge-success', player, {
          target: actionPlayer.name,
          targetColor: actionPlayer.color,
          message: GameMessages.challenges.success('Reporter')
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
        const updatedCards = cardService.drawCards(game.cards, 2, 'exchange');
        const drawnCardIds = updatedCards
          .filter(c => c.location === 'exchange')
          .map(c => c.id);
        
        result.logs = [loggingService.createSystemLog(GameMessages.responses.allowExchange)];
        
        result.logs.push(loggingService.createSpecificSystemLog('exchangeSelecting', {
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