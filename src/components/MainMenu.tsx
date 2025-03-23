import React, { useState, useEffect } from 'react';
import { Plus, Users, ArrowLeft, Copy, Info, Trophy } from 'lucide-react';
import { useGame } from '../hooks/useGame';
import capitolBg from '../assets/images/capitol-bg.png';

interface MainMenuProps {
  onGameStart: (gameId: string) => void;
  playerId: number;
}

const COLORS = [
  '#E74C3C', // Red
  '#2ECC71', // Green
  '#3498DB', // Blue
  '#F1C40F', // Yellow
  '#9B59B6', // Purple
  '#E67E22', // Orange
];

export function MainMenu({ onGameStart, playerId }: MainMenuProps) {
  const { createGame, joinGame } = useGame();
  const [joiningId, setJoiningId] = useState('');
  const [playerName, setPlayerName] = useState(`Player ${playerId % 1000}`);
  const [view, setView] = useState<'main' | 'join'>('main');
  const [error, setError] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  // Avatar color based on player ID
  const playerColor = COLORS[playerId % COLORS.length];

  const createPlayerData = () => ({
    id: playerId,
    name: playerName || `Player ${playerId % 1000}`,
    coins: 2,
    color: playerColor,
    avatar: ''
  });

  const handleCreateGame = async () => {
    try {
      setError(null);
      const gameId = await createGame();
      const playerData = createPlayerData();
      await joinGame(gameId, playerData);
      onGameStart(gameId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create game');
    }
  };

  const handleJoinGame = async () => {
    if (!joiningId) {
      setError('Please enter a game ID');
      return;
    }
    
    if (joiningId.length !== 6) {
      setError('Game code must be 6 characters');
      return;
    }
    
    try {
      setError(null);
      const playerData = createPlayerData();
      await joinGame(joiningId, playerData);
      onGameStart(joiningId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join game');
    }
  };

  if (view === 'main') {
    return (
      <div className="flex flex-col h-full">
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

        {/* Header */}
        <div className="flex-none pt-8 pb-6 text-center relative z-20">
          <h1 className="text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-b from-zinc-200 to-zinc-400">
            Conflictology
          </h1>
          <h2 className="text-lg font-semibold text-zinc-500 mt-1 tracking-wider">CAPITOL</h2>
          
          <div className="flex justify-end absolute top-4 right-4">
            <button 
              className="w-10 h-10 bg-zinc-900/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-zinc-800 transition-colors border border-zinc-800/30"
              onClick={() => setShowInstructions(!showInstructions)}
            >
              <Info className="w-5 h-5 text-white/80" />
            </button>
          </div>
        </div>

        {/* Show instructions */}
        {showInstructions && (
          <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-md p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-zinc-200">How to Play</h2>
              <button 
                onClick={() => setShowInstructions(false)}
                className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800"
              >
                <ArrowLeft className="w-4 h-4 text-zinc-400" />
              </button>
            </div>
            <div className="overflow-y-auto text-zinc-400 space-y-5 text-sm flex-1">
              <p className="border-l-2 border-zinc-800 pl-3 py-1">Conflictology: Capitol is a game of deception and strategy. Your goal is to be the last player with influence remaining.</p>
              
              <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800/50">
                <h3 className="text-zinc-300 font-medium mb-3 uppercase text-xs tracking-wider">Character Actions</h3>
                <ul className="space-y-2.5">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-zinc-700"></div>
                    <span className="text-zinc-500">Income:</span> 
                    <span className="text-zinc-300">Take 1 coin</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-zinc-700"></div>
                    <span className="text-zinc-500">Foreign Aid:</span> 
                    <span className="text-zinc-300">Take 2 coins (can be blocked by Duke)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-zinc-700"></div>
                    <span className="text-zinc-500">Duke:</span> 
                    <span className="text-zinc-300">Take 3 coins</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-zinc-700"></div>
                    <span className="text-zinc-500">Ambassador:</span> 
                    <span className="text-zinc-300">Exchange cards with Court deck</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-zinc-700"></div>
                    <span className="text-zinc-500">Captain:</span> 
                    <span className="text-zinc-300">Steal 2 coins from another player</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-zinc-700"></div>
                    <span className="text-zinc-500">Assassin:</span> 
                    <span className="text-zinc-300">Pay 3 coins to attempt assassination</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-zinc-700"></div>
                    <span className="text-zinc-500">Coup:</span> 
                    <span className="text-zinc-300">Pay 7 coins to eliminate one influence</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800/50">
                <h3 className="text-zinc-300 font-medium mb-2 uppercase text-xs tracking-wider">Blocking and Challenging</h3>
                <p>You can block or challenge other players' actions. If you correctly challenge, they lose influence. If you're wrong, you lose influence.</p>
              </div>
              
              <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800/50">
                <h3 className="text-zinc-300 font-medium mb-2 uppercase text-xs tracking-wider">Game End</h3>
                <p>The last player with influence remaining wins the game!</p>
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 p-4 pt-0 space-y-5 flex flex-col justify-center relative z-20">
          {error && (
            <div className="bg-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-4 animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}
          
          {/* Customize section */}
          <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl p-5 mb-4 border border-zinc-800/30 shadow-xl">
            <h3 className="text-zinc-500 font-medium text-xs uppercase tracking-wider mb-3">Your Identity</h3>
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg" 
                style={{ backgroundColor: playerColor }}
              >
                {playerName.substring(0, 1).toUpperCase()}
              </div>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Your name"
                maxLength={15}
                className="bg-black/50 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 flex-1 focus:outline-none focus:ring-1 focus:ring-zinc-700 placeholder-zinc-600"
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={handleCreateGame}
              className="w-full bg-gradient-to-br from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 text-white rounded-xl p-4 flex items-center justify-between group transition-all duration-200 shadow-xl shadow-black/50 border border-zinc-700/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <Plus className="w-6 h-6 text-white group-hover:text-zinc-200" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-lg text-zinc-100 group-hover:text-white">Create Game</div>
                  <div className="text-sm text-zinc-400 group-hover:text-zinc-300">Start a new game room</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setView('join')}
              className="w-full bg-gradient-to-br from-zinc-900 to-black hover:from-zinc-800 hover:to-zinc-900 text-white rounded-xl p-4 flex items-center justify-between group transition-all duration-200 shadow-xl shadow-black/50 border border-zinc-800/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <Users className="w-6 h-6 text-white group-hover:text-zinc-200" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-lg text-zinc-100 group-hover:text-white">Join Game</div>
                  <div className="text-sm text-zinc-400 group-hover:text-zinc-300">Enter an existing room</div>
                </div>
              </div>
            </button>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex-none pb-6 text-center text-zinc-700 text-xs relative z-20">
          <p className="tracking-widest">CONFLICTOLOGY·CAPITOL·V1.0</p>
        </div>
      </div>
    );
  }
  
  if (view === 'join') {
    return (
      <div className="p-4 h-full flex flex-col">
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
        
        {/* Header with back button */}
        <div className="flex items-center mb-6 relative z-20">
          <button 
            className="w-10 h-10 bg-[#2a2a2a]/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-[#333333] transition-colors"
            onClick={() => {
              setView('main');
              setError(null);
            }}
          >
            <ArrowLeft className="w-5 h-5 text-white/80" />
          </button>
          <h2 className="text-white font-semibold text-lg ml-4">Join Game</h2>
        </div>
        
        {error && (
          <div className="bg-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-4 animate-in fade-in slide-in-from-top-2 relative z-20">
            {error}
          </div>
        )}
        
        <div className="flex-1 flex flex-col justify-center relative z-20">
          <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl p-5 mb-6 border border-zinc-800/30 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg" 
                style={{ backgroundColor: playerColor }}
              >
                {playerName.substring(0, 1).toUpperCase()}
              </div>
              <div className="text-white">
                <div className="font-medium">{playerName}</div>
                <div className="text-xs text-white/50">Ready to join</div>
              </div>
            </div>
            
            <h3 className="text-zinc-400 font-medium text-sm mb-3 mt-2">SECRET CODE</h3>
            <input
              type="text"
              value={joiningId}
              onChange={(e) => setJoiningId(e.target.value)}
              className="w-full bg-black/50 border border-zinc-800 rounded-lg px-4 py-3 text-white text-lg tracking-wider focus:outline-none focus:ring-1 focus:ring-zinc-700 mb-3 text-center font-mono"
              maxLength={6}
            />
            <p className="text-zinc-500 text-xs text-center mb-2">
              Enter the exact secret code from the host
            </p>
          </div>
          
          <button
            onClick={handleJoinGame}
            disabled={joiningId.length !== 6}
            className={`w-full py-3.5 rounded-lg font-medium text-md flex items-center justify-center gap-2 transition-all ${
              joiningId.length === 6
                ? 'bg-gradient-to-br from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 text-white border border-zinc-700/30 shadow-lg'
                : 'bg-zinc-900/50 text-zinc-600 cursor-not-allowed border border-zinc-800/30'
            }`}
          >
            Join Game
          </button>
        </div>
      </div>
    );
  }
  
  // Create view has been removed since we're creating games directly from the main menu
  
  return null;
}