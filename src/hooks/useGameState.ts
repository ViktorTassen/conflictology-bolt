import { useMemo } from 'react';
import { Game, GameState, ResponseType, CardType, ResponseOptions } from '../types';

interface GameStateHelpers {
  getGameState: (playerId: number) => GameState;
  getResponseOptions: (playerId: number) => ResponseOptions | null;
  shouldShowResponseButtons: (playerId: number) => boolean;
  isPlayerTargetable: (playerId: number, targetId: number) => boolean;
}

export function useGameState(game: Game | null, selectedAction?: string | null): GameStateHelpers {
  return useMemo(() => ({
    getGameState: (playerId: number): GameState => {
      if (!game) return 'waiting_for_others';
      
      const actionInProgress = game.actionInProgress;
      if (actionInProgress) {
        // Player needs to lose influence
        if (actionInProgress.losingPlayer === playerId) {
          return 'waiting_for_influence_loss';
        }
        
        // Special handling for exchange action - ONLY for the player who initiated the exchange
        if (actionInProgress.type === 'exchange' && 
            actionInProgress.player === playerId && 
            actionInProgress.exchangeCards) {
          return 'waiting_for_exchange';
        }
        
        // For other players during an exchange, they should be in waiting_for_others state
        if (actionInProgress.type === 'exchange' && 
            actionInProgress.exchangeCards) {
          return 'waiting_for_others';
        }
        
        // Player who initiated the action waits for others, unless a block happened
        if (actionInProgress.player === playerId) {
          if (actionInProgress.blockingPlayer !== undefined) {
            return 'waiting_for_response';
          }
          return 'waiting_for_others';
        }
        
        // All other players are in response mode
        return 'waiting_for_response';
      }
      
      // Player selected an action that requires target
      if (selectedAction) {
        return 'waiting_for_target';
      }
      
      // Default states - active player or waiting player
      return game.currentTurn === playerId ? 'waiting_for_action' : 'waiting_for_turn';
    },

    getResponseOptions: (playerId: number): ResponseOptions | null => {
      if (!game?.actionInProgress) return null;

      const { actionInProgress } = game;
      const actionType = actionInProgress.type;
      const isTarget = actionInProgress.target === playerId;

      // Handle responses to blocks
      if (actionInProgress.blockingPlayer !== undefined) {
        const blockingCard = actionInProgress.blockingCard as CardType;
        
        // If you're the action player or not the blocker, you can challenge or allow
        if (actionInProgress.player === playerId || actionInProgress.blockingPlayer !== playerId) {
          return {
            showBlock: false,
            showChallenge: true,
            showAllow: true,
            blockText: '',
            challengeText: 'Challenge',
            allowText: 'Allow'
          };
        }
      }

      // Handle responses to actions
      if (actionInProgress.player !== playerId) {
        // Determine what cards can block this action
        let blockCards: CardType[] = [];
        let blockText = '';
        let showChallenge = true;
        let showBlock = false;
        
        switch (actionType) {
          case 'foreign-aid':
            blockCards = ['Duke'];
            blockText = 'Block';
            showBlock = true;
            showChallenge = false; // Foreign Aid can't be challenged
            break;
            
          case 'steal':
            // For steal, you can block with either Captain or Ambassador
            blockCards = ['Captain', 'Ambassador'];
            blockText = 'Block';  // We'll show options in the dropdown
            showBlock = isTarget; // Only target can block steal
            console.log('Setting up block cards for steal:', blockCards);
            break;
            
          case 'assassinate':
            blockCards = ['Contessa'];
            blockText = 'Block';
            showBlock = isTarget; // Only target can block assassination
            break;
            
          case 'duke':
          case 'exchange':
            showBlock = false;
            break;

          case 'income':
          case 'coup':
            showBlock = false;
            showChallenge = false;
            break;
            
          default:
            showBlock = false;
        }

        // Make sure blockCards is always included for block options
        const validBlockCards = blockCards.length > 0 ? blockCards : ['Duke'] as CardType[];
        
        console.log('Providing response options:', {
          showBlock,
          showChallenge,
          showAllow: true,
          blockText,
          challengeText: 'Challenge',
          allowText: 'Allow',
          blockCards: validBlockCards
        });
        
        return {
          showBlock,
          showChallenge,
          showAllow: true,
          blockText,
          challengeText: 'Challenge',
          allowText: 'Allow',
          blockCards: validBlockCards
        };
      }

      return null;
    },

    shouldShowResponseButtons: (playerId: number): boolean => {
      if (!game?.actionInProgress) return false;
      
      // Check if player is eliminated
      if (game.players[playerId]?.eliminated) return false;
      
      const { actionInProgress } = game;
      
      // If already responded or losing influence, don't show buttons
      if (actionInProgress.responses[playerId]) return false;
      if (actionInProgress.losingPlayer === playerId) return false;
      
      // Don't show response buttons during a challenge resolution
      if (actionInProgress.challengeInProgress) {
        return false;
      }
      
      // Don't show response buttons if ANY player is losing influence
      if (actionInProgress.losingPlayer !== undefined) {
        return false;
      }
      
      // Special case: Don't show response buttons during exchange cards selection
      if (actionInProgress.exchangeCards && actionInProgress.player === playerId) {
        return false;
      }
      
      // Hide response buttons for everyone during an exchange
      if (actionInProgress.exchangeCards) {
        return false;
      }
      
      // If there's a block in progress
      if (actionInProgress.blockingPlayer !== undefined) {
        // For blocks, action player and non-blockers can respond
        return actionInProgress.player === playerId || actionInProgress.blockingPlayer !== playerId;
      }
      
      // Don't show buttons to the player performing the action
      if (actionInProgress.player === playerId) return false;
      
      // FIXED: Allow all players to respond simultaneously
      // Only limit who can block (handled by getResponseOptions)
      return true;
    },

    isPlayerTargetable: (playerId: number, targetId: number): boolean => {
      if (!game || !selectedAction) return false;
      
      // Check if target player is eliminated
      if (game.players[targetId]?.eliminated) return false;
      
      const targetableActions = ['steal', 'assassinate', 'coup'];
      return targetableActions.includes(selectedAction) && targetId !== playerId;
    }
  }), [game, selectedAction]);
}