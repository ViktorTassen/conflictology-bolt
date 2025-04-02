import { useMemo } from 'react';
import { Game, GameState, CardType, ResponseOptions } from '../types';

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
        
        // Special handling for swap action - ONLY for the player who initiated the swap
        if (actionInProgress.type === 'swap' && 
            actionInProgress.player === playerId && 
            actionInProgress.exchangeCards) {
          return 'waiting_for_exchange';
        }
        
        // Special handling for investigate action - target player selecting a card
        if (actionInProgress.type === 'investigate' && 
            actionInProgress.target === playerId && 
            !actionInProgress.investigateCard &&
            !actionInProgress.challengeInProgress &&
            actionInProgress.responses[playerId]?.type === 'allow') {
          return 'waiting_for_card_selection';
        }
        
        // Special handling for investigate action - Police player deciding on the card
        if (actionInProgress.type === 'investigate' && 
            actionInProgress.player === playerId && 
            actionInProgress.investigateCard) {
          return 'waiting_for_investigate_decision';
        }
        
        // For other players during an exchange/swap/investigate, they should be in waiting_for_others state
        if ((actionInProgress.type === 'exchange' || 
             actionInProgress.type === 'swap') && 
            actionInProgress.exchangeCards) {
          return 'waiting_for_others';
        }
        
        // For other players during card investigation
        if (actionInProgress.type === 'investigate') {
          // If this player has already allowed, they should wait
          if (actionInProgress.responses[playerId]?.type === 'allow') {
            return 'waiting_for_others';
          }
          
          // If target has allowed, everyone should wait
          if (actionInProgress.target !== undefined && 
              actionInProgress.responses[actionInProgress.target]?.type === 'allow') {
            return 'waiting_for_others';
          }
          
          // If investigation card is being shown
          if (actionInProgress.investigateCard) {
            return 'waiting_for_others';
          }
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
        let showChallenge = true;
        let showBlock = false;
        
        switch (actionType) {
          case 'foreign-aid':
            blockCards = ['Banker'];
            showBlock = true;
            showChallenge = false; // Foreign Aid can't be challenged
            break;
            
          case 'steal':
            // For steal, you can block with Mafia, Reporter, or Police
            blockCards = ['Mafia', 'Reporter', 'Police'];
            showBlock = isTarget; // Only target can block steal
            break;
            
          case 'hack':
            blockCards = ['Judge'];
            showBlock = isTarget; // Only target can block hack
            break;
            
          case 'banker':
          case 'exchange':
          case 'investigate':
          case 'swap':
            showBlock = false;
            break;

          case 'income':
          case 'scandal':
            showBlock = false;
            showChallenge = false;
            break;
            
          default:
            showBlock = false;
        }

        // Make sure blockCards is always included for block options
        const validBlockCards = blockCards.length > 0 ? blockCards : ['Banker'] as CardType[];
        
        // For single-card blocks (like Judge or Banker), use the card name as the block text
        const blockText = validBlockCards.length === 1 ? validBlockCards[0] : '';
        
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
      
      // Special case: Don't show response buttons during exchange/swap cards selection
      if (actionInProgress.exchangeCards && 
          (actionInProgress.player === playerId || 
           actionInProgress.type === 'exchange' || 
           actionInProgress.type === 'swap')) {
        return false;
      }
      
      // Hide response buttons for everyone during an exchange/swap
      if (actionInProgress.exchangeCards) {
        return false;
      }
      
      // Special case: Don't show response buttons during investigation
      if (actionInProgress.type === 'investigate') {
        // Hide buttons if this player has already allowed
        if (actionInProgress.responses[playerId]?.type === 'allow') {
          return false;
        }
        
        // Hide buttons for everyone if target has allowed
        if (actionInProgress.target !== undefined && 
            actionInProgress.responses[actionInProgress.target]?.type === 'allow') {
          return false;
        }
        
        // Hide buttons during card selection or investigation decision
        if (actionInProgress.investigateCard) {
          return false;
        }
      }
      
      // If there's a block in progress
      if (actionInProgress.blockingPlayer !== undefined) {
        // For blocks, action player and non-blockers can respond
        return actionInProgress.player === playerId || actionInProgress.blockingPlayer !== playerId;
      }
      
      // Don't show buttons to the player performing the action
      if (actionInProgress.player === playerId) return false;
      
      return true;
    },

    isPlayerTargetable: (playerId: number, targetId: number): boolean => {
      if (!game || !selectedAction) return false;
      
      // Check if target player is eliminated
      if (game.players[targetId]?.eliminated) return false;
      
      // Check if target has any non-revealed cards for investigate action
      if (selectedAction === 'investigate') {
        const targetPlayer = game.players[targetId];
        const targetHasCards = targetPlayer.influence.some(i => !i.revealed);
        return targetHasCards && targetId !== playerId;
      }
      
      const targetableActions = ['steal', 'hack', 'scandal', 'investigate'];
      return targetableActions.includes(selectedAction) && targetId !== playerId;
    }
  }), [game, selectedAction]);
}