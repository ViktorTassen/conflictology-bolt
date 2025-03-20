import React, { useState } from 'react';
import { useGame } from './hooks/useGame';
import { GameCreation } from './components/GameCreation';
import { GameView } from './components/GameView';

function PlayerInstance({ instanceId }: { instanceId: number }) {
  const [view, setView] = useState<'lobby' | 'game'>('lobby');
  const [gameId, setGameId] = useState<string | null>(null);
  const { game } = useGame(gameId || undefined);

  const handleGameStart = (id: string) => {
    setGameId(id);
    setView('game');
  };

  return (
    <div className="w-[345px] h-[700px] bg-[#1a1a1a] relative overflow-hidden">
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
        <div className="absolute top-0 left-0 right-0 p-2 text-center bg-[#2a2a2a]/80 backdrop-blur-sm">
          <span className="text-white/80 text-sm">Player {instanceId}</span>
          {gameId && <span className="text-white/50 text-xs ml-2">Game: {gameId}</span>}
        </div>

        <div className="pt-10">
          {view === 'lobby' ? (
            <div className="p-4">
              <GameCreation onGameStart={handleGameStart} playerId={instanceId} />
            </div>
          ) : (
            <GameView gameId={gameId!} playerId={instanceId} />
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-[1200px] mx-auto">
        <h1 className="text-2xl font-bold text-white mb-8 text-center">Coup - Three Player Test</h1>
        <div className="flex gap-8 justify-center flex-wrap">
          {[1, 2, 3].map((id) => (
            <PlayerInstance key={id} instanceId={id} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;