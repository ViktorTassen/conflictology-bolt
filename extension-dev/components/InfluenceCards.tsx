import { useEffect, useRef, useState } from 'react';
import { Card } from '../types';

// Import all card images statically to work in both dev and production
import bankerImage from '../images/banker.png';
import hackerImage from '../images/hacker.png';
import judgeImage from '../images/judge.png';
import mafiaImage from '../images/mafia.png';
import policeImage from '../images/police.png';
import reporterImage from '../images/reporter.png';
import backImage from '../images/back-2.png';

// Card image map for quick lookup
const cardImages = {
  banker: bankerImage,
  hacker: hackerImage,
  judge: judgeImage,
  mafia: mafiaImage,
  police: policeImage,
  reporter: reporterImage,
  back: backImage
};

interface InfluenceCardsProps {
  playerId: number;
  cards: Card[];
}

export function InfluenceCards({ playerId, cards }: InfluenceCardsProps) {
  // Get player's active (non-revealed) cards
  const playerCards = cards.filter(card => 
    card.playerId === playerId && 
    card.location === 'player' && 
    !card.revealed
  );

  // Sort cards by position to ensure consistent display
  const sortedPlayerCards = [...playerCards].sort((a, b) => {
    // Handle null positions (should not happen for player cards)
    if (a.position === null || b.position === null) return 0;
    return a.position - b.position;
  });
  
  // Track which positions changed
  const [changedPositions, setChangedPositions] = useState<number[]>([]);
  
  // Use ref to track previous card IDs without causing re-renders
  const previousCardIdsRef = useRef<Map<number, string>>(new Map());
  const animationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Effect to track card changes and trigger animations
  useEffect(() => {
    // Skip if first render
    if (previousCardIdsRef.current.size === 0) {
      // Initialize with current cards
      const initialCardIds = new Map<number, string>();
      sortedPlayerCards.forEach(card => {
        if (card.position !== null) {
          initialCardIds.set(card.position, card.id);
        }
      });
      previousCardIdsRef.current = initialCardIds;
      return;
    }
    
    // Create current map for comparison
    const currentCardIds = new Map<number, string>();
    sortedPlayerCards.forEach(card => {
      if (card.position !== null) {
        currentCardIds.set(card.position, card.id);
      }
    });
    
    // Detect changed positions
    const positionsChanged: number[] = [];
    for (const [position, currentId] of currentCardIds.entries()) {
      const previousId = previousCardIdsRef.current.get(position);
      if (previousId && previousId !== currentId) {
        positionsChanged.push(position);
      }
    }
    
    // If positions changed, trigger animation
    if (positionsChanged.length > 0) {
      console.log('Cards changed at positions:', positionsChanged);
      
      // Set changed positions to trigger animation
      setChangedPositions(positionsChanged);
      
      // Clear any existing timer
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
      
      // Reset changed positions after animation completes
      animationTimerRef.current = setTimeout(() => {
        setChangedPositions([]);
        animationTimerRef.current = null;
      }, 500); // Match animation duration
    }
    
    // Update previous card IDs for next comparison
    previousCardIdsRef.current = currentCardIds;
    
    // Clean up on unmount
    return () => {
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
    };
  }, [sortedPlayerCards]);

  return (
    <div className="flex gap-1 transform -rotate-6">
      {sortedPlayerCards.map((card) => {
        // Check if this card position has changed
        const hasChanged = card.position !== null && changedPositions.includes(card.position);
        
        // Get card image from the imported images map
        const cardImage = cardImages[card.name.toLowerCase() as keyof typeof cardImages];
        
        return (
          <div
            key={card.id}
            className={`w-[75px] h-[105px] rounded-md overflow-hidden transform ${
              card.position === 1 ? 'rotate-6' : ''
            } relative`}
            style={{
              boxShadow: '0 0 20px rgba(0,0,0,0.3)',
            }}
          >
            {/* Display card with animation when it changes */}
            <div 
              className={`w-full h-full overflow-hidden`}
            >
              <img
                src={cardImage}
                alt={card.name}
                className={`w-full h-full object-cover ${hasChanged ? 'animate-cardFromTop' : ''}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}