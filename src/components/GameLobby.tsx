import React from 'react';
import { Copy, Users, PlayCircle } from 'lucide-react';
import { Game } from '../types';

interface GameLobbyProps {
  game: Game;
  isHost: boolean;
  onStartGame: () => void;
}

export function GameLobby({ game, isHost, onStartGame }: GameLobbyProps) {
  const copyGameId = () => {
    navigator.clipboard.writeText(game.id);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Game ID section */}
      <div className="bg-[#2a2a2a]/80 backdrop-blur-sm rounded-lg p-4">
        <div className="text-center space-y-2">
          <h2 className="text-lg font-semibold text-white">Game Room</h2>
          <div className="flex items-center justify-center gap-2">
            <code className="bg-[#1a1a1a] px-3 py-1.5 rounded text-yellow-500 font-mono">
              {game.id}
            </code>
            <button
              onClick={copyGameId}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1a1a1a] hover:bg-[#333333] transition-colors"
            >
              <Copy className="w-4 h-4 text-white/70" />
            </button>
          </div>
        </div>
      </div>

      {/* Players counter */}
      <div className="bg-[#2a2a2a]/80 backdrop-blur-sm rounded-lg p-4">
        <div className="flex items-center justify-center gap-3">
          <Users className="w-5 h-5 text-blue-400" />
          <div className="text-sm">
            <span className="text-blue-400 font-bold">{game.players.length}</span>
            <span className="text-white/70"> / </span>
            <span className="text-white/50">6</span>
            <span className="ml-2 text-white/70">players</span>
          </div>
        </div>

        {/* Player list */}
        <div className="mt-4 space-y-2">
          {game.players.map((player, index) => (
            <div 
              key={index}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1a1a1a]/50"
            >
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: player.color }}
              />
              <span className="text-sm text-white/90">{player.name}</span>
              {index === 0 && (
                <span className="text-xs text-yellow-500/80 ml-auto">Host</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Start game button (host only) */}
      {isHost && game.players.length >= 2 && (
        <button
          onClick={onStartGame}
          className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-xl p-4 flex items-center justify-between group transition-all duration-200 shadow-lg shadow-green-500/20"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-400/20 flex items-center justify-center">
              <PlayCircle className="w-6 h-6" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-lg">Start Game</div>
              <div className="text-sm text-green-200/80">Begin the match</div>
            </div>
          </div>
        </button>
      )}

      {/* Waiting message */}
      {(!isHost || game.players.length < 2) && (
        <div className="text-center text-white/50 text-sm animate-pulse">
          Waiting for more players...
        </div>
      )}
    </div>
  );
}