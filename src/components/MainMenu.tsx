import { useState } from 'react';
import { Plus, Users, ArrowLeft } from 'lucide-react';
import { useGame } from '../hooks/useGame';
import capitolBg from '../assets/images/capitol-bg.png';
import { GameRules } from './GameRules';

interface MainMenuProps {
  onGameStart: (gameId: string) => void;
  playerId: number;
}

// Six distinct colors for the game
const PLAYER_COLORS = [
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
  const [view, setView] = useState<'main' | 'join' | 'rules'>('main');
  const [error, setError] = useState<string | null>(null);

  // Avatar color based on player ID
  const playerColor = PLAYER_COLORS[playerId % PLAYER_COLORS.length];

  const createPlayerData = () => ({
    id: playerId,
    name: playerName || `Player ${playerId % 1000}`,
    coins: 2,
    color: playerColor,
    avatar: '' // We'll use the color + first initial fallback instead
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

  if (view === 'rules') {
    return <GameRules onBack={() => {
      setView('main');
      setError(null);
    }} />;
  }

  if (view === 'main') {
    return (
      <div className="flex flex-col h-full">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 z-10" />
          <img 
            src={capitolBg} 
            alt="Capitol Background" 
            className="object-cover w-full h-full opacity-60"
          />
          <div className="absolute inset-0 z-10" />
        </div>

        {/* Header */}
        <div className="flex-none pt-8 pb-6 text-center relative z-20">
          <h1 className="text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-b from-zinc-200 to-zinc-400">
            Conflictology
          </h1>
          <h2 className="text-lg font-semibold text-zinc-500 mt-1 tracking-wider">CAPITOL</h2>
        </div>

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

            <button
              onClick={() => setView('rules')}
              className="w-full bg-gradient-to-br from-amber-900/50 to-amber-950/50 hover:from-amber-800/50 hover:to-amber-900/50 text-white rounded-xl p-4 flex items-center justify-between group transition-all duration-200 shadow-xl shadow-black/50 border border-amber-800/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <svg 
                    className="w-6 h-6 text-amber-500/90 group-hover:text-amber-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-lg text-amber-100 group-hover:text-white">Game Rules</div>
                  <div className="text-sm text-amber-300/70 group-hover:text-amber-200">Learn how to play</div>
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
  
  return null;
}