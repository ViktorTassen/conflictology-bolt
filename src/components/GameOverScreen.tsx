import React, { useState, useEffect } from 'react';
import { Trophy, ThumbsUp, Clock } from 'lucide-react';
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
  currentPlayerId, 
  onVoteNextMatch,
  onLeaveGame 
}: GameOverScreenProps) {
  const [hasVoted, setHasVoted] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  
  // Find the winner (either by the winner field or by finding the last player standing)
  const winnerIndex = game.winner !== undefined ? game.winner : game.players.findIndex(p => !p.eliminated);
  const winner = winnerIndex !== -1 ? game.players[winnerIndex] : undefined;
  const isCurrentPlayerWinner = winner?.id === currentPlayerId;
  
  // Get the vote count
  const voteCount = Object.keys(game.voteNextMatch || {}).length;
  const totalPlayers = game.players.length;
  
  // Timer for new game
  const [countdown, setCountdown] = useState<number | null>(null);
  
  // Run confetti once on mount
  useEffect(() => {
    // Check if current player has already voted
    if (game.voteNextMatch && game.voteNextMatch[currentPlayerId]) {
      setHasVoted(true);
    }
    
    // Fade in animation
    const timer = setTimeout(() => setFadeIn(true), 100);
    
    // Always run confetti for all players - force it to run separately in each view
    // We're using Math.random to give each client a unique animation

    // Different colors for winners and non-winners
    const colors = [
      isCurrentPlayerWinner ? '#FFD700' : winner?.color || '#FFFFFF', // Gold for winner, winner color for others
      '#FFFFFF',
      isCurrentPlayerWinner ? winner?.color || '#FFFFFF' : '#FFD700' // Mix the colors
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
    
    return () => clearTimeout(timer);
  }, []);
  
  // Check for redirect or match start
  const [redirecting, setRedirecting] = useState(false);
  const [startingNewMatch, setStartingNewMatch] = useState(false);
  
  useEffect(() => {
    // Check if we're redirecting to lobby
    if (game.redirectToLobby) {
      setRedirecting(true);
    }
    
    // Check if we're starting a new match
    if (game.newMatchCountdownStarted) {
      setStartingNewMatch(true);
    }
    
    // No need for a countdown since we start immediately
    setCountdown(null);
  }, [game.redirectToLobby, game.newMatchCountdownStarted]);
  
  const handleVote = () => {
    setHasVoted(true);
    onVoteNextMatch();
  };
  
  return (
    <div className={`absolute inset-0 h-full w-full bg-black/90 backdrop-blur-md z-10 flex flex-col items-center justify-center p-6 transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
      {/* Simplified winner announcement with trophy in separate row */}
      <div className="mb-6 text-center">
        <div className="mb-3">
          <Trophy className="w-10 h-10 text-yellow-400 mx-auto animate-bounce-slow" />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-2 animate-in slide-in-from-top">
          {isCurrentPlayerWinner ? 'You won!' : `${winner?.name} wins!`}
        </h1>
        
        <p className="text-gray-300 animate-in slide-in-from-top" style={{ animationDelay: '100ms' }}>
          Game Over – New Order Prevails
        </p>
      </div>
      
      {/* Voting section */}
      <div className="bg-[#2a2a2a]/80 backdrop-blur-sm rounded-xl p-4 w-full max-w-xs animate-in slide-in-from-bottom" style={{ animationDelay: '300ms' }}>
        <div className="text-center mb-3">
          <h3 className="text-white font-semibold text-lg">Next Match</h3>
        </div>
        
        {/* Simple vote counter - no player circles */}
        <div className="mb-4 flex justify-center">
          <div className="bg-black/20 rounded-full px-4 py-2 flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-white/80 font-bold text-lg">
                {voteCount}/{totalPlayers}
              </span>
            </div>
            <span className="text-gray-400">players ready</span>
          </div>
        </div>
        
        {/* Voting buttons or status messages */}
        {redirecting ? (
          <div className="py-3 text-center animate-in fade-in">
            <div className="text-amber-400 mb-2">Not enough players to start a new match</div>
            <p className="text-sm text-gray-300">Redirecting to lobby...</p>
          </div>
        ) : startingNewMatch ? (
          <div className="py-3 text-center animate-in fade-in">
            <div className="text-green-400 mb-2">All players voted to play again</div>
            <p className="text-sm text-gray-300">Starting new match...</p>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-1.5 transition-all ${
                hasVoted 
                  ? 'bg-green-500/20 text-green-300 ring-1 ring-green-500/30'
                  : 'bg-gradient-to-br from-amber-500 to-amber-600 text-white hover:from-amber-400 hover:to-amber-500 shadow-lg'
              }`}
              onClick={handleVote}
              disabled={hasVoted}
            >
              {hasVoted ? (
                <>
                  <ThumbsUp className="w-4 h-4" />
                  Voted
                </>
              ) : (
                <>
                  <ThumbsUp className="w-4 h-4" />
                  Vote to Play
                </>
              )}
            </button>
            
            <button
              className="py-2.5 px-3 rounded-lg font-medium text-sm bg-white/5 hover:bg-white/10 text-white/70 transition-all border border-white/10"
              onClick={onLeaveGame}
            >
              Leave
            </button>
          </div>
        )}
        
        {/* Message about voting requirements */}
        {!redirecting && !startingNewMatch && (
          <div className="mt-3 text-center text-xs text-gray-400">
            All players must vote to start a new match.<br />
            At least 3 players required.
          </div>
        )}
      </div>
      
    </div>
  );
}