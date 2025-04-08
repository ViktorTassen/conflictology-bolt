import { ActionHandler, ActionResponse, ActionResult, advanceToNextTurn } from './types';
import { GameMessages } from '../messages';
import { cardService } from '../services/CardService';
import { loggingService } from '../services/LoggingService';
import { GameLogEntry, LogType } from '../types';

export const stealAction: ActionHandler = {
  execute: async ({ game, player, playerId }) => {
    if (player.eliminated) {
      throw new Error('Eliminated players cannot perform actions');
    }

    if (game.actionInProgress?.target === undefined) {
      throw new Error('Steal requires a target');
    }
    
    const targetPlayer = game.players[game.actionInProgress.target];
    
    if (targetPlayer.eliminated) {
      throw new Error('Cannot target an eliminated player');
    }

    const result: ActionResult = {
      logs: [loggingService.createLog('steal', player, {
        target: targetPlayer.name,
        targetColor: targetPlayer.color,
        targetId: game.actionInProgress.target,
        message: GameMessages.actions.steal,
        playerId: playerId
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

      // We'll add the "The Steal was blocked" message elsewhere to avoid duplicates
      // This section is for when a player who challenged a block has failed
      
      if (game.actionInProgress.blockingPlayer === playerId) {
        const stolenCoins = Math.min(targetPlayer.coins, 2);
        
        const updatedPlayers = [...game.players];
        updatedPlayers[game.actionInProgress.target ?? 0].coins -= stolenCoins;
        updatedPlayers[game.actionInProgress.player].coins += stolenCoins;
        
        // Create a custom log for steal with explicit target
        const stealLog: GameLogEntry = {
          type: 'steal' as LogType, // Type assertion to LogType
          player: actionPlayer.name,
          playerColor: actionPlayer.color,
          timestamp: Date.now(),
          playerId: game.actionInProgress.player,
          targetId: game.actionInProgress.target ?? 0,
          target: targetPlayer.name,
          targetColor: targetPlayer.color,
          coins: stolenCoins,
          message: `steals $${stolenCoins}M from ${targetPlayer.name}`,
          messageParts: [
            { type: 'text', content: `steals $${stolenCoins}M from ` },
            { type: 'player', content: targetPlayer.name, playerId: game.actionInProgress.target ?? 0, color: targetPlayer.color }
          ]
        };
        result.logs.push(stealLog);
        
        result.players = updatedPlayers;
      }
      else if (game.actionInProgress.losingPlayer === playerId && 
               playerId !== game.actionInProgress.player) {
        
        if (game.actionInProgress.blockingPlayer !== undefined) {
          // Only add the 'steal blocked' message if this is from a challenge on a block
          // If it's a regular lose_influence, the message will be added when player allows the block
          if (game.actionInProgress.challengeDefense) {
            result.logs.push(loggingService.createSystemLog(GameMessages.system.stealBlocked));
          }
          
          result.actionInProgress = null;
          
          const nextTurn = advanceToNextTurn(game.players, game.currentTurn);
          result.currentTurn = nextTurn.currentTurn;
          result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
          
          return result;
        }
        
        if (playerId !== game.actionInProgress.target) {
          // This is a third-party challenger who failed (not the target)
          // Complete the steal action immediately instead of showing more response buttons
          const stolenCoins = Math.min(targetPlayer.coins, 2);
          const target = game.actionInProgress.target ?? 0;
          
          const updatedPlayers = [...game.players];
          updatedPlayers[target].coins -= stolenCoins;
          updatedPlayers[game.actionInProgress.player].coins += stolenCoins;
          
          // Create a custom log with explicit message parts for the steal result
          const stealLog: GameLogEntry = {
            type: 'steal' as LogType,
            player: actionPlayer.name,
            playerColor: actionPlayer.color,
            timestamp: Date.now(),
            playerId: game.actionInProgress.player,
            targetId: target,
            target: targetPlayer.name,
            targetColor: targetPlayer.color,
            coins: stolenCoins,
            message: `steals $${stolenCoins}M from ${targetPlayer.name}`,
            messageParts: [
              { type: 'text', content: `steals $${stolenCoins}M from ` },
              { type: 'player', content: targetPlayer.name, playerId: target, color: targetPlayer.color }
            ]
          };
          
          result.logs.push(stealLog);
          
          result.players = updatedPlayers;
          result.actionInProgress = null; // Immediately resolve the action
          
          const nextTurn = advanceToNextTurn(game.players, game.currentTurn);
          result.currentTurn = nextTurn.currentTurn;
          result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
          
          return result;
        }
        
        const stolenCoins = Math.min(targetPlayer.coins, 2);
        
        const updatedPlayers = [...game.players];
        updatedPlayers[game.actionInProgress.target ?? 0].coins -= stolenCoins;
        updatedPlayers[game.actionInProgress.player].coins += stolenCoins;
        
        // Create a custom log for steal with explicit target
        const stealLog: GameLogEntry = {
          type: 'steal' as LogType,
          player: actionPlayer.name,
          playerColor: actionPlayer.color,
          timestamp: Date.now(),
          playerId: game.actionInProgress.player,
          targetId: game.actionInProgress.target ?? 0,
          target: targetPlayer.name,
          targetColor: targetPlayer.color,
          coins: stolenCoins,
          message: `steals $${stolenCoins}M from ${targetPlayer.name}`,
          messageParts: [
            { type: 'text', content: `steals $${stolenCoins}M from ` },
            { type: 'player', content: targetPlayer.name, playerId: game.actionInProgress.target ?? 0, color: targetPlayer.color }
          ]
        };
        result.logs.push(stealLog);
        
        result.players = updatedPlayers;
      }
      
      result.actionInProgress = null;
      
      const nextTurn = advanceToNextTurn(game.players, game.currentTurn);
      result.currentTurn = nextTurn.currentTurn;
      result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
      
      return result;
    }

    if (response.type === 'block') {
      if (!response.card || !['Mafia', 'Reporter', 'Police'].includes(response.card)) {
        throw new Error('Must block with Mafia, Reporter, or Police');
      }
      
      if (playerId !== game.actionInProgress.target) {
        throw new Error('Only the target can block a steal');
      }
      
      // Get the appropriate block message based on the card
      const blockMessage = response.card === 'Mafia' 
        ? GameMessages.blocks.mafia
        : response.card === 'Reporter' 
          ? GameMessages.blocks.reporter
          : GameMessages.blocks.police;
          
      result.logs = [loggingService.createLog('block', player, {
        target: actionPlayer.name,
        targetColor: actionPlayer.color,
        card: response.card,
        message: blockMessage
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

    if (response.type === 'challenge' && game.actionInProgress.blockingPlayer === undefined) {
      const hasMafia = cardService.hasCardType(game.cards, actionPlayer.id, 'Mafia');

      if (hasMafia) {
        const mafiaCard = game.cards.find(
          c => c.playerId === actionPlayer.id && 
          c.location === 'player' && 
          !c.revealed && 
          c.name === 'Mafia'
        );
        
        if (mafiaCard) {
          const updatedCardsWithReveal = cardService.revealCard(game.cards, mafiaCard.id);
          const cardsAfterReplacement = cardService.replaceCard(updatedCardsWithReveal, mafiaCard.id);
          result.cards = cardsAfterReplacement;
        }
        
        result.logs = [loggingService.createLog('challenge-fail', player, {
          target: actionPlayer.name,
          targetColor: actionPlayer.color,
          card: 'Mafia',
          message: GameMessages.challenges.fail('Mafia')
        })];

        result.actionInProgress = {
          ...game.actionInProgress,
          losingPlayer: playerId,
          challengeInProgress: true,
          challengeDefense: true,
          responses: updatedResponses,
          revealedMafiaCardId: mafiaCard?.id
        };
      } else {
        result.logs = [loggingService.createLog('challenge-success', player, {
          target: actionPlayer.name,
          targetColor: actionPlayer.color,
          card: 'Mafia',
          message: GameMessages.challenges.success('Mafia')
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
    else if (response.type === 'challenge' && game.actionInProgress.blockingPlayer !== undefined) {
      const blockingPlayer = game.players[game.actionInProgress.blockingPlayer];
      const blockingCard = game.actionInProgress.blockingCard;
      const hasCard = cardService.hasCardType(game.cards, blockingPlayer.id, blockingCard!);

      if (hasCard) {
        const blockingCardObj = game.cards.find(
          c => c.playerId === blockingPlayer.id && 
          c.location === 'player' && 
          !c.revealed && 
          c.name === blockingCard
        );
        
        if (blockingCardObj) {
          const updatedCardsWithReveal = cardService.revealCard(game.cards, blockingCardObj.id);
          const cardsAfterReplacement = cardService.replaceCard(updatedCardsWithReveal, blockingCardObj.id);
          result.cards = cardsAfterReplacement;
        }
        
        result.logs = [loggingService.createLog('challenge-fail', player, {
          target: blockingPlayer.name,
          targetColor: blockingPlayer.color,
          card: blockingCard,
          message: GameMessages.challenges.fail(blockingCard!)
        })];

        result.actionInProgress = {
          ...game.actionInProgress,
          losingPlayer: playerId,
          challengeInProgress: true,
          challengeDefense: true,
          responses: updatedResponses,
          revealedBlockingCardId: blockingCardObj?.id
        };
      } else {
        result.logs = [loggingService.createLog('challenge-success', player, {
          target: blockingPlayer.name,
          targetColor: blockingPlayer.color,
          card: blockingCard,
          message: GameMessages.challenges.success(blockingCard!)
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

    if (response.type === 'allow') {
      result.actionInProgress = {
        ...game.actionInProgress,
        responses: updatedResponses
      };

      if (game.actionInProgress.blockingPlayer !== undefined) {
        if (playerId === game.actionInProgress.player) {
          const blockingPlayer = game.players[game.actionInProgress.blockingPlayer];
          
          result.logs = [loggingService.createLog('allow', player, {
            target: blockingPlayer.name,
            targetColor: blockingPlayer.color,
            targetId: game.actionInProgress.blockingPlayer,
            actionType: 'block',
            message: GameMessages.responses.allowBlock
          })];
          
          // Add system message about the steal being blocked
          result.logs.push(loggingService.createSpecificSystemLog('stealBlocked', {}));

          result.actionInProgress = null;
          
          const nextTurn = advanceToNextTurn(game.players, game.currentTurn);
          result.currentTurn = nextTurn.currentTurn;
          result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
          
          return result;
        }
        
        return result;
      }

      if (playerId === game.actionInProgress.target) {
        const updatedPlayers = [...game.players];
        const targetId = game.actionInProgress.target ?? 0;
        
        const stolenCoins = Math.min(updatedPlayers[targetId].coins, 2);
        
        updatedPlayers[targetId].coins -= stolenCoins;
        updatedPlayers[game.actionInProgress.player].coins += stolenCoins;

        result.logs = [loggingService.createLog('allow', player, {
          target: actionPlayer.name,
          targetColor: actionPlayer.color,
          actionType: 'steal',
          message: GameMessages.responses.allowSteal
        })];

        // Create a custom log for steal with explicit target
        const stealLog: GameLogEntry = {
          type: 'steal' as LogType,
          player: actionPlayer.name,
          playerColor: actionPlayer.color,
          timestamp: Date.now(),
          playerId: game.actionInProgress.player,
          targetId: targetId,
          target: targetPlayer.name,
          targetColor: targetPlayer.color,
          coins: stolenCoins,
          message: `steals $${stolenCoins}M from ${targetPlayer.name}`,
          messageParts: [
            { type: 'text', content: `steals $${stolenCoins}M from ` },
            { type: 'player', content: targetPlayer.name, playerId: targetId, color: targetPlayer.color }
          ]
        };
        result.logs.push(stealLog);

        result.players = updatedPlayers;
        result.actionInProgress = null;
        
        const nextTurn = advanceToNextTurn(updatedPlayers, game.currentTurn);
        result.currentTurn = nextTurn.currentTurn;
        result.actionUsedThisTurn = nextTurn.actionUsedThisTurn;
        
        return result;
      }

      const otherPlayers = game.players.filter(p => 
        p.id !== game.actionInProgress!.player + 1 && 
        p.id !== (game.actionInProgress!.target ?? -1) + 1 && 
        !p.eliminated
      );
      
      const targetResponded = game.actionInProgress.target === undefined ||
        updatedResponses[game.actionInProgress.target] !== undefined;
      
      const allResponded = targetResponded && otherPlayers.every(p => 
        updatedResponses[p.id - 1] !== undefined
      );

      if (allResponded) {
        const anyPlayerBlocked = Object.values(updatedResponses).some(
          r => r.type === 'block'
        );
        
        if (!anyPlayerBlocked) {
          const updatedPlayers = [...game.players];
          const targetId = game.actionInProgress.target ?? 0;
          
          const stolenCoins = Math.min(updatedPlayers[targetId].coins, 2);
          
          updatedPlayers[targetId].coins -= stolenCoins;
          updatedPlayers[game.actionInProgress.player].coins += stolenCoins;

          // Create a custom log for steal with explicit target
          const stealLog: GameLogEntry = {
            type: 'steal' as LogType,
            player: actionPlayer.name,
            playerColor: actionPlayer.color,
            timestamp: Date.now(),
            playerId: game.actionInProgress.player,
            targetId: targetId,
            target: targetPlayer.name,
            targetColor: targetPlayer.color,
            coins: stolenCoins,
            message: `steals $${stolenCoins}M from ${targetPlayer.name}`,
            messageParts: [
              { type: 'text', content: `steals $${stolenCoins}M from ` },
              { type: 'player', content: targetPlayer.name, playerId: targetId, color: targetPlayer.color }
            ]
          };
          result.logs = [stealLog];

          result.players = updatedPlayers;
          result.actionInProgress = null;
          
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