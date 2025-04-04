import { forwardRef } from 'react';
import { Fingerprint, LoaderPinwheel } from 'lucide-react';

interface ActionButtonProps {
  onClick: () => void;
  disabled: boolean;
  canTakeAction: boolean;
  isCurrentTurn: boolean;
  gameActionUsedThisTurn: boolean;
  isActionInProgress: boolean;
  showActions: boolean;
  gameState: string;
}

export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  (
    {
      onClick,
      disabled,
      canTakeAction,
      isCurrentTurn,
      gameActionUsedThisTurn,
      isActionInProgress,
      showActions,
      gameState
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
        className="relative group"
        disabled={disabled}
      >
        {canTakeAction && !isActionInProgress && (
          <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 fire-pulse" />
        )}

        {isCurrentTurn && gameActionUsedThisTurn && !isActionInProgress && (
          <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-gray-500/20 via-gray-400/30 to-gray-500/20" />
        )}
        
        {isActionInProgress && (
          <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-100/30 to-amber-300/20 pulse" />
        )}

        <div className={`
          absolute -inset-2
          rounded-full
          bg-gradient-to-r from-slate-700 via-slate-500 to-slate-700
          ${showActions ? 'pulse-ring opacity-100' : 'opacity-0'}
          ${isActionInProgress ? 'opacity-0' : 'group-hover:opacity-100'}
          transition-opacity duration-300
        `} />

        <div className={`
          relative
          w-14 h-14
          rounded-full
          bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a]
          flex items-center justify-center
          shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_20px_rgba(0,0,0,0.5)]
          border border-slate-700/50
          overflow-hidden
          transition-all duration-300
          ${showActions ? 'ring-2 ring-slate-400/30' : ''}
          ${canTakeAction && !isActionInProgress ? 'ring-2 ring-amber-500/30' : ''} 
          ${isActionInProgress ? 'ring-2 ring-amber-300/30' : ''}
          ${isCurrentTurn && gameActionUsedThisTurn && !isActionInProgress ? 'ring-2 ring-gray-500/30' : ''}
          ${(!isCurrentTurn || gameState === 'waiting_for_influence_loss') && !isActionInProgress ? 'opacity-50 cursor-not-allowed' : ''}
          ${isCurrentTurn && gameActionUsedThisTurn && !isActionInProgress ? 'opacity-70 cursor-not-allowed' : ''}
          ${isActionInProgress ? 'opacity-90 cursor-wait' : ''}
        `}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-300/10 to-transparent transform -rotate-45 gem-shine" />

          <div className="absolute inset-0 bg-gradient-to-tl from-amber-700/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-amber-600/10 to-transparent" />

          <div className={`
            absolute -inset-1
            blur-lg
            transition-opacity duration-300
            ${canTakeAction && !isActionInProgress ? 'bg-amber-400/20 opacity-100' : ''}
            ${isActionInProgress ? 'bg-amber-300/20 opacity-100' : ''}
            ${isCurrentTurn && gameActionUsedThisTurn && !isActionInProgress ? 'bg-gray-400/20 opacity-100' : ''}
            ${!isCurrentTurn && !isActionInProgress ? 'bg-amber-400/20 opacity-0' : ''}
          `} />

          {isActionInProgress ? (
            <LoaderPinwheel className="w-6 h-6 text-amber-300 animate-spin" />
          ) : (
            <Fingerprint className={`
              relative
              w-6 h-6
              transition-all duration-300
              ${showActions ? 'text-amber-300' : ''}
              ${canTakeAction ? 'text-amber-300' : ''}
              ${isCurrentTurn && gameActionUsedThisTurn ? 'text-gray-400' : ''}
              ${!isCurrentTurn ? 'text-slate-400' : ''}
              ${canTakeAction ? 'group-hover:text-amber-300' : ''}
              ${canTakeAction ? 'transform group-hover:scale-110' : ''}
            `} />
          )}
        </div>
      </button>
    );
  }
);

ActionButton.displayName = 'ActionButton';