import { Copy, Users, PlayCircle, ArrowLeft, Trophy, X } from 'lucide-react';
import { Game } from '../types';
import lobbyBg from '../assets/images/lobby-bg.png';
import { useGame } from '../hooks/useGame';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useEffect } from 'react';

interface GameLobbyProps {
  game: Game;
  isHost: boolean;
  currentPlayerId: number;
  onStartGame: () => void;
  onReturnToMainMenu: () => void;
}

export function GameLobby({ game, isHost, currentPlayerId, onStartGame, onReturnToMainMenu }: GameLobbyProps) {
  const { leaveGame, wasKicked } = useGame(game.id, currentPlayerId);
  
  const copyGameId = () => {
    navigator.clipboard.writeText(game.id);
  };

  // Handle kick detection
  useEffect(() => {
    if (wasKicked) {
      console.log("Player was kicked! Returning to main menu from GameLobby");
      onReturnToMainMenu();
    }
  }, [wasKicked, onReturnToMainMenu]);
  
  const handleLeaveGame = async () => {
    try {
      // Find player index
      const playerIndex = game.players.findIndex(p => p.id === currentPlayerId);
      if (playerIndex !== -1) {
        await leaveGame(playerIndex);
      }
      onReturnToMainMenu();
    } catch (error) {
      console.error("Error leaving game:", error);
      // Still return to main menu even if there's an error
      onReturnToMainMenu();
    }
  };
  
  // Get winner info
  const winnerIndex = game.winner !== undefined ? game.winner : -1;
  const winner = winnerIndex !== -1 ? game.players[winnerIndex] : undefined;

  return (
    <div className="relative h-full">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <img 
          src={lobbyBg} 
          alt="Lobby Background" 
          className="object-cover w-full h-full opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70 z-10" />
      </div>
      
      {/* Back button - same position and style as in game */}
      <button 
        className="w-10 h-10 bg-zinc-900/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-zinc-800 transition-colors absolute left-4 top-4 z-30 border border-zinc-800/30"
        onClick={handleLeaveGame}
      >
        <ArrowLeft className="w-5 h-5 text-white/80" />
      </button>
      
      {/* No popup needed anymore */}
      
      <div className="p-4 space-y-4 h-full">
        {/* Page title - centered at top */}
        <div className="relative z-20 mt-4 mb-4 text-center">
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
        
        {/* Last game winner section - only show if there's a winner */}
        {winner && (
          <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/80 backdrop-blur-sm rounded-lg p-4 border border-yellow-600/30 relative z-20 shadow-xl overflow-hidden">
            {/* Glow effects */}
            <div className="absolute -inset-1 bg-yellow-500/10 blur-xl rounded-lg"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/5 via-yellow-500/10 to-yellow-600/5 animate-pulse-slow"></div>
            
            {/* Content */}
            <div className="relative flex items-center justify-between">
              <div className="flex-1">
              <h3 className="text-yellow-100 font-semibold text-md tracking-wide mb-2 text-center">Match Winner</h3>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-md shadow-md" 
                    style={{ backgroundColor: winner.color }}
                  >
                    {winner.name.substring(0, 1).toUpperCase()}
                  </div>
                  <span className="text-lg text-white font-medium">
                    {winner.name}
                  </span>
                </div>
              </div>
              
              {/* Trophy on the right */}
              <div className="opacity-20 absolute right-4 bottom-0 transform translate-y-1/4">
                <Trophy className="w-24 h-24 text-yellow-400" />
              </div>
            </div>
          </div>
        )}

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
          <div className="mt-4 space-y-2 max-h-84 overflow-y-auto">
            {game.players.map((player, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/50 border border-zinc-800/30"
              >
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm shadow-md" 
                  style={{ backgroundColor: player.color }}
                >
                  {player.name.substring(0, 1).toUpperCase()}
                </div>
                <span className="text-sm text-zinc-200">{player.name}</span>
                <div className="flex gap-1.5 ml-auto">
                  {player.id === currentPlayerId && (
                    <span 
                      className="text-xs px-2 py-0.5 rounded-full border"
                      style={{ 
                        color: player.color,
                        borderColor: `${player.color}40` // 25% opacity of player color
                      }}
                    >
                      You
                    </span>
                  )}
                  {index === 0 && (
                    <span className="text-xs text-zinc-500 border border-zinc-800 rounded-full px-2 py-0.5">
                      Host
                    </span>
                  )}
                  {/* Add remove button for host only */}
                  {isHost && player.id !== currentPlayerId && (
                    <button
                      onClick={async () => {
                        try {
                          await leaveGame(index);
                        } catch (error) {
                          console.error("Error removing player:", error);
                        }
                      }}
                      className="w-5 h-5 bg-red-900/30 rounded-full flex items-center justify-center hover:bg-red-800/50 transition-colors ml-1"
                      title="Remove player"
                    >
                      <X className="w-3 h-3 text-red-400" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Return to Game button - only show if this player's view state is lobby and game is in progress */}
        {game.status === 'playing' && game.players.some(p => p.id === currentPlayerId && p.tempViewState === 'lobby') && (
          <button
            onClick={async () => {
              // Update only this player's view state
              const gameRef = doc(db, 'games', game.id);
              const playerIndex = game.players.findIndex(p => p.id === currentPlayerId);
              
              if (playerIndex !== -1) {
                // Create updated players array without the tempViewState for this player
                const updatedPlayers = [...game.players];
                updatedPlayers[playerIndex] = {
                  ...updatedPlayers[playerIndex],
                  tempViewState: 'game' // Reset to game view
                };
                
                // Update Firestore with this player's view state cleared
                await updateDoc(gameRef, { players: updatedPlayers });
              }
            }}
            className="w-full bg-gradient-to-br from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 text-white rounded-xl p-4 flex items-center justify-between group transition-all duration-200 shadow-xl shadow-black/40 border border-zinc-700/30 relative z-20 mt-2"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-zinc-300 group-hover:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 17l5-5-5-5"></path>
                  <path d="M4 12h16"></path>
                </svg>
              </div>
              <div className="text-left">
                <div className="font-semibold text-lg text-zinc-200 group-hover:text-white">
                  Return to Game
                </div>
                <div className="text-sm text-zinc-400 group-hover:text-zinc-300">
                  Go back to the current match
                </div>
              </div>
            </div>
          </button>
        )}

        {/* Start game button (host only) */}
        {isHost && game.players.length >= 2 && 
          !(game.status === 'playing' && game.players.some(p => p.id === currentPlayerId && p.tempViewState === 'lobby')) && (
          <button
            onClick={onStartGame}
            className="w-full bg-gradient-to-br from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 text-white rounded-xl p-4 flex items-center justify-between group transition-all duration-200 shadow-xl shadow-black/40 border border-zinc-700/30 relative z-20 mt-2"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                <PlayCircle className="w-6 h-6 text-zinc-300 group-hover:text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-lg text-zinc-200 group-hover:text-white">
                  {game.winner !== undefined ? 'Start New Match' : 'Start Game'}
                </div>
                <div className="text-sm text-zinc-400 group-hover:text-zinc-300">
                  {game.winner !== undefined ? 'Begin a new match' : 'Begin the match'}
                </div>
              </div>
            </div>
          </button>
        )}

        {/* Waiting message - don't show if this player can return to game */}
        {(!isHost || game.players.length < 2) && 
          !(game.status === 'playing' && game.players.some(p => p.id === currentPlayerId && p.tempViewState === 'lobby')) && (
          <div className="mt-4 text-center text-zinc-500 text-sm animate-pulse relative z-20 bg-black/20 py-3 rounded-lg border border-zinc-800/20">
            Waiting...
          </div>
        )}
      </div>
    </div>
  );
}