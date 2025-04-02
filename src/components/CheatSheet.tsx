import { CardType } from '../types';
import { DollarSign, Skull, Euro } from 'lucide-react';

// Import card images directly
import bankerImage from '../assets/images/banker.png';
import hackerImage from '../assets/images/hacker.png';
import mafiaImage from '../assets/images/mafia.png';
import reporterImage from '../assets/images/reporter.png';
import judgeImage from '../assets/images/judge.png';
import policeImage from '../assets/images/police.png';

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
      blockedBy: ['Banker'],
      icon: Euro,
    },
    {
      name: 'Scandal',
      type: 'scandal',
      cost: 7,
      description: 'Pay $7M to force 1 card loss. Required with $10M+.',
      canBeBlocked: false,
      icon: Skull,
    },
  ];

  // Character actions
  const characterActions: ActionInfo[] = [
    {
      name: 'Banker (Tax)',
      type: 'banker',
      card: 'Banker',
      description: 'Take $3M from treasury',
      canBeBlocked: false,
      cardImage: bankerImage,
    },
    {
      name: 'Mafia (Steal)',
      type: 'steal',
      card: 'Mafia',
      description: 'Take up to $2M from another player',
      canBeBlocked: true,
      blockedBy: ['Mafia', 'Reporter', 'Police'],
      cardImage: mafiaImage,
    },
    {
      name: 'Hacker',
      type: 'hack',
      card: 'Hacker',
      cost: 3,
      description: 'Pay $3M to force card loss',
      canBeBlocked: true,
      blockedBy: ['Judge'],
      cardImage: hackerImage,
    },
    {
      name: 'Reporter (Exchange)',
      type: 'exchange',
      card: 'Reporter',
      description: 'Exchange cards with Court deck',
      canBeBlocked: false,
      cardImage: reporterImage,
    },
    {
      name: 'Police',
      type: 'police',
      card: 'Police',
      description: 'Investigate: Look at card & decide swap OR Swap: Exchange one card with Court',
      canBeBlocked: false,
      cardImage: policeImage,
    },
    {
      name: 'Judge',
      type: 'judge',
      card: 'Judge',
      description: 'Blocks hack attempts against you',
      isDefensive: true,
      cardImage: judgeImage,
    }
  ];

  return (
        <div className="max-w-5xl mx-auto py-6 px-4">
          {/* Basic Actions */}
          <h2 className="text-slate-100 font-semibold text-sm mb-2">Basic Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {basicActions.map((action, index) => (
              <div
                key={index}
                className="flex items-start gap-2 p-3 rounded-xl bg-[#2a2a2a] shadow-sm"
              >
                {/* Icon */}
                <div className="flex-shrink-0 w-10 h-10 rounded-md bg-black/20 flex items-center justify-center">
                  {action.icon && <action.icon className="w-5 h-5 text-amber-400" />}
                </div>
    
                {/* Details */}
                <div className="flex-1">
                  <h3 className="text-xs font-bold text-slate-200">
                    {action.name}
                    {action.cost && <span className="ml-1 text-amber-400">(${action.cost}M)</span>}
                  </h3>
                  <p className="text-[11px] text-slate-300">{action.description}</p>
                  <div className="flex flex-col mt-1 space-y-0.5">
                    {action.blockedBy && (
                      <span className="text-[10px] text-red-400">
                        Blocked by: {action.blockedBy.join(', ')}
                      </span>
                    )}
                    {action.canBeChallenged !== false && (
                      <span className="text-[10px] text-yellow-400">Can be challenged</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
    
          {/* Character Actions */}
          <h2 className="text-slate-100 font-semibold text-sm mb-2">Character Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {characterActions.map((action, index) => (
              <div
                key={index}
                className="flex items-start gap-2 p-3 rounded-xl bg-[#3a3a3a]/60 shadow-sm"
              >
                {/* Image */}
                <div className="flex-shrink-0 w-10 h-14 rounded-md overflow-hidden shadow-md rotate-[3deg]">
                  {action.cardImage && (
                    <img
                      src={action.cardImage}
                      alt={action.card || action.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
    
                {/* Details */}
                <div className="flex-1">
                  <h3 className="text-xs font-bold text-slate-200">
                    {action.name}
                    {action.cost && <span className="ml-1 text-amber-400">(${action.cost}M)</span>}
                    {action.isDefensive && (
                      <span className="ml-1 text-purple-400 text-[10px] font-medium">
                        Defensive
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-300">{action.description}</p>
                  <div className="flex flex-col mt-1 space-y-0.5">
                    {action.blockedBy && (
                      <span className="text-[10px] text-red-400">
                        Blocked by: {action.blockedBy.join(', ')}
                      </span>
                    )}
                    {!action.isDefensive && action.canBeChallenged !== false && (
                      <span className="text-[10px] text-yellow-400">Can be challenged</span>
                    )}
                    {action.isDefensive && (
                      <span className="text-[10px] text-yellow-400">Block can be challenged</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
  );
}