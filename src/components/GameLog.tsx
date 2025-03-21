import React from 'react';
import { GameLogEntry, LogType, GameState } from '../types';
import { DollarSign, Swords, ShieldAlert, Check, RefreshCcw, Skull, Clock, Crown, User } from 'lucide-react';

interface GameLogProps {
  logs: GameLogEntry[];
  currentPlayer: string;
  currentPlayerColor: string;
  gameState?: GameState;
  selectedAction?: string;
  game: {
    currentTurn: number;
    players: Array<{
      name: string;
      color: string;
    }>;
  };
}

const LogIcon = ({ type }: { type: LogType }) => {
  const className = "w-3 h-3";
  
  switch (type) {
    case 'income':
    case 'foreign-aid':
    case 'tax':
    case 'steal':
      return <DollarSign className={className} />;
    case 'assassinate':
    case 'coup':
      return <Skull className={className} />;
    case 'exchange':
    case 'exchange-complete':
      return <RefreshCcw className={className} />;
    case 'block':
      return <ShieldAlert className={className} />;
    case 'challenge':
    case 'challenge-success':
    case 'challenge-fail':
      return <Swords className={className} />;
    case 'allow':
      return <Check className={className} />;
    default:
      return null;
  }
};

const CardIcon = ({ card }: { card: string }) => {
  const className = "w-2.5 h-2.5 inline-block mx-0.5";
  
  switch (card) {
    case 'Duke':
      return <Crown className={className} />;
    case 'Assassin':
      return <Skull className={className} />;
    case 'Captain':
      return <User className={className} />;
    case 'Ambassador':
      return <RefreshCcw className={className} />;
    case 'Contessa':
      return <ShieldAlert className={className} />;
    default:
      return null;
  }
};

const formatMessage = (message: string, isSystem: boolean = false) => {
  if (isSystem) return message;

  const parts = message.split(/(Duke|Assassin|Captain|Ambassador|Contessa)/g);
  return parts.map((part, index) => {
    if (['Duke', 'Assassin', 'Captain', 'Ambassador', 'Contessa'].includes(part)) {
      return (
        <span key={index} className="inline-flex items-center font-medium">
          <CardIcon card={part} />
          {part}
        </span>
      );
    }
    return part;
  });
};

const getLogMessage = (log: GameLogEntry): string | React.ReactNode => {
  if (log.type === 'system' && log.message) {
    return formatMessage(log.message, true);
  }

  if (log.message) {
    return formatMessage(log.message);
  }

  switch (log.type) {
    case 'income':
      return 'takes income';
    case 'foreign-aid':
      return log.coins ? 'takes Foreign Aid' : 'requests Foreign Aid';
    case 'tax':
      return log.coins ? 'collects tax' : 'claims Duke for tax';
    case 'steal':
      return `steals ${log.coins}M from`;
    case 'assassinate':
      return 'assassinates';
    case 'coup':
      return 'launches coup against';
    case 'exchange':
      return 'exchanges cards with the court';
    case 'exchange-complete':
      return 'completes exchange';
    case 'block':
      return formatMessage(`blocks with ${log.card}`);
    case 'challenge':
      return 'challenges';
    case 'challenge-success':
      return 'successfully challenges';
    case 'challenge-fail':
      return 'fails to challenge';
    case 'lose-influence':
      return 'loses influence';
    case 'allow':
      return 'allows action';
    default:
      return '';
  }
};

const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const getStateMessage = (state: GameState, selectedAction?: string): string => {
  switch (state) {
    case 'waiting_for_action':
      return 'Choose your action';
    case 'waiting_for_target':
      return `Select target for ${selectedAction}`;
    case 'waiting_for_response':
      return 'Waiting for responses';
    case 'waiting_for_exchange':
      return 'Choose cards to exchange';
    case 'waiting_for_influence_loss':
      return 'Select a card to lose';
    case 'waiting_for_others':
      return 'Waiting for other players';
    case 'waiting_for_turn':
      return 'Other player\'s turn';
    default:
      return '';
  }
};

export function GameLog({ logs, currentPlayer, currentPlayerColor, gameState, selectedAction, game }: GameLogProps) {
  const currentTurnPlayer = game.players[game.currentTurn];
  const lastThreeLogs = [...logs].reverse().slice(0, 3);

  const truncateName = (name: string) => {
    return name.length > 14 ? `${name.slice(0, 13)}...` : name;
  };

  return (
    <div className="backdrop-blur-sm rounded-lg shadow-lg w-full overflow-hidden">
      {/* Turn indicator */}
      <div className="bg-[#333333] border-b border-white/5 p-1.5">
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span 
              className="text-xs font-medium"
              style={{ color: currentTurnPlayer.color }}
            >
              {truncateName(currentTurnPlayer.name)}'s Turn
            </span>
          </div>
          {gameState && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-slate-400" />
              <span className="text-[10px] text-slate-400">{getStateMessage(gameState, selectedAction)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Game log */}
      <div className="p-1.5 bg-[#2a2a2a]/80">
        <div className="space-y-1">
          {lastThreeLogs.map((log, index) => (
            <div 
              key={index} 
              className="flex flex-wrap items-center justify-between px-2 py-1 rounded bg-[#3a3a3a]/50 animate-in fade-in slide-in-from-bottom-2"
              style={{
                animationDelay: `${index * 50}ms`,
                animationFill: 'forwards'
              }}
            >
              <div className="flex flex-wrap items-center gap-1 text-[11px] min-w-0 flex-1">
                {log.type !== 'system' && (
                  <span 
                    className="font-medium whitespace-nowrap" 
                    style={{ color: log.playerColor }}
                  >
                    {truncateName(log.player)}
                  </span>
                )}
                <span className={`text-gray-300 break-words ${log.type === 'system' ? 'text-gray-400 italic' : ''}`}>
                  {getLogMessage(log)}
                </span>
                {log.target && log.type !== 'system' && (
                  <span 
                    className="font-medium whitespace-nowrap" 
                    style={{ color: log.targetColor }}
                  >
                    {truncateName(log.target)}
                  </span>
                )}
              </div>
              <span className="text-[9px] text-gray-500 ml-2 whitespace-nowrap shrink-0">
                {formatTimestamp(log.timestamp)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}