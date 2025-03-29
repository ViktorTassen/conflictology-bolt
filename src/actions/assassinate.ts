import { ActionContext, ActionHandler, ActionResponse, ActionResult, createLog, createSystemLog, advanceToNextTurn } from './types';
import { GameMessages } from '../messages';
import { hasCardType, revealCard, replaceCard, getPlayerCards } from '../utils/cardUtils';

export const assassinateAction: ActionHandler = {
  execute: async ({ game, player, playerId }) => {
    // Check if player is eliminated
    if (player.eliminated) {
      throw new Error('Eliminated players cannot perform actions');
    }

    // Assassinate requires a target
    if (game.actionInProgress?.target === undefined) {
      throw new Error('Assassinate requires a target');
    }
    
    // Get target player
    const targetPlayer = game.players[game.actionInProgress.target];
    
    // Check if target player is eliminated
    if (targetPlayer.eliminated) {
      throw new Error('Cannot target an eliminated player');
    }

    // Check if player has enough coins
    if (player.coins < 3) {
      throw new Error('Assassinate requires 3 coins');
    }

    // Deduct the 3 coins cost
    const updatedPlayers = [...game.players];
    updatedPlayers[playerId].coins -= 3;

    const result: ActionResult = {
      players: updatedPlayers,
      logs: [createLog('assassinate', player, {
        target: targetPlayer.name,
        targetColor: targetPlayer.color,
        message: GameMessages.claims.assassinate
      })],
      actionInProgress: {
        type: 'assassinate',
        player: playerId,
        target: game.actionInProgress.target,
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
    const targetPlayer = game.players[game.actionInProgress.target ?? 0];
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
      
      // Handle the special case of failed challenge against Assassin
      // Challenger loses 2 cards instead of 1
      if (game.actionInProgress.loseTwo && remainingCards.length > 0 && 
          playerId === game.actionInProgress.losingPlayer &&
          playerId !== game.actionInProgress.player) {
        
        // Set up to lose another card
        result.actionInProgress = {
          ...game.actionInProgress,
          loseTwo: false, // Reset the flag to avoid infinite loop
          responses: {}, // Clear responses for the second card
        };
        
        result.logs.push(createSystemLog(
          "Failed challenge against Assassin! " + player.name + " must lose ANOTHER influence card!"
        ));
        
        return result;
      }
      
      if (remainingCards.length === 0) {
        // Player has no more cards - mark them as eliminated
        const updatedPlayers = [...game.players];
        updatedPlayers[playerId].eliminated = true;
        result.players = updatedPlayers;
        result.logs.push(createSystemLog(GameMessages.system.noMoreCards(player.name)));
      }

      // The Assassin card is already replaced when it's revealed during the challenge,
      // so we don't need to replace it again here.
      
      // If a blocking player is responding after winning a challenge
      // The Contessa card was already replaced during the challenge
      if (game.actionInProgress.blockingPlayer !== undefined && 
          game.actionInProgress.losingPlayer !== undefined &&
          playerId === game.actionInProgress.losingPlayer &&
          game.actionInProgress.blockingPlayer !== game.actionInProgress.losingPlayer &&
          game.actionInProgress.challengeDefense) {
        
        // The Contessa card was already replaced during the challenge
        const blockingPlayer = game.players[game.actionInProgress.blockingPlayer];
        
        // No need to replace the card again - it was replaced when it was revealed during the challenge
      }

      // If this was the blocking player losing influence (failed block)
      if (game.actionInProgress.blockingPlayer === playerId) {
        // In this case, we do NOT need to replace the card - just reveal it and proceed
        // Contessa block failed, assassination proceeds
        // Check if target still has influence to lose
        const targetId = game.actionInProgress.target ?? 0;
        
        if (!game.players[targetId].eliminated) {
          // Set up for target to lose influence next
          result.actionInProgress = {
            ...game.actionInProgress,
            challengeInProgress: false,  // Reset challenge state
            losingPlayer: targetId,
            responses: {}
          };
          
          result.players = game.players;
          return result;
        }
      } 
      // If this was the challenger losing influence after challenging a block
      else if (game.actionInProgress.losingPlayer === playerId && 
               game.actionInProgress.blockingPlayer !== undefined) {
        // The Contessa card was already replaced during the challenge
        const blockingPlayer = game.players[game.actionInProgress.blockingPlayer];
        
        // Block succeeds, assassination is blocked
        result.logs.push(createSystemLog(GameMessages.system.assassinationBlocked));
        
        // End the action
        result.actionInProgress = null;
        
        // Get next turn and reset actionUsedThisTurn flag
        const nextTurn = advanceToNextTurn(game.players, game.currentTurn);
        result.currentTurn = nextTurn.currentTurn;
        result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
        
        return result;
      }
      // If this was the challenger losing influence (failed challenge to Assassin claim)
      else if (game.actionInProgress.losingPlayer === playerId && 
               playerId !== game.actionInProgress.target &&
               !game.actionInProgress.blockingPlayer) {
        
        // We've already replaced the Assassin card when it was initially revealed
        // during the challenge response, so we don't need to replace it again here.
        
        // If the challenge to the Assassin claim failed, and it was from a third party
        // Reset game state to allow target to respond with block
        const targetHasContessa = hasCardType(game.cards, game.actionInProgress.target ?? 0, 'Contessa');
        
        if (targetHasContessa) {
          result.logs.push(createSystemLog(GameMessages.system.contessaBlock(targetPlayer.name)));
        }
        
        // Remove losingPlayer field to reset action state
        const { losingPlayer, challengeDefense, challengeInProgress, ...restActionProps } = game.actionInProgress;
        
        // Set up new action state
        result.actionInProgress = {
          ...restActionProps,
          responses: {} // Clear responses
        };
        
        result.players = game.players;
        return result;
      }

      // Complete action
      result.players = game.players;
      result.actionInProgress = null;
      
      // Get next turn and reset actionUsedThisTurn flag
      const nextTurn = advanceToNextTurn(game.players, game.currentTurn);
      result.currentTurn = nextTurn.currentTurn;
      result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
      
      return result;
    }

    // Handle block with Contessa
    if (response.type === 'block' && response.card === 'Contessa') {
      // Only the target can block an assassination
      if (playerId !== game.actionInProgress.target) {
        throw new Error('Only the target can block an assassination');
      }

      result.logs = [createLog('block', player, {
        target: actionPlayer.name,
        targetColor: actionPlayer.color,
        card: 'Contessa',
        message: GameMessages.blocks.contessa
      })];

      result.actionInProgress = {
        ...game.actionInProgress,
        blockingPlayer: playerId,
        blockingCard: 'Contessa',
        responses: {
          [playerId]: responseData
        }
      };

      return result;
    } 

    // Handle challenge to the Assassin claim
    if (response.type === 'challenge' && game.actionInProgress.blockingPlayer === undefined) {
      const actionPlayer = game.players[game.actionInProgress.player];
      const hasAssassin = hasCardType(game.cards, actionPlayer.id, 'Assassin');

      if (hasAssassin) {
        // Find the Assassin card to reveal - it must be revealed when successfully defending
        const assassinCard = game.cards.find(
          c => c.playerId === actionPlayer.id && 
          c.location === 'player' && 
          !c.revealed && 
          c.name === 'Assassin'
        );
        
        if (assassinCard) {
          // Reveal the Assassin card
          const updatedCardsWithReveal = revealCard(game.cards, assassinCard.id);
          
          // Immediately replace the revealed card with a new one from the deck
          const cardsAfterReplacement = replaceCard(updatedCardsWithReveal, assassinCard.id);
          result.cards = cardsAfterReplacement;
        }
        
        // Challenge fails, challenger loses TWO influence cards
        // The challenger must lose two influence cards when failing to challenge an Assassin
        result.logs = [createLog('challenge-fail', player, {
          target: actionPlayer.name,
          targetColor: actionPlayer.color,
          card: 'Assassin',
          message: GameMessages.challenges.failAssassin
        })];

        result.actionInProgress = {
          ...game.actionInProgress,
          losingPlayer: playerId,
          challengeInProgress: true,
          challengeDefense: true,
          responses: updatedResponses,
          revealedAssassinCardId: assassinCard?.id, // Store the ID even though we already replaced the card
          loseTwo: true // Flag to indicate that challenger loses two influence cards
        };
      } else {
        // Challenge succeeds, Assassin player loses influence
        result.logs = [createLog('challenge-success', player, {
          target: actionPlayer.name,
          targetColor: actionPlayer.color,
          card: 'Assassin',
          message: GameMessages.challenges.succeedAssassin
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
    // Handle challenge to a Contessa block
    else if (response.type === 'challenge' && game.actionInProgress.blockingPlayer !== undefined) {
      const blockingPlayer = game.players[game.actionInProgress.blockingPlayer];
      const hasContessa = hasCardType(game.cards, blockingPlayer.id, 'Contessa');

      if (hasContessa) {
        // Find the Contessa card to reveal - it must be revealed when successfully defending
        const contessaCard = game.cards.find(
          c => c.playerId === blockingPlayer.id && 
          c.location === 'player' && 
          !c.revealed && 
          c.name === 'Contessa'
        );
        
        if (contessaCard) {
          // Reveal the Contessa card
          const updatedCardsWithReveal = revealCard(game.cards, contessaCard.id);
          
          // Immediately replace the revealed card with a new one from the deck
          const cardsAfterReplacement = replaceCard(updatedCardsWithReveal, contessaCard.id);
          result.cards = cardsAfterReplacement;
        }
        
        // Challenge fails, challenger loses influence
        result.logs = [createLog('challenge-fail', player, {
          target: targetPlayer.name,
          targetColor: targetPlayer.color,
          card: 'Contessa',
          message: GameMessages.challenges.failContessa
        })];

        result.actionInProgress = {
          ...game.actionInProgress,
          losingPlayer: playerId,
          challengeInProgress: true,
          challengeDefense: true,
          responses: updatedResponses,
          revealedContessaCardId: contessaCard?.id // Store the ID of the revealed Contessa card
        };
      } else {
        // Challenge succeeds, blocker loses influence
        result.logs = [createLog('challenge-success', player, {
          target: targetPlayer.name,
          targetColor: targetPlayer.color,
          card: 'Contessa',
          message: GameMessages.challenges.succeedContessa
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

    // Handle allow responses
    if (response.type === 'allow') {
      result.actionInProgress = {
        ...game.actionInProgress,
        responses: updatedResponses
      };

      // If this is accepting a block
      if (game.actionInProgress.blockingPlayer !== undefined) {
        const blockingPlayer = game.players[game.actionInProgress.blockingPlayer];
        
        // If the original player accepts the block
        if (playerId === game.actionInProgress.player) {
          result.logs = [createLog('allow', player, {
            target: blockingPlayer.name,
            targetColor: blockingPlayer.color,
            message: GameMessages.responses.allowBlock
          })];
          
          result.logs.push(createSystemLog(GameMessages.system.assassinationBlocked));

          result.actionInProgress = null;
          
          // Get next turn and reset actionUsedThisTurn flag
          const nextTurn = advanceToNextTurn(game.players, game.currentTurn);
          result.currentTurn = nextTurn.currentTurn;
          result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
          
          return result;
        }
        
        // For blocks, only the action player's response matters
        return result;
      }

      // For normal assassination (no block), check if target has responded
      // Only the target player can respond initially
      const targetHasResponded = updatedResponses[game.actionInProgress.target!] !== undefined;
      
      if (targetHasResponded && updatedResponses[game.actionInProgress.target!].type === 'allow') {
        // Target allowed the assassination
        result.actionInProgress = {
          ...game.actionInProgress,
          losingPlayer: game.actionInProgress.target
        };
        
        result.logs = [createLog('allow', targetPlayer, {
          target: actionPlayer.name,
          targetColor: actionPlayer.color,
          message: GameMessages.responses.allowAssassination
        })];
      }

      return result;
    }

    return result;
  }
};