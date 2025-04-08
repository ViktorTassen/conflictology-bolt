import { DollarSign, Sword, Crown, Skull, Users, Ship, Euro, Eye, RefreshCw } from 'lucide-react';
import { GameAction } from '../types';

// Import card images
import bankerImage from '../assets/images/banker.png';
import hackerImage from '../assets/images/hacker.png';
import mafiaImage from '../assets/images/mafia.png';
import reporterImage from '../assets/images/reporter.png';
import judgeImage from '../assets/images/judge.png';
import policeImage from '../assets/images/police.png';

interface ActionMenuProps {
  onClose: () => void;
  onActionSelect: (action: GameAction) => void;
  playerCoins: number;
}

export function ActionMenu({ onClose, onActionSelect, playerCoins }: ActionMenuProps) {
  // Group 1: Universal actions that don't require specific cards
  const universalActions: GameAction[] = [
    { type: 'income', icon: DollarSign, name: 'Income', description: 'Take $1M' },
    { type: 'foreign-aid', icon: Euro, name: 'Foreign Aid', description: 'Take $2M' },
    { type: 'scandal', icon: Skull, name: 'Scandal', description: 'Pay $7M to scandal', cost: 7 },
  ];

  // Group 2: Character-specific actions
  const characterActions: GameAction[] = [
    { type: 'banker', icon: Crown, name: 'Banker', description: 'Take $3M as tax', cardImage: bankerImage },
    { type: 'hack', icon: Sword, name: 'Hacker', description: 'Pay $3M to hack', cost: 3, cardImage: hackerImage },
    { type: 'steal', icon: Ship, name: 'Mafia', description: 'Steal $2M', cardImage: mafiaImage },
    { type: 'exchange', icon: Users, name: 'Reporter', description: 'Exchange 2 cards', cardImage: reporterImage },
    { type: 'investigate', icon: Eye, name: 'Police (Investigate)', description: 'Investigate a player\'s card', cardImage: policeImage, requiresTarget: true },
    { type: 'swap', icon: RefreshCw, name: 'Police (Swap)', description: 'Swap one of your cards', cardImage: policeImage },
    // Judge is defensive only (blocks hacks) so it doesn't have an action,
    // but we'll display it for player reference
    { type: 'judge', icon: Crown, name: 'Judge', description: 'Blocks Hacker attempts', cardImage: judgeImage },
  ];

  const isActionDisabled = (action: GameAction): boolean => {
    // If player has 10 or more coins, they can only perform scandal
    if (playerCoins >= 10 && action.type !== 'scandal') {
      return true;
    }
    
    // Check if action has a cost and player doesn't have enough coins
    return action.cost !== undefined && playerCoins < action.cost;
  };

  return (
    <div 
      className="bg-[#1a1a1a] rounded-lg p-2 w-64 shadow-xl border border-slate-800/50 backdrop-blur-sm
                 animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      {/* Universal actions section */}
      <div className="space-y-1.5 mb-2">
        {universalActions.map((action, index) => {
          const disabled = isActionDisabled(action);
          
          return (
            <div
              key={action.type}
              onClick={() => {
                if (!disabled) {
                  onActionSelect(action);
                  onClose();
                }
              }}
              className={`
                w-full flex items-center gap-2 p-1.5 rounded 
                transition-colors text-left group
                animate-in fade-in slide-in-from-bottom-1
                ${disabled 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-slate-800/50 cursor-pointer'}
              `}
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              <action.icon className={`
                w-7 h-7 shrink-0
                ${disabled 
                  ? 'text-slate-500' 
                  : 'text-slate-400 group-hover:text-slate-300 transition-colors'}
              `} />
              <div>
                <div className={`
                  text-sm 
                  ${disabled 
                    ? 'text-slate-400' 
                    : 'text-slate-300 group-hover:text-white transition-colors'}
                `}>
                  {action.name}
                </div>
                <div className={`
                  text-xs 
                  ${disabled 
                    ? 'text-slate-600' 
                    : 'text-slate-500 group-hover:text-slate-400 transition-colors'}
                `}>
                  {action.description}
                  {disabled && action.cost && ` (need $${action.cost}M)`}
                  {action.type === 'scandal' && playerCoins >= 10 && ' (mandatory with $10M+)'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div className="h-px bg-slate-800/70 my-2"></div>
      
      {/* Character actions section */}
      <div className="space-y-1.5">
        {characterActions.map((action, index) => {
          // Make Judge non-actionable as it's just for reference
          const isJudge = action.type === 'judge';
          const disabled = isJudge || isActionDisabled(action);
          
          return (
            <div
              key={action.type}
              onClick={() => {
                if (!disabled && !isJudge) {
                  onActionSelect(action);
                  onClose();
                }
              }}
              className={`
                w-full flex items-center gap-3 p-1.5 rounded 
                transition-colors text-left group
                animate-in fade-in slide-in-from-bottom-1
                ${isJudge 
                  ? 'opacity-70 cursor-default' 
                  : disabled 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-slate-800/50 cursor-pointer'}
              `}
              style={{
                animationDelay: `${(index + universalActions.length) * 50}ms`,
              }}
            >
              {/* Card image instead of icon */}
              <div 
                className={`
                  w-7 h-10 rounded overflow-hidden shrink-0 shadow-md 
                  ${isJudge ? '' : 'transition-transform group-hover:scale-105'}
                `}
                style={{ transform: `rotate(${-4 + (index * 3)}deg)` }}
              >
                <img 
                  src={action.cardImage} 
                  alt={action.name} 
                  className="w-full h-full object-cover" 
                />
                {/* Shine effect on hover for clickable cards */}
                {!isJudge && (
                  <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
              
              <div>
                <div className={`
                  text-sm 
                  ${isJudge
                    ? 'text-slate-400 italic'
                    : disabled 
                      ? 'text-slate-400' 
                      : 'text-slate-300 group-hover:text-white transition-colors'}
                `}>
                  {action.name}
                  {isJudge && " (Defensive)"}
                </div>
                <div className={`
                  text-xs 
                  ${isJudge
                    ? 'text-slate-600 italic'
                    : disabled 
                      ? 'text-slate-600' 
                      : 'text-slate-500 group-hover:text-slate-400 transition-colors'}
                `}>
                  {action.description}
                  {!isJudge && disabled && action.cost && ` (need $${action.cost}M)`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}