import React from 'react';
import { GameLogEntry, GameState } from '../types';
import { Clock } from 'lucide-react';
import { GameMessages } from '../messages';

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

const formatMessage = (message: string, isSystem: boolean = false) => {
  if (isSystem) return message;

  const parts = message.split(/(Banker|Hacker|Mafia|Reporter|Judge|Police|Income|Foreign Aid|Tax|Steal|Exchange|Hack|Investigation|Scandal)/g);
  return parts.map((part, index) => {
    if (['Banker', 'Hacker', 'Mafia', 'Reporter', 'Judge', 'Police', 
         'Income', 'Foreign Aid', 'Tax', 'Steal', 'Exchange', 'Hack', 
         'Investigation', 'Scandal'].includes(part)) {
      return (
        <span key={index} className="font-bold">
          {part}
        </span>
      );
    }
    return part;
  });
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
    case 'waiting_for_card_selection':
      return 'Select a card to show';
    case 'waiting_for_investigate_decision':
      return 'Decide on investigation';
    default:
      return '';
  }
};

export function GameLog({ logs, gameState, selectedAction, game }: GameLogProps) {
  const currentTurnPlayer = game.players[game.currentTurn];
  const lastThreeLogs = [...logs].reverse().slice(0, 3);

  const truncateName = (name: string) => {
    return name.length > 14 ? `${name.slice(0, 13)}...` : name;
  };

  // Function to get the CSS class for different message types for visual styling
  const getMessageTypeClass = (logType: string, isSystemMessage: boolean): string => {
    if (isSystemMessage) return 'text-gray-400 italic';
    
    // Visual styling based on message type
    switch (logType) {
      case 'system':
        return 'text-gray-400 italic';
      case 'challenge':
      case 'challenge-success':
      case 'challenge-fail':
        return 'text-amber-300';
      case 'block':
        return 'text-red-300';
      default:
        return 'text-gray-300';
    }
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
              }}
            >
              <div className="flex flex-wrap items-center gap-1 text-[11px] min-w-0 flex-1">
                {log.type !== 'system' && (
                  <span 
                    className="font-semibold whitespace-nowrap" 
                    style={{ color: log.playerColor }}
                  >
                    {truncateName(log.player)}
                  </span>
                )}
                {/* Special cases for messages that need target name in the middle */}
                {log.type === 'investigate-result' ? (
                  <>
                    <span className={getMessageTypeClass(log.type, false)}>
                      {log.message === GameMessages.results.investigateKeep ? 'lets ' : 'forces '}
                    </span>
                    <span 
                      className="font-semibold whitespace-nowrap" 
                      style={{ color: log.targetColor ?? '#FFFFFF' }}
                    >
                      {truncateName(log.target || '')}
                    </span>
                    <span className={getMessageTypeClass(log.type, false)}>
                      {log.message === GameMessages.results.investigateKeep ? ' keep their card' : ' swap their card'}
                    </span>
                  </>
                ) : log.type === 'allow' && log.message === GameMessages.responses.allowBlock ? (
                  <>
                    <span className={getMessageTypeClass(log.type, false)}>
                      allows 
                    </span>
                    <span 
                      className="font-semibold whitespace-nowrap mx-1" 
                      style={{ color: log.targetColor ?? '#FFFFFF' }}
                    >
                      {truncateName(log.target || '')}
                    </span>
                    <span className={getMessageTypeClass(log.type, false)}>
                      to block
                    </span>
                  </>
                ) : log.type === 'steal' ? (
                  <>
                    {log.coins !== undefined ? (
                      <span className={getMessageTypeClass(log.type, false)}>
                        steals ${log.coins}M from 
                      </span>
                    ) : (
                      <span className={getMessageTypeClass(log.type, false)}>
                        claims <span className="font-bold">Mafia</span> to steal from 
                      </span>
                    )}
                    <span 
                      className="font-semibold whitespace-nowrap" 
                      style={{ color: log.targetColor ?? '#FFFFFF' }}
                    >
                      {truncateName(log.target || '')}
                    </span>
                  </>
                ) : log.type === 'hack' ? (
                  <>
                    {/* Use string splitting to insert the colored target name */}
                    {log.message && log.message.includes('on ') ? (
                      <>
                        <span className={getMessageTypeClass(log.type, false)}>
                          {/* Display up to the "on " part */}
                          {formatMessage(log.message.split('on ')[0] + 'on ', log.type === 'system')}
                        </span>
                        <span 
                          className="font-semibold whitespace-nowrap" 
                          style={{ color: log.targetColor ?? '#FFFFFF' }}
                        >
                          {truncateName(log.target || '')}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className={getMessageTypeClass(log.type, false)}>
                          {formatMessage(log.message || '', log.type === 'system')} 
                        </span>
                        {log.target && (
                          <span 
                            className="font-semibold whitespace-nowrap" 
                            style={{ color: log.targetColor ?? '#FFFFFF' }}
                          >
                            {truncateName(log.target)}
                          </span>
                        )}
                      </>
                    )}
                  </>
                ) : log.type === 'scandal' ? (
                  <>
                    {/* Special format for scandal message with target name in the middle */}
                    {log.message && log.message.includes('@@TARGET@@') ? (
                      <>
                        <span className={getMessageTypeClass(log.type, false)}>
                          {log.message.split('@@TARGET@@')[0]}
                        </span>
                        <span 
                          className="font-semibold whitespace-nowrap" 
                          style={{ color: log.targetColor ?? '#FFFFFF' }}
                        >
                          {truncateName(log.target || '')}
                        </span>
                        <span className={getMessageTypeClass(log.type, false)}>
                          {log.message.split('@@TARGET@@')[1].split('##').map((part, i) => {
                            // Even indices are regular text, odd indices are bold
                            return i % 2 === 0 ? (
                              <React.Fragment key={i}>{part}</React.Fragment>
                            ) : (
                              <span key={i} className="font-bold">{part}</span>
                            );
                          })}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className={getMessageTypeClass(log.type, false)}>
                          {formatMessage(log.message || '', log.type === 'system')}
                        </span>
                        {log.target && (
                          <span 
                            className="font-semibold whitespace-nowrap ml-1" 
                            style={{ color: log.targetColor ?? '#FFFFFF' }}
                          >
                            {truncateName(log.target)}
                          </span>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <span className={`break-words ${getMessageTypeClass(log.type, log.type === 'system')}`}>
                      {formatMessage(log.message || '', log.type === 'system')}
                    </span>
                    {/* Show target name for all action types that have targets except special cases */}
                    {log.target && log.type !== 'system' && ['investigate', 'show-card'].includes(log.type) && (
                      <span 
                        className="font-semibold whitespace-nowrap" 
                        style={{ color: log.targetColor ?? '#FFFFFF' }}
                      >
                        {truncateName(log.target)}
                      </span>
                    )}
                  </>
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