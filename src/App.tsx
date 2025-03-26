import React, { useState, useEffect } from 'react';
import { useGame } from './hooks/useGame';
import { MainMenu } from './components/MainMenu';
import { GameView } from './components/GameView';
import { GameLobby } from './components/GameLobby';

function App() {
  const [view, setView] = useState<'lobby' | 'game'>('lobby');
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<number>(Math.floor(Math.random() * 1000));
  const { game } = useGame(gameId || undefined);

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

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-[345px] h-[800px] bg-[#1a1a1a] relative overflow-hidden">
        <div className="absolute inset-0">
          <div 
            className="absolute top-1/2 left-1/2 w-[200%] h-[200%] lamp-light origin-center"
            style={{
              background: `
                radial-gradient(
                  circle at center,
                  rgba(255,255,255,0.15) 0%,
                  rgba(255,255,255,0.1) 5%,
                  rgba(255,255,255,0.05) 10%,
                  transparent 20%
                ),
                radial-gradient(
                  circle at center,
                  rgba(255,220,150,0.2) 0%,
                  rgba(255,220,150,0.15) 5%,
                  rgba(255,220,150,0.05) 15%,
                  transparent 25%
                ),
                radial-gradient(
                  circle at center,
                  transparent 20%,
                  rgba(0,0,0,0.6) 40%,
                  rgba(0,0,0,0.8) 60%,
                  rgba(0,0,0,0.95) 70%,
                  rgb(0,0,0) 100%
                )
              `,
              transform: 'translate(-50%, -50%)',
            }}
          />
          <div 
            className="absolute inset-0 opacity-60" 
            style={{
              background: `
                radial-gradient(
                  circle at 50% 40%,
                  rgba(255,220,150,0.1) 0%,
                  transparent 40%
                )
              `
            }}
          />
        </div>

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