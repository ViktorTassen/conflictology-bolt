import { DollarSign, Sword, Crown, UserX, Users, Ship } from 'lucide-react';
import { GameAction } from '../types';

interface ActionMenuProps {
  onClose: () => void;
  onActionSelect: (action: GameAction) => void;
  playerCoins: number;
}

export function ActionMenu({ onClose, onActionSelect, playerCoins }: ActionMenuProps) {
  const actions: GameAction[] = [
    { type: 'income', icon: DollarSign, name: 'Income', description: 'Take $1M' },
    { type: 'foreign-aid', icon: DollarSign, name: 'Foreign Aid', description: 'Take $2M' },
    { type: 'duke', icon: Crown, name: 'Duke', description: 'Take $3M as tax' },
    { type: 'assassinate', icon: Sword, name: 'Assassin', description: 'Pay $3M to assassinate', cost: 3 },
    { type: 'steal', icon: Ship, name: 'Captain', description: 'Steal $2M' },
    { type: 'exchange', icon: Users, name: 'Ambassador', description: 'Exchange 2 cards' },
    { type: 'coup', icon: UserX, name: 'Coup', description: 'Pay $7M to coup', cost: 7 },
  ];

  const isActionDisabled = (action: GameAction): boolean => {
    // Check if action has a cost and player doesn't have enough coins
    return action.cost !== undefined && playerCoins < action.cost;
  };

  return (
    <div 
      className="bg-[#1a1a1a] rounded-lg p-2 w-48 shadow-xl border border-slate-800/50 backdrop-blur-sm
                 animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      <div className="space-y-1">
        {actions.map((action, index) => {
          const disabled = isActionDisabled(action);
          
          return (
            <button
              key={action.name}
              onClick={() => {
                if (!disabled) {
                  onActionSelect(action);
                  onClose();
                }
              }}
              disabled={disabled}
              className={`
                w-full flex items-center gap-2 p-1.5 rounded 
                transition-colors text-left group
                animate-in fade-in slide-in-from-bottom-1
                ${disabled 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-slate-800/50'}
              `}
              style={{
                animationDelay: `${index * 50}ms`,
                animationFill: 'forwards'
              }}
            >
              <action.icon className={`
                w-4 h-4 
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
                  {disabled && action.cost && ` (need ${action.cost} coins)`}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}