import { GameLogEntry, GameState } from '../types';
import { Clock } from 'lucide-react';

interface GameLogProps {
  logs: GameLogEntry[];
  currentPlayer: string;
  currentPlayerColor: string;
  gameState?: GameState;
  selectedAction?: string;
  game: {
    currentTurn: number;
    players: Array<{
      id: number;
      name: string;
      color: string;
    }>;
  };
}


// Format message with highlighting for special terms and player names
const formatMessage = (message: string) => {
  const keywords = [
    'Banker', 'Hacker', 'Mafia', 'Reporter', 'Judge', 'Police',
    'Income', 'Foreign Aid', 'Tax', 'Steal', 'Exchange', 'Hack',
    'Investigate', 'Scandal', 'Swap'
  ];
  
  // For action messages, highlight keywords
  const parts = message.split(new RegExp(`(${keywords.join('|')})`, 'g'));
  
  // Format each part with keywords highlighted
  const formattedParts = parts.map((part, index) => {
    // Bold the keyword terms
    if (keywords.includes(part)) {
      return (
        <span key={index} className="font-bold">
          {part}
        </span>
      );
    }
    
    return part;
  });
  
  return formattedParts;
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
    return name.length > 12 ? `${name.slice(0, 10)}…` : name;
  };

  // Function to get the CSS class for different message types for visual styling
  const getMessageTypeClass = (logType: string): string => {
    
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
      <div className="p-1.5 bg-gradient-to-b from-[#2a2a2a]/80 to-transparent">
        <div className="space-y-1">
          {lastFourLogs.map((log, index) => (
            <div 
              key={index} 
              className="flex flex-wrap items-center px-2 py-1 rounded bg-[#3a3a3a]/50 animate-in fade-in slide-in-from-bottom-2"
              style={{
                animationDelay: `${index * 50}ms`,
                opacity: index === 0 ? 1 : index === 1 ? 0.95 : index === 2 ? 0.5 : 0.2,
              }}
            >
              <div className="flex flex-wrap gap-1 items-center text-[11px] w-full">

                {/* if log.type is not 'system', show the player name */}
                {log.type !== 'system' && (
                  <span 
                    className={`font-bold ${getMessageTypeClass(log.type)}`}
                    style={{ color: log.playerColor }}
                  >
                    {truncateName(log.player)}
                  </span>
                )}
                {/* All logs now use message parts for consistent formatting */}
                {log.messageParts && log.messageParts.map((part, partIndex) => {
                  if (part.type === 'text') {
                    return (
                      <span key={partIndex} className={`text-[10px] ${getMessageTypeClass(log.type)}`}>
                        {formatMessage(part.content)}
                      </span>
                    );
                  } else if (part.type === 'player') {
                    const playerInfo = game.players.find(p => p.id === part.playerId);
                    return (
                      <span 
                        key={partIndex}
                        className={`font-bold ${getMessageTypeClass(log.type)}`}
                        style={{ color: playerInfo?.color || part.color }}
                      >
                        {truncateName(part.content)}
                      </span>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}