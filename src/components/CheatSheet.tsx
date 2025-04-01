import { CardType } from '../types';
import { DollarSign, Skull, Euro } from 'lucide-react';

// Import card images directly
import dukeImage from '../assets/images/duke.png';
import assassinImage from '../assets/images/assassin.png';
import captainImage from '../assets/images/captain.png';
import ambassadorImage from '../assets/images/ambassador.png';
import contessaImage from '../assets/images/contessa.png';
import inquisitorImage from '../assets/images/inquisitor.png';

interface ActionInfo {
  name: string;
  type: string;
  card?: CardType;
  cost?: number;
  description: string;
  canBeBlocked?: boolean;
  canBeChallenged?: boolean;
  blockedBy?: CardType[];
  icon?: React.ComponentType<{ className?: string }>;
  cardImage?: string;
  isDefensive?: boolean;
}

export function CheatSheet() {
  // Basic actions
  const basicActions: ActionInfo[] = [
    {
      name: 'Income',
      type: 'income',
      description: 'Take $1M from treasury',
      canBeBlocked: false,
      canBeChallenged: false,
      icon: DollarSign,
    },
    {
      name: 'Foreign Aid',
      type: 'foreign-aid',
      description: 'Take $2M from treasury',
      canBeBlocked: true,
      blockedBy: ['Duke'],
      icon: Euro,
    },
    {
      name: 'Coup',
      type: 'coup',
      cost: 7,
      description: 'Pay $7M to force card loss. Required with 10+ coins.',
      canBeBlocked: false,
      icon: Skull,
    },
  ];

  // Character actions
  const characterActions: ActionInfo[] = [
    {
      name: 'Duke (Tax)',
      type: 'duke',
      card: 'Duke',
      description: 'Take $3M from treasury',
      canBeBlocked: false,
      cardImage: dukeImage,
    },
    {
      name: 'Captain (Steal)',
      type: 'steal',
      card: 'Captain',
      description: 'Take up to $2M from another player',
      canBeBlocked: true,
      blockedBy: ['Captain', 'Ambassador', 'Inquisitor'],
      cardImage: captainImage,
    },
    {
      name: 'Assassin',
      type: 'assassinate',
      card: 'Assassin',
      cost: 3,
      description: 'Pay $3M to force card loss',
      canBeBlocked: true,
      blockedBy: ['Contessa'],
      cardImage: assassinImage,
    },
    {
      name: 'Ambassador (Exchange)',
      type: 'exchange',
      card: 'Ambassador',
      description: 'Exchange cards with Court deck',
      canBeBlocked: false,
      cardImage: ambassadorImage,
    },
    {
      name: 'Inquisitor',
      type: 'inquisitor',
      card: 'Inquisitor',
      description: 'Investigate: Look at card & decide swap OR Swap: Exchange one card with Court',
      canBeBlocked: false,
      cardImage: inquisitorImage,
    },
    {
      name: 'Contessa',
      type: 'contessa',
      card: 'Contessa',
      description: 'Blocks assassination attempts against you',
      isDefensive: true,
      cardImage: contessaImage,
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-4">
    

      
      {/* Basic actions grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5 mb-4">
        {basicActions.map((action, index) => (
          <div key={index} className="flex items-center gap-1.5 p-1.5 rounded-md bg-[#2a2a2a]">
            {/* Icon */}
            <div className="flex-shrink-0 w-9 h-9 bg-[#2a2a2a] rounded overflow-hidden flex items-center justify-center">
              {action.icon && <action.icon className="w-6 h-6 text-amber-400" />}
            </div>
            
            {/* Action details */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-200 text-xs">
                {action.name}
                {action.cost && <span className="ml-1 text-amber-400">(${action.cost}M)</span>}
              </h3>
              <p className="text-slate-300 text-[10px]">{action.description}</p>
              
              {/* Challenge and block info */}
              <div className="flex flex-col mt-0.5">
                {action.blockedBy && action.blockedBy.length > 0 && (
                  <div className="flex gap-1 items-baseline">
                    <span className="text-[9px] text-red-400 font-medium whitespace-nowrap">Can be blocked by:</span>
                    <span className="text-[9px] text-red-400/90">{action.blockedBy.join(', ')}</span>
                  </div>
                )}
                {(action.canBeChallenged !== false) && (
                  <span className="text-[9px] text-yellow-500 font-medium">Can be challenged</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>


      {/* <div className="h-px bg-slate-800/80 mb-2"></div>
       */}
      {/* Character actions grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
        {characterActions.map((action, index) => (
          <div key={index} className="flex items-center gap-1.5 p-1.5 rounded-md bg-[#3a3a3a]/50">
            {/* Card image */}
            <div 
              className="flex-shrink-0 w-9 h-13 rounded overflow-hidden shadow-md"
              style={{ transform: `rotate(${5}deg)` }}
            >
              {action.cardImage && (
                <img 
                  src={action.cardImage}
                  alt={action.card || action.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            
            {/* Action details */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-200 text-xs flex items-center">
                {action.name}
                {action.cost && <span className="ml-1 text-amber-400">(${action.cost}M)</span>}
                {action.isDefensive && (
                  <span className="ml-1 text-[9px] text-purple-400 font-medium">
                    Defensive
                  </span>
                )}
              </h3>
              <p className="text-slate-300 text-[10px]">{action.description}</p>
              
              {/* Challenge and block info */}
              <div className="flex flex-col mt-0.5">
                {action.blockedBy && action.blockedBy.length > 0 && (
                  <div className="flex gap-1 items-baseline">
                    <span className="text-[9px] text-red-400 font-medium whitespace-nowrap">Can be blocked by:</span>
                    <span className="text-[9px] text-red-400/90">{action.blockedBy.join(', ')}</span>
                  </div>
                )}
                {!action.isDefensive && (action.canBeChallenged !== false) && (
                  <span className="text-[9px] text-yellow-500 font-medium">Can be challenged</span>
                )}
                {action.isDefensive && (
                  <span className="text-[9px] text-yellow-500 font-medium">Block can be challenged</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}