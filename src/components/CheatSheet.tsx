import { CardType } from '../types';
import { DollarSign, Skull, Euro, Shield, Swords } from 'lucide-react';

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

function ActionCard({ action }: { action: ActionInfo }) {
  return (
    <div className="relative flex gap-3 p-3 rounded-xl bg-[#2a2a2a] shadow-sm">
      {/* Icon or Image */}
      <div className="flex-shrink-0 w-10 h-14 rounded-md overflow-hidden shadow-md">
        {action.icon && <action.icon className="w-6 h-6 text-amber-400 mt-4 ml-2" />}
        {action.cardImage && (
          <img src={action.cardImage} alt={action.card || action.name} className="w-full h-full object-cover" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 relative">
        <div className="pr-12">
          <h3 className="text-xs font-bold text-slate-200">
            {action.name}
            {action.cost && <span className="ml-1 text-amber-400">(${action.cost}M)</span>}
            {action.isDefensive && <span className="ml-1 text-purple-400 text-[10px] font-medium">Defensive</span>}
          </h3>
          <p className="text-[11px] text-slate-300 mt-0.5">{action.description}</p>
        </div>

        {/* Chips */}
        <div className="absolute top-0 right-0 flex gap-1">
          {!action.isDefensive && action.canBeChallenged !== false && (
            <div className="flex items-center gap-1 bg-yellow-500/10 border border-yellow-500 text-yellow-400 text-[10px] px-2 py-0.5 rounded-full">
              <Swords className="w-3 h-3" /> Challenge
            </div>
          )}
          {action.isDefensive && (
            <div className="flex items-center gap-1 bg-yellow-500/10 border border-yellow-500 text-yellow-400 text-[10px] px-2 py-0.5 rounded-full">
              <Swords className="w-3 h-3" /> Block Challenge
            </div>
          )}
          {action.blockedBy && (
            <div className="flex items-center gap-1 bg-red-500/10 border border-red-500 text-red-400 text-[10px] px-2 py-0.5 rounded-full">
              <Shield className="w-3 h-3" /> Blocked: {action.blockedBy.join(', ')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CheatSheet() {
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
    },
  ];

  return (

    <div className="mx-auto overflow-y-auto p-3 bg-[#1e1e1e] rounded-xl shadow-inner">
      <div className="flex flex-col gap-3">
        {[...basicActions, ...characterActions].map((action, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 rounded-lg bg-[#2a2a2a] shadow-sm border border-white/5"
          >
            {/* Left: Icon or Card Image */}
            <div className="w-10 h-10 flex-shrink-0 rounded-md bg-black/20 flex items-center justify-center overflow-hidden">
              {action.icon && <action.icon className="w-5 h-5 text-amber-400" />}
              {action.cardImage && (
                <img
                  src={action.cardImage}
                  alt={action.card || action.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Right: Content */}
            <div className="flex-1">
              <h3 className="text-[13px] font-semibold text-slate-200 leading-snug">
                {action.name}
                {action.cost && (
                  <span className="ml-1 text-amber-400 text-[11px]">(${action.cost}M)</span>
                )}
                {action.isDefensive && (
                  <span className="ml-1 text-purple-400 text-[10px] font-medium">Defensive</span>
                )}
              </h3>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-tight">
                {action.description}
              </p>

              <div className="flex flex-wrap gap-1 mt-1">
                {(!action.isDefensive && action.canBeChallenged !== false) || action.isDefensive ? (
                  <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded-full border border-yellow-400">
                    <Swords className="w-3 h-3" /> Challenge
                  </span>
                ) : null}

                {action.blockedBy && (
                  <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 bg-red-500/10 text-red-400 rounded-full border border-red-400">
                    <Shield className="w-3 h-3" /> {action.blockedBy.join(', ')}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}



