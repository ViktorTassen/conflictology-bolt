import { useMemo } from 'react';
import { Game, GameState, ResponseType, CardType } from '../types';

interface GameStateHelpers {
  getGameState: (playerId: number) => GameState;
  getResponseOptions: (playerId: number) => {
    showBlock: boolean;
    showChallenge: boolean;
    showAllow: boolean;
    blockText: string;
    challengeText: string;
    allowText: string;
    blockCards?: CardType[];
  } | null;
  shouldShowResponseButtons: (playerId: number) => boolean;
  isPlayerTargetable: (playerId: number, targetId: number) => boolean;
}

export function useGameState(game: Game | null, selectedAction?: string | null): GameStateHelpers {
  return useMemo(() => ({
    getGameState: (playerId: number): GameState => {
      if (!game) return 'waiting_for_others';
      
      const actionInProgress = game.actionInProgress;
      if (actionInProgress) {
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
        
        if (actionInProgress.player === playerId) {
          if (actionInProgress.blockingPlayer !== undefined) {
            return 'waiting_for_response';
          }
          return 'waiting_for_others';
        }
        return 'waiting_for_response';
      }
      
      if (selectedAction) {
        return 'waiting_for_target';
      }
      
      return game.currentTurn === playerId ? 'waiting_for_action' : 'waiting_for_turn';
    },

    getResponseOptions: (playerId: number) => {
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
            challengeText: `Challenge`,
            allowText: 'Accept block'
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
            blockCards = ['Captain', 'Ambassador'];
            blockText = 'Block with Captain/Ambassador';
            showBlock = isTarget; // Only target can block steal
            break;
            
          case 'assassinate':
            blockCards = ['Contessa'];
            blockText = 'Block with Contessa';
            showBlock = isTarget; // Only target can block assassination
            break;
            
          case 'duke':
            showBlock = false;
            break;


          case 'income':
            showBlock = false;
            break;
            
          default:
            showBlock = false;
        }

        return {
          showBlock,
          showChallenge,
          showAllow: true,
          blockText,
          challengeText: `Challenge ${actionType === 'duke' ? 'Duke' : 
                          actionType === 'steal' ? 'Captain' : 
                          actionType === 'assassinate' ? 'Assassin' : 
                          actionType === 'exchange' ? 'Ambassador' : actionType}`,
          allowText: 'Allow action',
          blockCards
        };
      }

      return null;
    },

    shouldShowResponseButtons: (playerId: number): boolean => {
      if (!game?.actionInProgress) return false;
      
      // Check if player is eliminated - eliminated players should never see response buttons
      if (game.players[playerId]?.eliminated) return false;
      
      const { actionInProgress } = game;
      
      // If already responded or losing influence, don't show buttons
      if (actionInProgress.responses[playerId]) return false;
      if (actionInProgress.losingPlayer === playerId) return false;
      
      // IMPORTANT: Don't show response buttons during a challenge resolution
      // This prevents UI confusion after a player loses a challenge
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
      
      // Special case for targeted actions - only target or others can respond
      const isTarget = actionInProgress.target === playerId;
      
      if (actionInProgress.blockingPlayer !== undefined) {
        // For blocks, action player and non-blockers can respond
        return actionInProgress.player === playerId || actionInProgress.blockingPlayer !== playerId;
      }
      
      // Don't show buttons to the player performing the action
      if (actionInProgress.player === playerId) return false;
      
      // For steal and assassinate, only the target should respond first
      if ((actionInProgress.type === 'steal' || actionInProgress.type === 'assassinate') && 
          !isTarget && Object.keys(actionInProgress.responses).length === 0) {
        // No one has responded yet, wait for target
        return false;
      }
      
      return true;
    },

    isPlayerTargetable: (playerId: number, targetId: number): boolean => {
      if (!selectedAction) return false;
      
      const targetableActions = ['steal', 'assassinate', 'coup'];
      return targetableActions.includes(selectedAction) && targetId !== playerId;
    }
  }), [game, selectedAction]);
}