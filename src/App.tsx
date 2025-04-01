import { useState, useEffect } from 'react';
import { useGame } from './hooks/useGame';
import { MainMenu } from './components/MainMenu';
import { GameView } from './components/GameView';
import { X } from 'lucide-react';

function App() {
  const [view, setView] = useState<'lobby' | 'game'>('lobby');
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<number>(Math.floor(Math.random() * 1000));
  const [showKickNotification, setShowKickNotification] = useState(false);
  const { game, wasKicked } = useGame(gameId || undefined, gameId ? playerId : undefined);

  const handleGameStart = (id: string) => {
    setGameId(id);
    setView('game');
  };

  const handleReturnToLobby = () => {
    setGameId(null);
    setView('lobby');
    setPlayerId(Math.floor(Math.random() * 1000)); // Generate a new playerId for next game
  };

  // Handle automatic redirect to lobby
  useEffect(() => {
    if (game?.redirectToLobby) {
      handleReturnToLobby();
    }
  }, [game?.redirectToLobby]);
  
  // Handle kicked detection
  useEffect(() => {
    if (wasKicked) {
      console.log("Player was kicked! Returning to lobby...");
      setShowKickNotification(true);
      handleReturnToLobby();
      
      // Hide notification after 5 seconds
      const timer = setTimeout(() => {
        setShowKickNotification(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [wasKicked]);

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
      {/* Kick notification */}
      {showKickNotification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-900/90 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <div className="bg-red-700 rounded-full p-1">
            <X className="w-4 h-4" />
          </div>
          <span>You have been removed from the game</span>
          <button 
            onClick={() => setShowKickNotification(false)}
            className="ml-2 rounded-full bg-red-800 p-1 hover:bg-red-700 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
      
      <div className="w-[345px] h-[750px] bg-zinc-900 relative overflow-hidden border border-zinc-800 rounded-xl">
        <div className="relative h-full">
          {view === 'lobby' ? (
            <MainMenu onGameStart={handleGameStart} playerId={playerId} />
          ) : (
            <GameView gameId={gameId!} playerId={playerId} onReturnToLobby={handleReturnToLobby} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;