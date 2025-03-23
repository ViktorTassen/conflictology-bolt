import React from 'react';
import { Copy, Users, PlayCircle, ArrowLeft } from 'lucide-react';
import { Game } from '../types';
import capitolBg from '../assets/images/capitol-bg.png';

interface GameLobbyProps {
  game: Game;
  isHost: boolean;
  onStartGame: () => void;
  onReturnToMainMenu: () => void;
  currentPlayerId?: number;
}

export function GameLobby({ game, isHost, onStartGame, onReturnToMainMenu, currentPlayerId }: GameLobbyProps) {
  const copyGameId = () => {
    navigator.clipboard.writeText(game.id);
  };

  return (
    <div className="relative h-full">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <img 
          src={capitolBg} 
          alt="Capitol Background" 
          className="object-cover w-full h-full opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90 z-10" />
      </div>
      
      {/* Back button - same position and style as in game */}
      <button 
        className="w-10 h-10 bg-zinc-900/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-zinc-800 transition-colors absolute left-4 top-4 z-30 border border-zinc-800/30"
        onClick={onReturnToMainMenu}
      >
        <ArrowLeft className="w-5 h-5 text-white/80" />
      </button>
      
      <div className="p-4 space-y-4 h-full">
        {/* Page title - centered at top */}
        <div className="relative z-20 mt-12 mb-4 text-center">
          <h2 className="text-md font-semibold text-zinc-400">Game Room</h2>
        </div>
        
        {/* Game ID section */}
        <div className="bg-zinc-900/80 backdrop-blur-sm rounded-lg p-4 border border-zinc-800/30 relative z-20 shadow-xl">
          <div className="text-center space-y-2">
            <h3 className="text-zinc-400 font-medium text-sm uppercase tracking-wide">Secret Code</h3>
            <div className="flex items-center justify-center gap-2">
              <code className="bg-black/50 px-3 py-1.5 rounded text-zinc-200 font-mono border border-zinc-800/50">
                {game.id}
              </code>
              <button
                onClick={copyGameId}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-black/50 hover:bg-zinc-800 transition-colors border border-zinc-800/50"
              >
                <Copy className="w-4 h-4 text-white/70" />
              </button>
            </div>
          </div>
        </div>

        {/* Players counter */}
        <div className="bg-zinc-900/80 backdrop-blur-sm rounded-lg p-4 border border-zinc-800/30 relative z-20 shadow-xl">
          <div className="flex items-center justify-center gap-3">
            <Users className="w-5 h-5 text-zinc-400" />
            <div className="text-sm">
              <span className="text-zinc-200 font-bold">{game.players.length}</span>
              <span className="text-zinc-500"> / </span>
              <span className="text-zinc-600">6</span>
              <span className="ml-2 text-zinc-500">players</span>
            </div>
          </div>

          {/* Player list */}
          <div className="mt-4 space-y-2 max-h-72 overflow-y-auto">
            {game.players.map((player, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-black/50 border border-zinc-800/30"
              >
                <div 
                  className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shadow-md" 
                  style={{ backgroundColor: player.color }}
                >
                  {player.name.substring(0, 1).toUpperCase()}
                </div>
                <span className="text-sm text-zinc-200">{player.name}</span>
                <div className="ml-auto flex gap-2">
                  {player.id === currentPlayerId && (
                    <span className="text-xs text-yellow-300 bg-zinc-800 border border-yellow-500/30 rounded-full px-2 py-0.5">You</span>
                  )}
                  {index === 0 && (
                    <span className="text-xs text-zinc-500 border border-zinc-800 rounded-full px-2 py-0.5">Host</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Start game button (host only) */}
        {isHost && game.players.length >= 2 && (
          <button
            onClick={onStartGame}
            className="w-full bg-gradient-to-br from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 text-white rounded-xl p-4 flex items-center justify-between group transition-all duration-200 shadow-xl shadow-black/40 border border-zinc-700/30 relative z-20 mt-2"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                <PlayCircle className="w-6 h-6 text-zinc-300 group-hover:text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-lg text-zinc-200 group-hover:text-white">Start Game</div>
                <div className="text-sm text-zinc-400 group-hover:text-zinc-300">Begin the match</div>
              </div>
            </div>
          </button>
        )}

        {/* Waiting message */}
        {(!isHost || game.players.length < 2) && (
          <div className="mt-4 text-center text-zinc-500 text-sm animate-pulse relative z-20 bg-black/20 py-3 rounded-lg border border-zinc-800/20">
            Waiting...
          </div>
        )}
      </div>
    </div>
  );
}