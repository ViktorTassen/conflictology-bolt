import { useState, useEffect } from 'react';
import { useGame } from './hooks/useGame';
import { MainMenu } from './components/MainMenu';
import { GameView } from './components/GameView';

function App() {
  const [view, setView] = useState<'lobby' | 'game'>('lobby');
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<number>(Math.floor(Math.random() * 1000));
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
      handleReturnToLobby();
    }
  }, [wasKicked]);

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
      <div className="w-[360px] h-[750px] bg-zinc-900 relative overflow-hidden border border-zinc-800 rounded-xl">
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