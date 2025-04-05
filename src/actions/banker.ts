import { ActionHandler, ActionResponse, ActionResult, advanceToNextTurn } from './types';
import { GameMessages } from '../messages';
import { cardService } from '../services/CardService';
import { loggingService } from '../services/LoggingService';

export const bankerAction: ActionHandler = { // Kept the name bankerAction for compatibility with index.ts
  execute: async ({ player, playerId }) => {
    if (player.eliminated) {
      throw new Error('Eliminated players cannot perform actions');
    }

    if (player.coins < 0) {
      throw new Error('Player does not have enough coins');
    }

    const result: ActionResult = {
      logs: [loggingService.createLog('banker', player, {
        message: GameMessages.actions.tax
      })],
      actionInProgress: {
        type: 'banker',
        player: playerId,
        responses: {},
        resolved: false
      }
    };

    return result;
  },

  respond: async ({ game, player, playerId }, response: ActionResponse) => {
    if (!game.actionInProgress) return {};

    if (player.eliminated) {
      throw new Error('Eliminated players cannot respond to actions');
    }

    const actionPlayer = game.players[game.actionInProgress.player];
    const result: ActionResult = {};
    
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

      if (playerId === game.actionInProgress.player) {
        result.actionInProgress = null;
        
        const nextTurn = advanceToNextTurn(game.players, game.currentTurn);
        result.currentTurn = nextTurn.currentTurn;
        result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
      } 
      else if (playerId !== game.actionInProgress.player && 
               game.actionInProgress.losingPlayer === playerId) {
        const updatedPlayers = [...game.players];
        updatedPlayers[game.actionInProgress.player].coins += 3;
        
        // Add message about players allowing tax collection
        result.logs.push(loggingService.createSystemLog(GameMessages.responses.allowTax));
        
        // Add result message
        result.logs.push(loggingService.createLog('banker', actionPlayer, {
          coins: 3,
          message: GameMessages.results.tax
        }));
        
        result.players = updatedPlayers;
        result.actionInProgress = null;
        
        const nextTurn = advanceToNextTurn(updatedPlayers, game.currentTurn);
        result.currentTurn = nextTurn.currentTurn;
        result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
      }
      else if (playerId === game.actionInProgress.player && 
              game.actionInProgress.challengeInProgress && 
              game.actionInProgress.challengeDefense) {
          
          const updatedPlayers = [...game.players];
          updatedPlayers[game.actionInProgress.player].coins += 3;
          
          // Add message about players allowing tax collection
          result.logs.push(loggingService.createSystemLog(GameMessages.responses.allowTax));
          
          // Add result message
          result.logs.push(loggingService.createLog('banker', actionPlayer, {
            coins: 3,
            message: GameMessages.results.tax
          }));
          
          result.players = updatedPlayers;
          result.actionInProgress = null;
          
          const nextTurn = advanceToNextTurn(updatedPlayers, game.currentTurn);
          result.currentTurn = nextTurn.currentTurn;
          result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
      }

      return result;
    }

    if (response.type === 'challenge') {
      const actionPlayer = game.players[game.actionInProgress.player];
      const hasBanker = cardService.hasCardType(game.cards, actionPlayer.id, 'Banker');
      
      if (hasBanker) {
        const bankerCard = game.cards.find(
          c => c.playerId === actionPlayer.id && 
          c.location === 'player' && 
          !c.revealed && 
          c.name === 'Banker'
        );
        
        if (bankerCard) {
          const updatedCardsWithReveal = cardService.revealCard(game.cards, bankerCard.id);
          const cardsAfterReplacement = cardService.replaceCard(updatedCardsWithReveal, bankerCard.id);
          result.cards = cardsAfterReplacement;
        }
        
        result.logs = [loggingService.createLog('challenge-fail', player, {
          target: actionPlayer.name,
          targetColor: actionPlayer.color,
          card: 'Banker',
          message: GameMessages.challenges.fail('Banker')
        })];
        
        result.actionInProgress = {
          ...game.actionInProgress,
          losingPlayer: playerId,
          challengeInProgress: true,
          challengeDefense: true,
          responses: updatedResponses,
          revealedBankerCardId: bankerCard?.id
        };
      } else {
        result.logs = [loggingService.createLog('challenge-success', player, {
          target: actionPlayer.name,
          targetColor: actionPlayer.color,
          card: 'Banker',
          message: GameMessages.challenges.success('Banker')
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
        const updatedPlayers = [...game.players];
        updatedPlayers[game.actionInProgress.player].coins += 3;

        // Add message about players allowing tax collection as a system message
        result.logs = [loggingService.createSystemLog(GameMessages.responses.allowTax)];
        
        // Add result message
        result.logs.push(loggingService.createLog('banker', actionPlayer, {
          coins: 3,
          message: GameMessages.results.tax
        }));

        result.players = updatedPlayers;
        result.actionInProgress = null;
        
        const nextTurn = advanceToNextTurn(game.players, game.currentTurn);
        result.currentTurn = nextTurn.currentTurn;
        result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
      }
      
      return result;
    }

    return result;
  }
};