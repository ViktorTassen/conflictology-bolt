import React from 'react';
import { DollarSign, Skull } from 'lucide-react';
import { Player } from '../types';
import backImage from '../assets/images/back.png';

interface PlayerCardProps {
  player: Player;
  isActive: boolean;
  isTargetable?: boolean;
  isTargeted?: boolean;
  onTargetSelect?: () => void;
}

export function PlayerCard({ 
  player, 
  isActive, 
  isTargetable = false,
  isTargeted = false,
  onTargetSelect 
}: PlayerCardProps) {
  const truncateName = (name: string) => {
    return name.length > 13 ? `${name.slice(0, 12)}...` : name;
  };

  // Only show unrevealed cards
  const activeCards = player.influence.filter(i => !i.revealed);

  return (
    <div 
      className={`
        relative
        ${isTargetable && !player.eliminated ? 'cursor-pointer hover:scale-105 group' : ''}
        ${player.eliminated ? 'opacity-50' : ''}
        transition-transform duration-200
      `}
      onClick={isTargetable && !player.eliminated ? onTargetSelect : undefined}
      role={isTargetable && !player.eliminated ? "button" : undefined}
      aria-label={isTargetable && !player.eliminated ? `Target ${player.name}` : undefined}
    >
      {/* Targetable indicator for improved visibility */}
      {isTargetable && !player.eliminated && (
        <div className="absolute inset-0 -m-3 z-0 pointer-events-none">
          <div className="absolute inset-0 rounded-xl bg-red-500/10 animate-pulse-slow"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-white/80 font-bold bg-red-500/80 px-2 py-0.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            TARGET
          </div>
        </div>
      )}
      
      {/* Target selection glow effect when targeted */}
      {isTargeted && !player.eliminated && (
        <div className="absolute inset-0 -m-3 z-0 pointer-events-none">
          <div className="absolute inset-0 rounded-xl bg-red-500/30 animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-white font-bold bg-red-600/90 px-2 py-0.5 rounded-full shadow-lg">
            TARGETED
          </div>
        </div>
      )}

      {/* Player info card */}
      <div className={`
        relative z-20 
        bg-[#2a2a2a]/90 backdrop-blur-sm rounded-lg
        ${isActive ? 'ring-1 ring-yellow-500/50' : ''}
        ${isTargeted && !player.eliminated ? 'ring-2 ring-red-500' : ''}
        ${isTargetable && !player.eliminated ? 'hover:ring-2 hover:ring-red-500 shadow-lg' : ''}
        ${player.eliminated ? 'ring-1 ring-red-900/50' : ''}
        transition-all duration-200
      `}>
        <div className="flex items-center p-1.5 gap-1.5 max-w-[160px]">
          {/* Avatar with active indicator */}
          <div className="relative shrink-0">
            <div className={`
              w-6 h-6 rounded-full overflow-hidden
              ${isActive ? 'ring-2 ring-yellow-500/50 shadow-[0_0_15px_rgba(255,255,255,0.2)]' : ''}
              ${isTargeted && !player.eliminated ? 'ring-2 ring-red-500/50' : ''}
              ${player.eliminated ? 'grayscale' : ''}
            `}>
              <img
                src={player.avatar}
                alt={player.name}
                className="w-full h-full object-cover"
              />
            </div>
            {player.eliminated && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                <Skull className="w-2 h-2 text-white" />
              </div>
            )}
          </div>

          {/* Name and coins container */}
          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
            {/* Player name */}
            <div className="w-full">
              <span 
                className={`
                  text-xs font-medium leading-none block truncate
                  ${player.eliminated ? 'text-gray-500' : ''}
                `}
                style={{ color: player.eliminated ? undefined : player.color }}
                title={player.name}
              >
                {truncateName(player.name)}
              </span>
            </div>

            {/* Coins */}
            <div className="flex items-center gap-1 bg-black/20 rounded-full px-1.5 py-0.5 w-fit">
              <DollarSign className={`w-3 h-3 ${player.eliminated ? 'text-gray-500' : 'text-yellow-500'}`} />
              <span className={`text-[10px] font-bold ${player.eliminated ? 'text-gray-500' : 'text-yellow-500'}`}>
                {player.coins}M
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Influence cards */}
      <div className="flex gap-0.5 -mt-2 justify-center">
        {activeCards.map((card, index) => (
          <div
            key={index}
            className={`
              w-7 h-10 rounded 
              overflow-hidden
              ${isTargeted && !player.eliminated ? 'ring-1 ring-red-500/30' : ''}
              ${player.eliminated ? 'opacity-50' : ''}
              transition-colors duration-200
              shadow-sm
            `}
            style={{
              transform: `translateY(${index * 2}px) rotate(${index * 5}deg)`,
            }}
          >
            <img 
              src={backImage}
              alt="Card back"
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}