import { ActionHandler, ActionResponse, ActionResult, createLog, createSystemLog, advanceToNextTurn } from './types';
import { CardType } from '../types';
import { GameMessages } from '../messages';
import { hasCardType, revealCard, replaceCard, getPlayerCards } from '../utils/cardUtils';

export const stealAction: ActionHandler = {
  execute: async ({ game, player, playerId }) => {
    // Check if player is eliminated
    if (player.eliminated) {
      throw new Error('Eliminated players cannot perform actions');
    }

    // Steal requires a target
    if (game.actionInProgress?.target === undefined) {
      throw new Error('Steal requires a target');
    }
    
    const targetPlayer = game.players[game.actionInProgress.target];
    
    // Check if target player is eliminated
    if (targetPlayer.eliminated) {
      throw new Error('Cannot target an eliminated player');
    }

    const result: ActionResult = {
      logs: [createLog('steal', player, {
        target: targetPlayer.name,
        targetColor: targetPlayer.color,
        message: GameMessages.claims.steal
      })],
      actionInProgress: {
        type: 'steal',
        player: playerId,
        target: game.actionInProgress.target,
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
      if (remainingCards.length === 0) {
        // Player has no more cards - mark them as eliminated
        const updatedPlayers = [...game.players];
        updatedPlayers[playerId].eliminated = true;
        result.players = updatedPlayers;
        result.logs.push(createSystemLog(GameMessages.system.noMoreCards(player.name)));
      }

      // The card was already replaced during the challenge, so we don't need to replace it again
      // Just keeping action state update logic but removing the replacement part
      if (playerId === game.actionInProgress.player && 
          game.actionInProgress.losingPlayer !== undefined &&
          game.actionInProgress.losingPlayer !== game.actionInProgress.player &&
          game.actionInProgress.challengeDefense &&
          !game.actionInProgress.blockingPlayer) {
        
        // Captain card was already replaced during the challenge
        // No need to find and replace it again
      }
      
      // If a blocking player is responding after winning a challenge
      // The blocking card was already replaced during the challenge
      if (game.actionInProgress.blockingPlayer !== undefined && 
          game.actionInProgress.losingPlayer !== undefined &&
          playerId === game.actionInProgress.blockingPlayer &&
          game.actionInProgress.blockingPlayer !== game.actionInProgress.losingPlayer &&
          game.actionInProgress.challengeDefense) {
        
        console.log("CARD REPLACEMENT DEBUG: Blocking player responding after winning challenge");
        console.log("CARD REPLACEMENT DEBUG: Blocker ID:", game.actionInProgress.blockingPlayer);
        console.log("CARD REPLACEMENT DEBUG: Current player ID:", playerId);
        console.log("CARD REPLACEMENT DEBUG: Blocking card:", game.actionInProgress.blockingCard);
        console.log("CARD REPLACEMENT DEBUG: Card was already replaced during the challenge");
      }

      // If this was the blocking player losing influence (failed block)
      if (game.actionInProgress.blockingPlayer === playerId) {
        // Successful steal - calculate coins
        const stolenCoins = Math.min(targetPlayer.coins, 2);
        
        // Transfer coins
        const updatedPlayers = [...game.players];
        updatedPlayers[game.actionInProgress.target ?? 0].coins -= stolenCoins;
        updatedPlayers[game.actionInProgress.player].coins += stolenCoins;
        
        result.logs.push(createLog('steal', actionPlayer, {
          target: targetPlayer.name,
          targetColor: targetPlayer.color,
          coins: stolenCoins,
          message: `steals $${stolenCoins}M from`
        }));
        
        result.players = updatedPlayers;
      }
      // If this was the challenger losing influence (failed challenge)
      else if (game.actionInProgress.losingPlayer === playerId && 
               playerId !== game.actionInProgress.player) {
        
        // Special case: If this was a challenger losing after challenging a block
        if (game.actionInProgress.blockingPlayer !== undefined) {
          console.log("CHALLENGER LOST DEBUG: Challenger losing after challenging a block");
          console.log("CHALLENGER LOST DEBUG: Current player ID (challenger):", playerId);
          console.log("CHALLENGER LOST DEBUG: Blocker ID:", game.actionInProgress.blockingPlayer);
          console.log("CHALLENGER LOST DEBUG: Blocking card:", game.actionInProgress.blockingCard);
          console.log("CHALLENGER LOST DEBUG: Challenge defense flag:", game.actionInProgress.challengeDefense);
          
          // The blocker's card was already replaced during the challenge
          const blockingPlayer = game.players[game.actionInProgress.blockingPlayer];
          const blockingCardName = game.actionInProgress.blockingCard as CardType;
          
          console.log("CHALLENGER LOST DEBUG: Card was already replaced during the challenge");
          console.log("CHALLENGER LOST DEBUG: Blocker's cards:", updatedCards.filter(c => c.playerId === blockingPlayer.id));
          
          // Block succeeds, steal is blocked
          result.logs.push(createSystemLog(`${blockingPlayer.name}'s ${blockingCardName} blocks the steal.`));
          
          // End the action
          result.actionInProgress = null;
          
          // Get next turn and reset actionUsedThisTurn flag
          const nextTurn = advanceToNextTurn(game.players, game.currentTurn);
          result.currentTurn = nextTurn.currentTurn;
          result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
          
          return result;
        }
        
        // If this was a challenge to the Captain claim, and target hasn't blocked yet
        if (playerId !== game.actionInProgress.target) {
          // Captain card was already replaced during the challenge
          const actionPlayer = game.players[game.actionInProgress.player];
          
          // Reset game state to action_response to allow target to block
          result.logs.push(createSystemLog(GameMessages.system.blockingOptions(targetPlayer.name)));
          
          // Reset state by removing specific properties
          const { losingPlayer, challengeInProgress, ...restActionProps } = game.actionInProgress;
          
          result.actionInProgress = {
            ...restActionProps,
            responses: {} // Clear all responses to allow new response phase
          };
          
          return result;
        }
        
        // If target was the one who challenged and lost, proceed with steal
        
        // Captain card was already replaced during the challenge
        const actionPlayer = game.players[game.actionInProgress.player];
        
        const stolenCoins = Math.min(targetPlayer.coins, 2);
        
        // Transfer coins
        const updatedPlayers = [...game.players];
        updatedPlayers[game.actionInProgress.target ?? 0].coins -= stolenCoins;
        updatedPlayers[game.actionInProgress.player].coins += stolenCoins;
        
        result.logs.push(createLog('steal', actionPlayer, {
          target: targetPlayer.name,
          targetColor: targetPlayer.color,
          coins: stolenCoins,
          message: `steals $${stolenCoins}M from`
        }));
        
        result.players = updatedPlayers;
      }
      
      // Before completing, ensure all revealed blocking cards are replaced
      // (This should not be needed anymore since cards are replaced immediately during challenge)
      if (game.actionInProgress.blockingPlayer !== undefined && 
          game.actionInProgress.blockingCard) {
        const blockingPlayer = game.players[game.actionInProgress.blockingPlayer];
        const blockingCardName = game.actionInProgress.blockingCard as CardType;
        console.log("COMPLETE ACTION DEBUG: Checking for unreplaced revealed blocking cards");
        console.log("COMPLETE ACTION DEBUG: Cards should have been replaced already during challenge");
      }
      
      // Complete action
      result.actionInProgress = null;
      
      // Get next turn and reset actionUsedThisTurn flag
      const nextTurn = advanceToNextTurn(game.players, game.currentTurn);
      result.currentTurn = nextTurn.currentTurn;
      result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
      
      return result;
    }

    // Handle block with Captain, Ambassador, or Inquisitor
    if (response.type === 'block') {
      // Verify a valid block card is specified
      if (!response.card || !['Captain', 'Ambassador', 'Inquisitor'].includes(response.card)) {
        throw new Error('Must block with Captain, Ambassador, or Inquisitor');
      }
      
      // Only the target can block a steal
      if (playerId !== game.actionInProgress.target) {
        throw new Error('Only the target can block a steal');
      }
      
      result.logs = [createLog('block', player, {
        target: actionPlayer.name,
        targetColor: actionPlayer.color,
        card: response.card,
        message: `claims ${response.card} to block steal`
      })];

      result.actionInProgress = {
        ...game.actionInProgress,
        blockingPlayer: playerId,
        blockingCard: response.card,
        responses: {
          [playerId]: responseData
        }
      };

      return result;
    } 

    // Handle challenge to Captain claim
    if (response.type === 'challenge' && game.actionInProgress.blockingPlayer === undefined) {
      const actionPlayer = game.players[game.actionInProgress.player];
      const hasCaptain = hasCardType(game.cards, actionPlayer.id, 'Captain');

      if (hasCaptain) {
        // Find the Captain card to reveal - it must be revealed when successfully defending
        const captainCard = game.cards.find(
          c => c.playerId === actionPlayer.id && 
          c.location === 'player' && 
          !c.revealed && 
          c.name === 'Captain'
        );
        
        if (captainCard) {
          // Reveal the Captain card
          const updatedCardsWithReveal = revealCard(game.cards, captainCard.id);
          
          // Immediately replace the revealed card with a new one from the deck
          const cardsAfterReplacement = replaceCard(updatedCardsWithReveal, captainCard.id);
          result.cards = cardsAfterReplacement;
        }
        
        // Challenge fails, challenger loses influence
        result.logs = [createLog('challenge-fail', player, {
          target: actionPlayer.name,
          targetColor: actionPlayer.color,
          card: 'Captain',
          message: GameMessages.challenges.failCaptain
        })];

        result.actionInProgress = {
          ...game.actionInProgress,
          losingPlayer: playerId,
          challengeInProgress: true,
          challengeDefense: true,
          responses: updatedResponses,
          revealedCaptainCardId: captainCard?.id // Store the ID of the revealed Captain card
        };
      } else {
        // Challenge succeeds, Captain player loses influence
        result.logs = [createLog('challenge-success', player, {
          target: actionPlayer.name,
          targetColor: actionPlayer.color,
          card: 'Captain',
          message: GameMessages.challenges.succeedCaptain
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
    // Handle challenge to a block
    else if (response.type === 'challenge' && game.actionInProgress.blockingPlayer !== undefined) {
      console.log("BLOCK CHALLENGE DEBUG: Handling challenge to a block");
      console.log("BLOCK CHALLENGE DEBUG: Challenger ID:", playerId);
      console.log("BLOCK CHALLENGE DEBUG: Blocker ID:", game.actionInProgress.blockingPlayer);
      console.log("BLOCK CHALLENGE DEBUG: Blocking card:", game.actionInProgress.blockingCard);
      
      const blockingPlayer = game.players[game.actionInProgress.blockingPlayer];
      const blockingCard = game.actionInProgress.blockingCard as CardType;
      const hasCard = hasCardType(game.cards, blockingPlayer.id, blockingCard);
      
      console.log("BLOCK CHALLENGE DEBUG: Blocker has claimed card:", hasCard);
      console.log("BLOCK CHALLENGE DEBUG: Blocker's cards:", game.cards.filter(c => c.playerId === blockingPlayer.id));

      if (hasCard) {
        console.log("BLOCK CHALLENGE DEBUG: Blocker wins challenge, finding card to reveal");
        // Find the blocking card to reveal when successfully defending
        const blockingCardObj = game.cards.find(
          c => c.playerId === blockingPlayer.id && 
          c.location === 'player' && 
          !c.revealed && 
          c.name === blockingCard
        );
        
        console.log("BLOCK CHALLENGE DEBUG: Found blocking card to reveal:", blockingCardObj);
        
        if (blockingCardObj) {
          // Reveal the blocking card
          console.log("BLOCK CHALLENGE DEBUG: Revealing card with ID:", blockingCardObj.id);
          const updatedCardsWithReveal = revealCard(game.cards, blockingCardObj.id);
          console.log("BLOCK CHALLENGE DEBUG: Cards after revealing:", 
            updatedCardsWithReveal.filter(c => c.playerId === blockingPlayer.id));
          
          // Immediately replace the revealed card with a new one from the deck
          console.log("BLOCK CHALLENGE DEBUG: Immediately replacing card with ID:", blockingCardObj.id);
          const cardsAfterReplacement = replaceCard(updatedCardsWithReveal, blockingCardObj.id);
          console.log("BLOCK CHALLENGE DEBUG: Cards after replacement:", 
            cardsAfterReplacement.filter(c => c.playerId === blockingPlayer.id));
          result.cards = cardsAfterReplacement;
        } else {
          console.log("BLOCK CHALLENGE DEBUG: No matching blocking card found to reveal");
        }
        
        // Challenge fails, challenger loses influence
        result.logs = [createLog('challenge-fail', player, {
          target: blockingPlayer.name,
          targetColor: blockingPlayer.color,
          card: blockingCard,
          message: `challenges ${blockingCard} block! Fails`
        })];

        console.log("BLOCK CHALLENGE DEBUG: Setting revealedBlockingCardId to:", blockingCardObj?.id);
        result.actionInProgress = {
          ...game.actionInProgress,
          losingPlayer: playerId,
          challengeInProgress: true,
          challengeDefense: true,
          responses: updatedResponses,
          revealedBlockingCardId: blockingCardObj?.id // Store the ID of the revealed blocking card
        };
      } else {
        // Challenge succeeds, blocker loses influence
        result.logs = [createLog('challenge-success', player, {
          target: blockingPlayer.name,
          targetColor: blockingPlayer.color,
          card: blockingCard,
          message: `challenges ${blockingCard} block! Success`
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
          
          result.logs.push(createSystemLog(GameMessages.system.stealBlocked));

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

      // Immediately resolve steal if the target player allows it
      if (playerId === game.actionInProgress.target) {
        // Target player has allowed - immediately complete steal without waiting for others
        const updatedPlayers = [...game.players];
        const targetId = game.actionInProgress.target ?? 0;
        
        // Calculate coins to steal (up to 2)
        const stolenCoins = Math.min(updatedPlayers[targetId].coins, 2);
        
        // Transfer coins
        updatedPlayers[targetId].coins -= stolenCoins;
        updatedPlayers[game.actionInProgress.player].coins += stolenCoins;

        result.logs = [createLog('allow', player, {
          target: actionPlayer.name,
          targetColor: actionPlayer.color,
          message: GameMessages.responses.allowSteal
        })];

        result.logs.push(createLog('steal', actionPlayer, {
          target: targetPlayer.name,
          targetColor: targetPlayer.color,
          coins: stolenCoins,
          message: `steals $${stolenCoins}M from`
        }));

        result.players = updatedPlayers;
        result.actionInProgress = null;
        
        // Get next turn and reset actionUsedThisTurn flag
        const nextTurn = advanceToNextTurn(updatedPlayers, game.currentTurn);
        result.currentTurn = nextTurn.currentTurn;
        result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
        
        return result;
      }

      // For non-target players, just record their response
      // Check if all other non-eliminated players have allowed
      const otherPlayers = game.players.filter(p => 
        p.id !== game.actionInProgress!.player + 1 && 
        p.id !== (game.actionInProgress!.target ?? -1) + 1 && 
        !p.eliminated
      );
      
      // For targeted actions, target must have responded
      const targetResponded = game.actionInProgress.target === undefined ||
        updatedResponses[game.actionInProgress.target] !== undefined;
      
      const allResponded = targetResponded && otherPlayers.every(p => 
        updatedResponses[p.id - 1] !== undefined
      );

      if (allResponded) {
        // Check if anyone blocked
        const anyPlayerBlocked = Object.values(updatedResponses).some(
          r => r.type === 'block'
        );
        
        if (!anyPlayerBlocked) {
          // All players allowed - complete steal
          const updatedPlayers = [...game.players];
          const targetId = game.actionInProgress.target ?? 0;
          
          // Calculate coins to steal (up to 2)
          const stolenCoins = Math.min(updatedPlayers[targetId].coins, 2);
          
          // Transfer coins
          updatedPlayers[targetId].coins -= stolenCoins;
          updatedPlayers[game.actionInProgress.player].coins += stolenCoins;

          result.logs = [createLog('steal', actionPlayer, {
            target: targetPlayer.name,
            targetColor: targetPlayer.color,
            coins: stolenCoins,
            message: `steals $${stolenCoins}M from`
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

    return result;
  }
};