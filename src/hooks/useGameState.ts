import { useMemo } from 'react';
import { Game, GameState, ResponseType } from '../types';

interface GameStateHelpers {
  getGameState: (playerId: number) => GameState;
  getResponseOptions: (playerId: number) => {
    showBlock: boolean;
    showChallenge: boolean;
    showAllow: boolean;
    blockText: string;
    challengeText: string;
    allowText: string;
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

      if (actionInProgress.blockingPlayer !== undefined) {
        if (actionInProgress.player === playerId || actionInProgress.blockingPlayer !== playerId) {
          return {
            showBlock: false,
            showChallenge: true,
            showAllow: true,
            blockText: '',
            challengeText: 'Challenge Duke',
            allowText: 'Accept block'
          };
        }
      }

      if (actionInProgress.player !== playerId) {
        return {
          showBlock: true,
          showChallenge: false,
          showAllow: true,
          blockText: 'Block with Duke',
          challengeText: '',
          allowText: 'Allow action'
        };
      }

      return null;
    },

    shouldShowResponseButtons: (playerId: number): boolean => {
      if (!game?.actionInProgress) return false;
      
      const { actionInProgress } = game;
      
      if (actionInProgress.responses[playerId]) return false;
      if (actionInProgress.losingPlayer === playerId) return false;
      
      if (actionInProgress.blockingPlayer !== undefined) {
        return actionInProgress.player === playerId || actionInProgress.blockingPlayer !== playerId;
      }
      
      return actionInProgress.player !== playerId;
    },

    isPlayerTargetable: (playerId: number, targetId: number): boolean => {
      if (!selectedAction) return false;
      
      const targetableActions = ['steal', 'assassinate', 'coup'];
      return targetableActions.includes(selectedAction) && targetId !== playerId;
    }
  }), [game, selectedAction]);
}