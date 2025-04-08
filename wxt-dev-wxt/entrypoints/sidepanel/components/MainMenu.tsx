import { useState, useEffect } from 'react';
import { Plus, Users, ArrowLeft, LoaderPinwheel } from 'lucide-react';
import { useGame } from '../hooks/useGame';
import capitolBg from '../assets/images/capitol-bg.png';
import { getPlayerName, savePlayerName } from '../utils/storage';

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
  const [view, setView] = useState<'main' | 'join'>('main');
  const [error, setError] = useState<string | null>(null);
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [isJoiningGame, setIsJoiningGame] = useState(false);
  
  // Load player name from storage on component mount
  useEffect(() => {
    const loadPlayerName = async () => {
      const savedName = await getPlayerName();
      if (savedName) {
        setPlayerName(savedName);
      }
    };
    
    loadPlayerName();
  }, []);

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
    if (isCreatingGame) return;
    
    try {
      setError(null);
      setIsCreatingGame(true);
      const gameId = await createGame();
      const playerData = createPlayerData();
      await joinGame(gameId, playerData);
      onGameStart(gameId);
      // No need to reset state as component unmounts
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create game');
      setIsCreatingGame(false);
    }
  };

  const handleJoinGame = async () => {
    if (!joiningId || isJoiningGame) {
      setError('Please enter a game ID');
      return;
    }
    
    if (joiningId.length !== 6) {
      setError('Game code must be 6 characters');
      return;
    }
    
    try {
      setError(null);
      setIsJoiningGame(true);
      const playerData = createPlayerData();
      await joinGame(joiningId, playerData);
      onGameStart(joiningId);
      // No need to reset state as component unmounts
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join game');
      setIsJoiningGame(false);
    }
  };


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
          <h1 className="text-5xl font-normal text-[#f7e7c2] bg-clip-text text-transparent bg-gradient-to-b from-zinc-200 to-zinc-400" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '3px' }}>
            CONFLICTOLOGY
          </h1>
          <div className="flex items-center justify-center">
            <div className="h-[3px] w-16 bg-[#850c09] rounded-full shadow-sm shadow-[#850c09]/50"></div>
            <h2 
              className="text-md font-bold mx-4 tracking-widest" 
              style={{ 
                fontFamily: "'League Spartan', sans-serif", 
                color: "#f7e7c2",
                textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                letterSpacing: '5px'
              }}
            >
              CAPITOL
            </h2>
            <div className="h-[3px] w-16 bg-[#850c09] rounded-full shadow-sm shadow-[#850c09]/50"></div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-4 pt-0 space-y-5 flex flex-col justify-center relative z-20">
          {error && (
            <div className="bg-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-4 animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}
          
          {/* Customize section */}
          <div className="bg-[#111111]/80 rounded-md p-4 border border-zinc-800/40 shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/10"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#850c09]/10 to-transparent rounded-full blur-2xl transform translate-x-16 -translate-y-16 opacity-30"></div>
            
            
            <div className="flex items-center gap-3 relative">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-md relative overflow-hidden border border-zinc-800/60" 
                style={{ backgroundColor: "#232720", color:"white" }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                {playerName.substring(0, 1).toUpperCase()}
              </div>
              <input
                type="text"
                value={playerName}
                onChange={(e) => {
                  const newName = e.target.value;
                  setPlayerName(newName);
                  savePlayerName(newName);
                }}
                placeholder="Your name"
                maxLength={15}
                className="bg-black/60 border border-zinc-800/80 rounded-md px-3 py-2.5 text-zinc-200 flex-1 focus:outline-none focus:ring-1 focus:ring-zinc-700/50 placeholder-zinc-600 text-sm font-medium"
              />
            </div>
            
          </div>
          
          <div className="space-y-1">
            <button
              onClick={handleCreateGame}
              disabled={isCreatingGame}
              className={`
                w-full bg-[#111111]/80 
                ${!isCreatingGame ? 'hover:bg-[#151515]' : ''} 
                text-white rounded-md p-4 flex items-center justify-between group 
                transition-all duration-200 shadow-lg relative overflow-hidden border border-zinc-800/40
              `}
            >
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#850c09] to-[#850c09]/20 group-hover:opacity-100 opacity-70"></div>
              <div className="absolute inset-y-0 left-0 w-1 bg-[#850c09]"></div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-[#850c09]/10 flex items-center justify-center group-hover:bg-[#850c09]/20 transition-colors">
                  {isCreatingGame ? (
                    <LoaderPinwheel className="w-5 h-5 text-[#850c09] animate-spin" />
                  ) : (
                    <Plus className="w-5 h-5 text-[#850c09]" />
                  )}
                </div>
                <div className="text-left">
                  <div className="font-semibold text-base text-zinc-100">
                    {isCreatingGame ? 'Creating Game...' : 'Create Game'}
                  </div>
                  <div className="text-xs text-zinc-400 group-hover:text-zinc-300">
                    {isCreatingGame ? 'Please wait' : 'Start a new game room'}
                  </div>
                </div>
              </div>
              <div className="w-6 h-6 text-zinc-600 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                ›
              </div>
            </button>

            <button
              onClick={() => setView('join')}
              className="w-full bg-[#111111]/80 hover:bg-[#151515] text-white rounded-md p-4 flex items-center justify-between group transition-all duration-200 shadow-lg relative overflow-hidden border border-zinc-800/40"
            >
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-700 to-blue-700/20 group-hover:opacity-100 opacity-70"></div>
              <div className="absolute inset-y-0 left-0 w-1 bg-blue-700"></div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-blue-900/10 flex items-center justify-center group-hover:bg-blue-900/20 transition-colors">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-base text-zinc-100"
                  >Join Game</div>
                  <div className="text-xs text-zinc-400 group-hover:text-zinc-300">Enter an existing room</div>
                </div>
              </div>
              <div className="w-6 h-6 text-zinc-600 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                ›
              </div>
            </button>

            <button
              onClick={() => window.open('https://conflictologygames.com/capitol/rules', '_blank')}
              className="w-full bg-[#111111]/80 hover:bg-[#151515] text-white rounded-md p-4 flex items-center justify-between group transition-all duration-200 shadow-lg relative overflow-hidden border border-zinc-800/40"
            >
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-amber-700 to-amber-700/20 group-hover:opacity-100 opacity-70"></div>
              <div className="absolute inset-y-0 left-0 w-1 bg-amber-700"></div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-amber-900/10 flex items-center justify-center group-hover:bg-amber-900/20 transition-colors">
                  <svg 
                    className="w-5 h-5 text-amber-500" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-base text-zinc-100">Game Rules</div>
                  <div className="text-xs text-zinc-400 group-hover:text-zinc-300">Learn how to play</div>
                </div>
              </div>
              <div className="w-6 h-6 text-zinc-600 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                ›
              </div>
            </button>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex-none pb-6 text-center text-zinc-700 text-xs relative z-20">
          <p className="tracking-widest" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '2px' }}>CONFLICTOLOGY·CAPITOL·V1.0</p>
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
                style={{ backgroundColor: "#232720", color:"white" }} 
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
            disabled={joiningId.length !== 6 || isJoiningGame}
            className={`w-full py-3.5 rounded-lg font-medium text-md flex items-center justify-center gap-2 transition-all ${
              joiningId.length === 6 && !isJoiningGame
                ? 'bg-gradient-to-br from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 text-white border border-zinc-700/30 shadow-lg'
                : isJoiningGame 
                  ? 'bg-gradient-to-br from-zinc-700 to-zinc-800 text-white border border-zinc-700/30 shadow-lg'
                  : 'bg-zinc-900/50 text-zinc-600 cursor-not-allowed border border-zinc-800/30'
            }`}
          >
            {isJoiningGame ? (
              <>
                <LoaderPinwheel className="w-5 h-5 animate-spin" />
                <span>Joining Game...</span>
              </>
            ) : (
              'Join Game'
            )}
          </button>
        </div>
      </div>
    );
  }
  
  return null;
}