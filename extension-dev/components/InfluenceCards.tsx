import { useEffect, useRef } from 'react';
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
  
  // Use ref to track previous card IDs without causing re-renders
  const previousCardIdsRef = useRef<Map<number, string>>(new Map());
  
  // Effect to track card changes without animations
  useEffect(() => {
    // Create current map for next comparison
    const currentCardIds = new Map<number, string>();
    sortedPlayerCards.forEach(card => {
      if (card.position !== null) {
        currentCardIds.set(card.position, card.id);
      }
    });
    
    // Update previous ref for next comparison
    previousCardIdsRef.current = currentCardIds;
  }, [sortedPlayerCards]);

  return (
    <div className="flex gap-1 transform -rotate-6">
      {sortedPlayerCards.map((card) => {
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
            {/* Simply display the current card without animation */}
            <div className="w-full h-full">
              <img
                src={cardImage}
                alt={card.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}