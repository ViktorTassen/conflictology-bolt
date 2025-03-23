import React, { useState } from 'react';
import { Plus, Users } from 'lucide-react';
import { useGame } from '../hooks/useGame';

interface GameCreationProps {
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

const AVATARS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
];

const PLAYER_NAMES = [
  'Player',
  'Player',
  'Player',
];

export function GameCreation({ onGameStart, playerId }: GameCreationProps) {
  const { createGame, joinGame } = useGame();
  const [joiningId, setJoiningId] = useState('');
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPlayerData = () => ({
    id: playerId,
    name: `Player ${playerId % 1000}`, // Use modulo to get a smaller display number
    coins: 2,
    color: COLORS[playerId % COLORS.length],
    avatar: AVATARS[playerId % AVATARS.length]
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
    
    try {
      setError(null);
      const playerData = createPlayerData();
      await joinGame(joiningId, playerData);
      onGameStart(joiningId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join game');
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
        className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white rounded-xl p-4 flex items-center justify-between group transition-all duration-200 shadow-lg shadow-yellow-500/20"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-yellow-400/20 flex items-center justify-center">
            <Plus className="w-6 h-6" />
          </div>
          <div className="text-left">
            <div className="font-semibold text-lg">Create Game</div>
            <div className="text-sm text-yellow-200/80">Start a new game room</div>
          </div>
        </div>
      </button>

      {!showJoinInput ? (
        <button
          onClick={() => setShowJoinInput(true)}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl p-4 flex items-center justify-between group transition-all duration-200 shadow-lg shadow-blue-500/20"
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
              className="flex-1 bg-blue-500 hover:bg-blue-400 text-white rounded-lg py-2 transition-colors"
            >
              Join
            </button>
            <button
              onClick={() => {
                setShowJoinInput(false);
                setError(null);
                setJoiningId('');
              }}
              className="flex-1 bg-[#1a1a1a] hover:bg-[#333333] text-white rounded-lg py-2 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}