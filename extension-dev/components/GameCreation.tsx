import { useState, useEffect } from 'react';
import { Plus, Users, LoaderPinwheel } from 'lucide-react';
import { useGame } from '../hooks/useGame';
import { auth } from '../../../firebase/firebaseClient';

interface GameCreationProps {
  onGameStart: (gameId: string) => void;
  playerId: number;
}

const PLAYER_COLORS = [
  "#C0392B", // Vibrant Red
  "#27AE60", // Bright Green
  "#2980B9", // Bold Blue
  "#F1C40F", // Strong Yellow
  "#8E44AD", // Vivid Purple
  "#E67E22"  // Bright Orange
]


export function GameCreation({ onGameStart, playerId }: GameCreationProps) {
  const { createGame, joinGame } = useGame();
  const [joiningId, setJoiningId] = useState('');
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [isJoiningGame, setIsJoiningGame] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const user = auth.currentUser;
      setIsAuthenticated(!!user && !!user.uid);
      console.log("Auth state in GameCreation:", !!user && !!user.uid ? "Authenticated" : "Not authenticated");
    };
    
    checkAuth();
    
    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user && !!user.uid);
      console.log("Auth state changed:", !!user && !!user.uid ? "Authenticated" : "Not authenticated");
    });
    
    return () => unsubscribe();
  }, []);

  const createPlayerData = () => ({
    id: playerId,
    name: `Player ${playerId % 1000}`, // Use modulo to get a smaller display number
    coins: 2,
    color: PLAYER_COLORS[playerId % PLAYER_COLORS.length],
    avatar: '' // We'll use the color + first initial fallback instead
  });

  const handleCreateGame = async () => {
    if (isCreatingGame) return;
    
    // First check if the user is authenticated
    if (!isAuthenticated) {
      setError('You must be signed in to create a game. Please sign in first.');
      return;
    }
    
    try {
      setError(null);
      setIsCreatingGame(true);
      const gameId = await createGame();
      const playerData = createPlayerData();
      await joinGame(gameId, playerData);
      onGameStart(gameId);
      // We don't reset isCreatingGame here because the component will unmount
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
    
    // First check if the user is authenticated
    if (!isAuthenticated) {
      setError('You must be signed in to join a game. Please sign in first.');
      return;
    }
    
    try {
      setError(null);
      setIsJoiningGame(true);
      const playerData = createPlayerData();
      await joinGame(joiningId, playerData);
      onGameStart(joiningId);
      // We don't reset isJoiningGame here because the component will unmount
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join game');
      setIsJoiningGame(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      {error && (
        <div className="bg-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-4 animate-in fade-in slide-in-from-top-2">
          {error}
        </div>
      )}
      
      <button
        onClick={handleCreateGame}
        disabled={isCreatingGame}
        className={`
          w-full bg-gradient-to-r 
          ${isCreatingGame 
            ? 'from-yellow-700 to-yellow-600' 
            : 'from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400'
          } 
          text-white rounded-xl p-4 flex items-center justify-between group transition-all duration-200 shadow-lg shadow-yellow-500/20
        `}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-yellow-400/20 flex items-center justify-center">
            {isCreatingGame ? (
              <LoaderPinwheel className="w-6 h-6 animate-spin" />
            ) : (
              <Plus className="w-6 h-6" />
            )}
          </div>
          <div className="text-left">
            <div className="font-semibold text-lg">
              {isCreatingGame ? 'Creating Game...' : 'Create Game'}
            </div>
            <div className="text-sm text-yellow-200/80">
              {isCreatingGame ? 'Please wait' : 'Start a new game room'}
            </div>
          </div>
        </div>
      </button>

      {!showJoinInput ? (
        <button
          onClick={() => setShowJoinInput(true)}
          disabled={isCreatingGame}
          className={`
            w-full bg-gradient-to-r 
            ${isCreatingGame 
              ? 'from-blue-700 to-blue-600 opacity-70 cursor-not-allowed' 
              : 'from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400'
            } 
            text-white rounded-xl p-4 flex items-center justify-between group transition-all duration-200 shadow-lg shadow-blue-500/20
          `}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-400/20 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-lg">Join Game</div>
              <div className="text-sm text-blue-200/80">Enter an existing room</div>
            </div>
          </div>
        </button>
      ) : (
        <div className="w-full bg-[#2a2a2a] rounded-xl p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2">
          <input
            type="text"
            value={joiningId}
            onChange={(e) => setJoiningId(e.target.value)}
            placeholder="Enter game ID"
            className="w-full bg-[#1a1a1a] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <div className="flex gap-2">
            <button
              onClick={handleJoinGame}
              disabled={isJoiningGame}
              className={`
                flex-1 flex items-center justify-center gap-2
                ${isJoiningGame ? 'bg-blue-600' : 'bg-blue-500 hover:bg-blue-400'}
                text-white rounded-lg py-2 transition-colors
              `}
            >
              {isJoiningGame ? (
                <>
                  <LoaderPinwheel className="w-4 h-4 animate-spin" />
                  <span>Joining...</span>
                </>
              ) : (
                'Join'
              )}
            </button>
            <button
              onClick={() => {
                setShowJoinInput(false);
                setError(null);
                setJoiningId('');
              }}
              disabled={isJoiningGame}
              className={`
                flex-1 
                ${isJoiningGame ? 'bg-[#1a1a1a] opacity-50 cursor-not-allowed' : 'bg-[#1a1a1a] hover:bg-[#333333]'} 
                text-white rounded-lg py-2 transition-colors
              `}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}