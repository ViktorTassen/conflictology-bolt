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
      const playerCards = getPlayerCards(game.cards, playerId);
      
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

      // If the action player was challenged regarding Assassin and won
      if (playerId !== game.actionInProgress.player && 
          game.actionInProgress.challengeInProgress && 
          !game.actionInProgress.blockingPlayer &&
          game.actionInProgress.player !== game.actionInProgress.losingPlayer) {
        
        // Replace the revealed Assassin card
        const updatedCards = replaceCard(result.cards || game.cards, cardToReveal.id);
        result.cards = updatedCards;
      }
      
      // If a blocking player was challenged regarding Contessa and won
      if (game.actionInProgress.blockingPlayer !== undefined && 
          game.actionInProgress.challengeInProgress && 
          game.actionInProgress.blockingPlayer !== game.actionInProgress.losingPlayer) {
        
        // If this was the challenger losing influence (failed challenge to Contessa)
        if (playerId === game.actionInProgress.losingPlayer) {
          // Replace the revealed Contessa card
          const blockingPlayerCards = getPlayerCards(game.cards, game.actionInProgress.blockingPlayer);
          const contessaCard = blockingPlayerCards.find(c => c.name === 'Contessa');
          
          if (contessaCard) {
            const updatedCards = replaceCard(result.cards || game.cards, contessaCard.id);
            result.cards = updatedCards;
          }
        }
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
      // If this was the challenger losing influence (failed challenge)
      else if (game.actionInProgress.losingPlayer === playerId && 
               playerId !== game.actionInProgress.target &&
               !game.actionInProgress.blockingPlayer) {
        
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
      const hasAssassin = hasCardType(game.cards, game.actionInProgress.player, 'Assassin');

      if (hasAssassin) {
        // Challenge fails, challenger loses influence
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
          responses: updatedResponses
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
      const hasContessa = hasCardType(game.cards, game.actionInProgress.blockingPlayer, 'Contessa');

      if (hasContessa) {
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
          responses: updatedResponses
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