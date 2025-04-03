import { useState, useEffect, useRef } from 'react';
import { Card } from '../types';
import backImage from '../assets/images/back-2.png';

interface InfluenceCardsProps {
  playerId: number;
  cards: Card[];
  showFaceUp?: boolean;
}

// Animation timing constants
const ANIMATION_DURATION = 2000; // 2 seconds in ms
const FADE_OUT_DURATION = ANIMATION_DURATION / 2;
const FADE_IN_DURATION = ANIMATION_DURATION / 2;

export function InfluenceCards({ playerId, cards, showFaceUp = false }: InfluenceCardsProps) {
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
  
  // Keep track of previous cards for animation
  const [previousCards, setPreviousCards] = useState<Card[]>([]);
  const [animatingPositions, setAnimatingPositions] = useState<number[]>([]);
  const cardMapRef = useRef(new Map<number, string>());
  
  // Detect card replacements
  useEffect(() => {
    // Create a map of the current cards by position for easy lookup
    const currentCardMap = new Map<number, string>();
    sortedPlayerCards.forEach(card => {
      if (card.position !== null) {
        currentCardMap.set(card.position, card.id);
      }
    });
    
    // Check for replaced cards (same position, different card ID)
    const replacedPositions: number[] = [];
    previousCards.forEach(prevCard => {
      if (prevCard.position !== null) {
        const currentCardId = currentCardMap.get(prevCard.position);
        if (currentCardId && currentCardId !== prevCard.id) {
          replacedPositions.push(prevCard.position);
        }
      }
    });
    
    if (replacedPositions.length > 0) {
      // Start animation for replaced positions
      setAnimatingPositions(replacedPositions);
      
      // Keep track of cards before replacement
      const prevCardMap = new Map<number, string>();
      previousCards.forEach(card => {
        if (card.position !== null) {
          prevCardMap.set(card.position, card.id);
        }
      });
      cardMapRef.current = prevCardMap;
      
      // Clear animation after duration
      const timer = setTimeout(() => {
        setAnimatingPositions([]);
      }, ANIMATION_DURATION);
      
      return () => clearTimeout(timer);
    }
    
    // Update previous cards for next comparison
    setPreviousCards(sortedPlayerCards);
  }, [sortedPlayerCards, previousCards]);

  return (
    <div className="flex gap-1 transform -rotate-6">
      {sortedPlayerCards.map((card) => {
        // Check if this card position is being animated
        const isAnimating = card.position !== null && animatingPositions.includes(card.position);
        
        // Import dynamically from assets for face-up cards
        const cardImage = showFaceUp 
          ? new URL(`../assets/images/${card.name.toLowerCase()}.png`, import.meta.url).href
          : backImage;

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
            {/* Card with animation classes */}
            <div 
              className={`w-full h-full transition-opacity ease-in-out absolute inset-0 ${
                isAnimating 
                  ? 'animate-fadeIn opacity-0' 
                  : 'opacity-100'
              }`}
              style={{
                animationDuration: `${FADE_IN_DURATION}ms`,
                animationDelay: `${FADE_OUT_DURATION}ms`,
                animationFillMode: 'forwards'
              }}
            >
              <img
                src={cardImage}
                alt={showFaceUp ? card.name : "Card back"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.warn(`Failed to load card image: ${card.name}`);
                  // Apply a colored background with text as fallback
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  
                  // Create fallback element
                  const fallback = document.createElement('div');
                  fallback.className = 'w-full h-full bg-gray-800 flex items-center justify-center';
                  fallback.style.color = 'white';
                  fallback.style.fontWeight = 'bold';
                  fallback.style.fontSize = '14px';
                  fallback.textContent = card.name;
                  
                  // Add to parent
                  if (target.parentElement) {
                    target.parentElement.appendChild(fallback);
                  }
                }}
              />
              {showFaceUp && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent">
                  <div className="absolute bottom-1 left-1 text-white font-bold text-[10px]">
                    {card.name}
                  </div>
                </div>
              )}
            </div>
            
            {/* Outgoing card that fades out */}
            {isAnimating && (
              <div 
                className="w-full h-full absolute inset-0 animate-fadeOut opacity-100"
                style={{
                  animationDuration: `${FADE_OUT_DURATION}ms`,
                  animationFillMode: 'forwards'
                }}
              >
                <img
                  src={showFaceUp 
                    ? `${new URL(`../assets/images/${
                        previousCards.find(pc => pc.position === card.position)?.name.toLowerCase() || 'back'
                      }.png`, import.meta.url).href}`
                    : backImage}
                  alt="Previous card"
                  className="w-full h-full object-cover"
                />
                {showFaceUp && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent">
                    <div className="absolute bottom-1 left-1 text-white font-bold text-[10px]">
                      {previousCards.find(pc => pc.position === card.position)?.name}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}