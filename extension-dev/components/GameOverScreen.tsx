import { useEffect } from 'react';
import { Game } from '../types';
import confetti from 'canvas-confetti';

interface GameOverScreenProps {
  game: Game;
  currentPlayerId: number;
  onVoteNextMatch: () => void;
  onLeaveGame: () => void;
}

export function GameOverScreen({ 
  game, 
  currentPlayerId
}: GameOverScreenProps) {
  // Find the winner (either by the winner field or by finding the last player standing)
  const winnerIndex = game.winner !== undefined ? game.winner : game.players.findIndex(p => !p.eliminated);
  const winner = winnerIndex !== -1 ? game.players[winnerIndex] : undefined;
  const isCurrentPlayerWinner = winner?.id === currentPlayerId;
  
  // Run confetti once on mount, then automatically transition
  useEffect(() => {
    // Different colors for winners and non-winners
    const colors = [
      '#bb0000', '#ffffff', "#0000bb"
    ];
    
    // Fire a burst of confetti - will appear differently in each client
    setTimeout(() => {
      // Left side
      confetti({
        particleCount: isCurrentPlayerWinner ? 40 : 20,
        angle: 60,
        spread: 55,
        origin: { x: Math.random() * 0.3, y: Math.random() * 0.3 },
        colors: colors,
        startVelocity: 30 + Math.random() * 20
      });
      
      // Right side
      confetti({
        particleCount: isCurrentPlayerWinner ? 40 : 20,
        angle: 120,
        spread: 55,
        origin: { x: 0.7 + Math.random() * 0.3, y: Math.random() * 0.3 },
        colors: colors,
        startVelocity: 30 + Math.random() * 20
      });
    }, 300);
  }, []);
  
  // This is now a transparent component that just shows confetti
  // The actual winner announcement will be shown in the GameLobby
  return null;
}