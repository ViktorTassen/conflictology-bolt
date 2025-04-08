import { useState, useEffect } from 'react';
import { useGame } from './hooks/useGame';
import { MainMenu } from './components/MainMenu';
import { GameView } from './components/GameView';
import { getPlayerId, savePlayerId } from './utils/storage';

function App() {
  const [view, setView] = useState<'lobby' | 'game'>('lobby');
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<number>(Math.floor(Math.random() * 1000));
  const { game, wasKicked } = useGame(gameId || undefined, gameId ? playerId : undefined);
  
  // Load player ID from storage on initial load
  useEffect(() => {
    const loadPlayerId = async () => {
      const savedId = await getPlayerId();
      if (savedId !== null) {
        setPlayerId(savedId);
      } else {
        // If no saved ID exists, save the current random ID
        const newId = Math.floor(Math.random() * 1000);
        setPlayerId(newId);
        savePlayerId(newId);
      }
    };
    
    loadPlayerId();
  }, []);

  const handleGameStart = (id: string) => {
    setGameId(id);
    setView('game');
  };

  const handleReturnToLobby = () => {
    setGameId(null);
    setView('lobby');
    
    // We no longer generate a new player ID each time
    // This ensures the player keeps the same identity across games
    // If you want to allow player ID changes, you could add a button for that
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
      handleReturnToLobby();
    }
  }, [wasKicked]);

  return (
    <div className="h-full bg-zinc-900 p-0 overflow-y-auto">
      <div className="w-full min-h-[740px] max-h-[750px] h-full  max-w-[360px] mx-auto bg-zinc-900 relative shadow-lg">
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