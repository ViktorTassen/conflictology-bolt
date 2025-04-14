import { CardType } from '../types';
import { DollarSign, Skull, Euro, Shield, Swords, ExternalLink } from 'lucide-react';

import bankerImage from '../images/banker.png';
import hackerImage from '../images/hacker.png';
import mafiaImage from '../images/mafia.png';
import reporterImage from '../images/reporter.png';
import judgeImage from '../images/judge.png';
import policeImage from '../images/police.png';

interface ActionInfo {
  name: string;
  type: string;
  card?: CardType;
  cost?: number;
  description1: string;
  description2: string;
  canBeBlocked?: boolean;
  canBeChallenged?: boolean;
  blockedBy?: CardType[];
  icon?: React.ComponentType<{ className?: string }>;
  cardImage?: string;
  isDefensive?: boolean;
}


export function CheatSheet() {
  const basicActions: ActionInfo[] = [
    {
      name: 'Income',
      type: 'income',
      description1: 'Take $1M from the Treasury',
      description2: '',
      canBeBlocked: false,
      canBeChallenged: false,
      icon: DollarSign,
    },
    {
      name: 'Foreign Aid',
      type: 'foreign-aid',
      description1: 'Take $2M from the Treasury',
      description2: '',
      canBeBlocked: true,
      canBeChallenged: false,
      blockedBy: ['Banker'],
      icon: Euro,
    },
    {
      name: 'Scandal',
      type: 'scandal',
      cost: 7,
      description1: 'Pay $7M. Choose a player to lose 1 card. Mandatory if your balance is $10M+',
      description2: '',
      canBeBlocked: false,
      canBeChallenged: false,
      icon: Skull,
    },
  ];

  const characterActions: ActionInfo[] = [
    {
      name: 'Banker',
      type: 'banker',
      card: 'Banker',
      description1: 'Take $3M from the Treasury',
      description2: '',
      canBeBlocked: false,
      cardImage: bankerImage,
    },
    {
      name: 'Mafia',
      type: 'steal',
      card: 'Mafia',
      description1: 'Steal up to $2M from target player',
      description2: '',
      canBeBlocked: true,
      blockedBy: ['Mafia', 'Reporter', 'Police'],
      cardImage: mafiaImage,
    },
    {
      name: 'Hacker',
      type: 'hack',
      card: 'Hacker',
      cost: 3,
      description1: 'Pay $3M to force a target player to lose 1 card. If blocked, hack fails, but the Hacker’s fee is not refunded.',
      description2: '',
      canBeBlocked: true,
      blockedBy: ['Judge'],
      cardImage: hackerImage,
    },
    {
      name: 'Reporter',
      type: 'exchange',
      card: 'Reporter',
      description1: 'Draw 2 cards from the deck. You may exchange one or both with your face-down cards. Then return 2 cards to the deck.',
      description2: '',
      canBeBlocked: false,
      cardImage: reporterImage,
    },
    {
      name: 'Police',
      type: 'police',
      card: 'Police',
      description1: "Investigate: Look at one of a target player's face-down cards. You may either ① Let them keep it or ② Force them to discard it and draw a new card from the deck",
      description2: 'Swap: Draw 1 card from the deck. You may swap it with one of your face-down cards. Then return 1 card to the deck.',
      canBeBlocked: false,
      cardImage: policeImage,
    },
    {
      name: 'Judge',
      type: 'judge',
      card: 'Judge',
      description1: 'Targeted player may claim the Judge to block Hacker. ',
      description2: '',
      isDefensive: true,
      canBeChallenged: true,
      cardImage: judgeImage,
    },
  ];

  return (

    <div className="mx-auto p-1">
      <div className="flex flex-col gap-1">


        {[...basicActions, ...characterActions].map((action, index) => (
          <div
            key={index}
            className="flex items-start gap-2 px-2 py-2.5 rounded-md bg-[#2a2a2a]/40"
          >
            {/* Left: Icon or Card Image */}

            {action.cardImage && (
              <div className="w-7 h-10 flex-shrink-0 flex items-center justify-center overflow-hidden">

                <img
                  src={action.cardImage}
                  alt={action.card || action.name}
                  className="w-full h-full object-cover rounded-sm"
                />

              </div>
            )}

            {action.icon && (
              <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center overflow-hidden">
                <action.icon className="w-5 h-5 text-slate-400" />
              </div>
            )}




            {/* Right: Content */}
            <div className="flex-1 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-200 leading-snug">
                  {action.name}
                </h3>

                {/* Chips */}
                <div className="flex flex-wrap gap-2">
                  {action.blockedBy && (
                    <span className="flex items-center gap-1 text-[9px] px-2 py-0.5 bg-red-500/10 text-red-400 rounded-full border border-red-400">
                      <Shield className="w-2.5 h-2.5" /> {action.blockedBy.join(', ')}
                    </span>
                  )}

                  {action.isDefensive && (
                    <span className="flex items-center gap-1 text-[9px] px-2 py-0.5 bg-purple-400/10 text-purple-400 rounded-full border border-purple-400">
                      Defensive
                    </span>

                  )}

                  {(action.canBeChallenged !== false) ? (
                    <span className="flex items-center gap-1 text-[9px] px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded-full border border-yellow-400">
                      <Swords className="w-2.5 h-2.5" />
                    </span>
                  ) : null}
                </div>

              </div>


              <div>
                <p className="text-[10px] text-slate-300 leading-tight">
                  {action.description1}
                </p>

                {action.description2 && (
                  <>
                    {/* Divider with OR */}
                    <div className="flex items-center my-0.5 w-12">
                      <div className="flex-grow border-t border-slate-400"></div>
                      <span className="px-1 text-[8px] text-slate-400">OR</span>
                      <div className="flex-grow border-t border-slate-400"></div>
                    </div>

                    <p className="text-[10px] text-slate-300 leading-tight">
                      {action.description2}
                    </p>
                  </>
                )}
              </div>


            </div>
          </div>
        ))}


        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400 mt-1">
          <span className="flex items-center gap-1 text-[9px] px-2 py-0.5 bg-red-500/10 text-red-400 rounded-full border border-red-400">
            <Shield className="w-2.5 h-2.5" /> Can be Blocked by
          </span>
          <span className="flex items-center gap-1 text-[9px] px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded-full border border-yellow-400">
            <Swords className="w-2.5 h-2.5" /> Can be Challenged
          </span>

        </div>
        <div className="flex flex-wrap items-center justify-center mt-1">
          <a
            href="https://conflictologygames.com/capitol/rules"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-500 hover:underline text-[10px]"
          >
            Full Rules <ExternalLink className="w-3 h-3" />
          </a>
        </div>


      </div>
    </div>
  );
}



