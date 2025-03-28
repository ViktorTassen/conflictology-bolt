import { ActionContext, ActionHandler, ActionResponse, ActionResult, createLog, createSystemLog, advanceToNextTurn } from './types';
import { GameMessages } from '../messages';
import { hasCardType, revealCard, replaceCard, getPlayerCards } from '../utils/cardUtils';

export const foreignAidAction: ActionHandler = {
  execute: async ({ game, player, playerId }) => {
    // Check if player is eliminated
    if (player.eliminated) {
      throw new Error('Eliminated players cannot perform actions');
    }

    const result: ActionResult = {
      logs: [createLog('foreign-aid', player)],
      actionInProgress: {
        type: 'foreign-aid',
        player: playerId,
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
        
        result.logs = [createSystemLog(GameMessages.system.noMoreCards(player.name))];
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
      
      // If a blocking player is responding after winning a challenge
      if (game.actionInProgress.blockingPlayer !== undefined && 
          playerId === game.actionInProgress.losingPlayer && 
          game.actionInProgress.blockingPlayer !== game.actionInProgress.losingPlayer &&
          game.actionInProgress.challengeDefense) {
        
        // Find the Duke card that was challenged
        const blockingPlayer = game.players[game.actionInProgress.blockingPlayer];
        const dukeCard = getPlayerCards(game.cards, blockingPlayer.id)
          .find(c => c.name === 'Duke');
        
        if (dukeCard) {
          const updatedCards = replaceCard(result.cards || game.cards, dukeCard.id);
          result.cards = updatedCards;
        }
      }

      // If this was the blocking player losing influence after a failed block
      if (game.actionInProgress.blockingPlayer === playerId) {
        // Original player gets Foreign Aid
        const updatedPlayers = [...game.players];
        updatedPlayers[game.actionInProgress.player].coins += 2;
        
        // Create a player-specific message showing who got the Foreign Aid
        result.logs.push(createLog('foreign-aid', actionPlayer, {
          coins: 2, 
          message: GameMessages.results.foreignAidSuccess
        }));
        
        result.players = updatedPlayers;
      }

      result.actionInProgress = null;
      
      // Get next turn and reset actionUsedThisTurn flag
      const nextTurn = advanceToNextTurn(game.players, game.currentTurn);
      result.currentTurn = nextTurn.currentTurn;
      result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;

      return result;
    }

    // Handle block with Duke
    if (response.type === 'block' && response.card === 'Duke') {
      result.logs = [createLog('block', player, {
        target: actionPlayer.name,
        targetColor: actionPlayer.color,
        card: 'Duke',
        message: GameMessages.blocks.dukeBlockForeignAid
      })];

      // Clear previous responses when a block occurs
      result.actionInProgress = {
        ...game.actionInProgress,
        blockingPlayer: playerId,
        blockingCard: 'Duke',
        responses: {
          [playerId]: responseData  // Only keep the blocker's response
        }
      };

      return result;
    } 
    // Handle allow responses
    else if (response.type === 'allow') {
      result.actionInProgress = {
        ...game.actionInProgress,
        responses: updatedResponses
      };

      // If this is accepting a block
      if (game.actionInProgress.blockingPlayer !== undefined) {
        const blockingPlayer = game.players[game.actionInProgress.blockingPlayer];
        
        // If the original player accepts the block, it resolves immediately
        if (playerId === game.actionInProgress.player) {
          result.logs = [createLog('allow', player, {
            target: blockingPlayer.name,
            targetColor: blockingPlayer.color,
            message: GameMessages.responses.allowBlock
          })];

          result.actionInProgress = null;
          
          // Get next turn and reset actionUsedThisTurn flag
          const nextTurn = advanceToNextTurn(game.players, game.currentTurn);
          result.currentTurn = nextTurn.currentTurn;
          result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
          
          return result;
        }
        
        // If someone other than the action player responded to a block
        // We need to check if all OTHER players have responded
        const otherPlayers = game.players.filter((p, index) => 
          !p.eliminated && 
          index !== game.actionInProgress!.player && 
          index !== game.actionInProgress!.blockingPlayer
        );
        
        const allOtherPlayersResponded = otherPlayers.every(p => {
          const playerIdx = game.players.indexOf(p);
          const hasResponded = updatedResponses[playerIdx] !== undefined;
          return hasResponded;
        });
        
        // If all other players have responded, we're just waiting for the action player
        if (allOtherPlayersResponded) {
          // No state change needed yet
          return result;
        }
        
        // Otherwise, continue waiting for other players to respond
        return result;
      }

      // No block yet, handling regular allow responses to the Foreign Aid
      
      // Check if all other non-eliminated players have allowed
      const otherPlayers = game.players.filter((p, index) => 
        index !== game.actionInProgress!.player && !p.eliminated
      );
      
      const allResponded = otherPlayers.every(p => {
        const playerIdx = game.players.indexOf(p);
        const hasResponded = updatedResponses[playerIdx] !== undefined;
        return hasResponded;
      });

      if (allResponded) {
        // Check if anyone blocked
        const anyPlayerBlocked = otherPlayers.some(p => {
          const playerIdx = game.players.indexOf(p);
          const response = updatedResponses[playerIdx];
          return response && response.type === 'block';
        });
        
        // If no one blocked, complete Foreign Aid
        if (!anyPlayerBlocked) {
          const updatedPlayers = [...game.players];
          updatedPlayers[game.actionInProgress.player].coins += 2;
  
          result.logs = [createLog('foreign-aid', actionPlayer, {
            coins: 2,
            message: GameMessages.results.foreignAidSuccess
          })];
  
          result.players = updatedPlayers;
          result.actionInProgress = null;
          
          // Get next turn and reset actionUsedThisTurn flag
          const nextTurn = advanceToNextTurn(updatedPlayers, game.currentTurn);
          result.currentTurn = nextTurn.currentTurn;
          result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
        }
      }

      return result;
    }
    // Handle challenge of a block
    else if (response.type === 'challenge' && game.actionInProgress.blockingPlayer !== undefined) {
      const blockingPlayer = game.players[game.actionInProgress.blockingPlayer];
      const hasDuke = hasCardType(game.cards, blockingPlayer.id, 'Duke');

      if (hasDuke) {
        // Challenge fails, challenger loses influence
        result.logs = [createLog('challenge-fail', player, {
          target: blockingPlayer.name,
          targetColor: blockingPlayer.color,
          card: 'Duke',
          message: GameMessages.challenges.failDuke
        })];

        result.actionInProgress = {
          ...game.actionInProgress,
          losingPlayer: playerId,
          challengeInProgress: true,
          challengeDefense: true, // Flag to indicate the blocking player successfully defended and needs to replace their card
          responses: updatedResponses
        };
      } else {
        // Challenge succeeds, blocker loses influence
        result.logs = [createLog('challenge-success', player, {
          target: blockingPlayer.name,
          targetColor: blockingPlayer.color,
          card: 'Duke',
          message: GameMessages.challenges.succeedDuke
        })];

        result.actionInProgress = {
          ...game.actionInProgress,
          losingPlayer: game.actionInProgress.blockingPlayer,
          challengeInProgress: true,
          responses: updatedResponses
        };
      }

      return result;
    }

    return result;
  }
};