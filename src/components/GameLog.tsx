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

// Type guard function to check if a log entry is a system message
const isSystemMessage = (logType: string): boolean => {
  return logType === 'system';
};

// Format message with highlighting for special terms
const formatMessage = (message: string, isSystem: boolean = false) => {
  if (isSystem) return message;

  const keywords = [
    'Banker', 'Hacker', 'Mafia', 'Reporter', 'Judge', 'Police',
    'Income', 'Foreign Aid', 'Tax', 'Steal', 'Exchange', 'Hack',
    'Investigation', 'Scandal'
  ];
  
  const parts = message.split(new RegExp(`(${keywords.join('|')})`, 'g'));
  return parts.map((part, index) => {
    if (keywords.includes(part)) {
      return (
        <span key={index} className="font-bold">
          {part}
        </span>
      );
    }
    return part;
  });
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
  const lastFourLogs = [...logs].reverse().slice(0, 4);

  const truncateName = (name: string) => {
    return name.length > 14 ? `${name.slice(0, 13)}…` : name;
  };

  // Function to get the CSS class for different message types for visual styling
  const getMessageTypeClass = (logType: string, isSystemMsg: boolean = false): string => {
    if (isSystemMsg || isSystemMessage(logType)) return 'text-gray-400 italic';
    
    // Visual styling based on message type
    switch (logType) {
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
            <span 
              className="text-xs font-medium animate-pulse"
              style={{ color: currentTurnPlayer.color }}
            >
              {currentTurnPlayer.name}'s Turn
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
          {lastFourLogs.map((log, index) => (
            <div 
              key={index} 
              className="flex flex-wrap items-center px-2 py-1 rounded bg-[#3a3a3a]/50 animate-in fade-in slide-in-from-bottom-2"
              style={{
                animationDelay: `${index * 50}ms`,
                opacity: index === 0 ? 1 : index === 1 ? 1 : index === 2 ? 0.5 : 0.25,
              }}
            >
              <div className="flex flex-wrap items-center gap-1 text-[11px] w-full">
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
                  <div className="flex flex-wrap items-center gap-1">
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
                  </div>
                ) : log.type === 'allow' && log.message === GameMessages.responses.allowBlock ? (
                  <div className="flex flex-wrap items-center gap-1">
                    <span className={getMessageTypeClass(log.type, false)}>
                      allows 
                    </span>
                    <span 
                      className="font-semibold whitespace-nowrap" 
                      style={{ color: log.targetColor ?? '#FFFFFF' }}
                    >
                      {truncateName(log.target || '')}
                    </span>
                    <span className={getMessageTypeClass(log.type, false)}>
                      to block
                    </span>
                  </div>
                ) : log.type === 'steal' ? (
                  <div className="flex flex-wrap items-center gap-1">
                    <span className={getMessageTypeClass(log.type, false)}>
                      {formatMessage(log.coins !== undefined 
                        ? GameMessages.results.steal(log.coins) 
                        : GameMessages.actions.steal, false)}
                    </span>
                    {log.target && (
                      <span 
                        className="font-semibold whitespace-nowrap" 
                        style={{ color: log.targetColor ?? '#FFFFFF' }}
                      >
                        {truncateName(log.target)}
                      </span>
                    )}
                  </div>
                ) : log.type === 'hack' ? (
                  <div className="flex flex-wrap items-center gap-1">
                    <span className={getMessageTypeClass(log.type, false)}>
                      {formatMessage(log.message && log.target ? GameMessages.actions.hack : log.message || '', false)}
                    </span>
                    {log.target && (
                      <span 
                        className="font-semibold whitespace-nowrap" 
                        style={{ color: log.targetColor ?? '#FFFFFF' }}
                      >
                        {truncateName(log.target)}
                      </span>
                    )}
                  </div>
                ) : log.type === 'scandal' ? (
                  <div className="flex flex-wrap items-center gap-1">
                    {/* Use scandal message with proper template instead of string splitting */}
                    <span className={getMessageTypeClass(log.type, false)}>
                      {formatMessage(log.coins !== undefined 
                        ? GameMessages.actions.scandal(log.coins) 
                        : log.message || '', false)}
                    </span>
                    {log.target && (
                      <span 
                        className="font-semibold whitespace-nowrap" 
                        style={{ color: log.targetColor ?? '#FFFFFF' }}
                      >
                        {truncateName(log.target)}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-1">
                    <span className={`break-words ${getMessageTypeClass(log.type)}`}>
                      {formatMessage(log.message || '', isSystemMessage(log.type))}
                    </span>
                    {/* Show target name for all action types that have targets except special cases */}
                    {log.target && !isSystemMessage(log.type) && ['investigate', 'show-card'].includes(log.type) && (
                      <span 
                        className="font-semibold whitespace-nowrap" 
                        style={{ color: log.targetColor ?? '#FFFFFF' }}
                      >
                        {truncateName(log.target)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}