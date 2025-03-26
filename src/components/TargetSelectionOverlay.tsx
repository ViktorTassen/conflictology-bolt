import React from 'react';
import { Target, User, X } from 'lucide-react';
import { GameAction } from '../types';

interface TargetSelectionOverlayProps {
  actionType: GameAction['type'];
  onCancel: () => void;
}

export function TargetSelectionOverlay({ actionType, onCancel }: TargetSelectionOverlayProps) {
  // Get the nice name for the action
  const getActionName = (type: GameAction['type']) => {
    switch (type) {
      case 'assassinate':
        return 'Assassinate';
      case 'steal':
        return 'Steal';
      case 'coup':
        return 'Coup';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  // Get the action color based on type
  // Get the classes based on action type
  const getActionClasses = (type: GameAction['type']) => {
    switch (type) {
      case 'assassinate':
        return {
          icon: 'text-red-500',
          border: 'border-red-500/20',
          shadow: 'shadow-red-500/10',
          bgHint: 'bg-red-900/70',
          iconHint: 'text-red-300'
        };
      case 'steal':
        return {
          icon: 'text-blue-500',
          border: 'border-blue-500/20',
          shadow: 'shadow-blue-500/10',
          bgHint: 'bg-blue-900/70',
          iconHint: 'text-blue-300'
        };
      case 'coup':
        return {
          icon: 'text-amber-500',
          border: 'border-amber-500/20',
          shadow: 'shadow-amber-500/10',
          bgHint: 'bg-amber-900/70',
          iconHint: 'text-amber-300'
        };
      default:
        return {
          icon: 'text-gray-500',
          border: 'border-gray-500/20',
          shadow: 'shadow-gray-500/10',
          bgHint: 'bg-gray-900/70',
          iconHint: 'text-gray-300'
        };
    }
  };

  const classes = getActionClasses(actionType);
  const actionName = getActionName(actionType);

  return (
    <div className="relative z-40 pointer-events-none">
      {/* Compact target selection bar positioned at bottom */}
      <div className="absolute bottom-44
       inset-x-0 flex justify-center pointer-events-auto">
        <div className={`
          ${classes.bgHint} backdrop-blur-md 
          px-4 py-2 rounded-full
          border ${classes.border}
          shadow-lg 
          animate-in fade-in slide-in-from-bottom-4
          flex items-center gap-3
          max-w-[90%]
        `}>
          <div className="flex items-center gap-2">
            <Target className={`w-4 h-4 ${classes.icon}`} />
            <span className="text-white text-sm font-medium">{actionName}</span>
          </div>
          
          <div className="h-4 w-px bg-white/20"></div>
          
          <div className="flex items-center gap-1.5">
            <User className={`w-3.5 h-3.5 ${classes.iconHint}`} />
            <span className="text-white/90 text-xs whitespace-nowrap">Tap to target</span>
          </div>
          
          <button
            onClick={onCancel}
            className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors ml-1"
            aria-label="Cancel target selection"
          >
            <X className="w-3 h-3 text-white/80" />
          </button>
        </div>
      </div>
    </div>
  );
}