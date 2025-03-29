import { ActionHandler, ActionResponse, ActionResult, createLog, createSystemLog, advanceToNextTurn } from './types';
import { GameMessages } from '../messages';
import { getPlayerCards, revealCard } from '../utils/cardUtils';

export const coupAction: ActionHandler = {
  execute: async ({ game, player, playerId }) => {
    // Check if player is eliminated
    if (player.eliminated) {
      throw new Error('Eliminated players cannot perform actions');
    }

    // Coup requires a target
    if (game.actionInProgress?.target === undefined) {
      throw new Error('Coup requires a target');
    }

    // Check if player has enough coins
    if (player.coins < 7) {
      throw new Error('Coup requires 7 coins');
    }
    
    // Get target player object
    const targetPlayerId = game.actionInProgress.target;
    const targetPlayer = game.players[targetPlayerId];
    
    console.log("COUP DEBUG - Action in progress:", game.actionInProgress);
    console.log("COUP DEBUG - Target player ID:", targetPlayerId);
    console.log("COUP DEBUG - Target player object:", targetPlayer);
    
    // Verify target player exists and isn't eliminated
    if (!targetPlayer) {
      throw new Error('Target player not found');
    }
    
    if (targetPlayer.eliminated) {
      throw new Error('Cannot target an eliminated player');
    }
    
    // Check if target player has any cards (revealed or not)
    // We need to use targetPlayer.id which might be different from the index
    const targetId = targetPlayer.id;
    console.log("COUP DEBUG - Target player.id:", targetId);
    
    const allTargetCards = game.cards.filter(c => 
      c.playerId === targetId && 
      c.location === 'player'
    );
    
    console.log("COUP DEBUG - Target cards:", allTargetCards);
    
    // Target must have at least one card
    if (!allTargetCards || allTargetCards.length === 0) {
      throw new Error('Target player has no influence to lose');
    }

    // Deduct the 7 coins cost
    const updatedPlayers = [...game.players];
    updatedPlayers[playerId].coins -= 7;

    const result: ActionResult = {
      players: updatedPlayers,
      logs: [createLog('coup', player, {
        target: targetPlayer.name,
        targetColor: targetPlayer.color,
        coins: player.coins >= 10 ? player.coins : undefined,
        message: player.coins >= 10 ? GameMessages.claims.coupWithExcess : GameMessages.claims.coup
      })],
      actionInProgress: {
        type: 'coup',
        player: playerId,
        target: targetPlayerId,
        // Mark target as needing to lose influence immediately
        losingPlayer: targetPlayerId,
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

    // Coup can only be responded to by losing influence
    if (response.type === 'lose_influence') {
      // Confirm this is the target player
      if (playerId !== game.actionInProgress.target) {
        throw new Error('Only the target can lose influence from a coup');
      }

      // Find unrevealed cards to lose
      // Need to use player.id (the actual player ID) not playerId (index in the array)
      const playerCards = getPlayerCards(game.cards, player.id);
      
      console.log("COUP RESPOND DEBUG - Player ID:", player.id);
      console.log("COUP RESPOND DEBUG - Player cards:", playerCards);
      
      if (playerCards.length === 0) {
        // Player has no unrevealed cards left - they are eliminated
        const updatedPlayers = [...game.players];
        updatedPlayers[playerId].eliminated = true;
        
        result.players = updatedPlayers;
        result.actionInProgress = null;
        result.logs = [createSystemLog(GameMessages.system.noMoreCards(player.name))];
        
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
      console.log("COUP RESPOND DEBUG - Remaining cards after reveal:", remainingCards);
      
      if (remainingCards.length === 0) {
        // Player has no more cards - mark them as eliminated
        const updatedPlayers = [...game.players];
        updatedPlayers[playerId].eliminated = true;
        result.players = updatedPlayers;
        result.logs.push(createSystemLog(GameMessages.system.noMoreCards(player.name)));
      }
      
      // Move to next player's turn
      result.actionInProgress = null;
      
      // Get next turn and reset actionUsedThisTurn flag
      const nextTurn = advanceToNextTurn(game.players, game.currentTurn);
      result.currentTurn = nextTurn.currentTurn;
      result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
    } else {
      // Invalid response type for coup
      throw new Error('Invalid response type for coup action');
    }

    return result;
  }
};