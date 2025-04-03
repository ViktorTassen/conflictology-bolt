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
  
  // Use refs to track previous cards without causing re-renders
  const previousCardsRef = useRef<Card[]>([]);
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [animationState, setAnimationState] = useState<{
    animatingPositions: number[],
    outgoingCards: Map<number, Card>
  }>({
    animatingPositions: [],
    outgoingCards: new Map()
  });
  
  // Detect card replacements - runs only once on mount and when sortedPlayerCards changes
  useEffect(() => {
    // Skip the first render when previousCardsRef is empty
    if (previousCardsRef.current.length === 0) {
      previousCardsRef.current = [...sortedPlayerCards];
      return;
    }
    
    // Create a map of the current cards by position for easy lookup
    const currentCardMap = new Map<number, string>();
    sortedPlayerCards.forEach(card => {
      if (card.position !== null) {
        currentCardMap.set(card.position, card.id);
      }
    });
    
    // Create map of previous cards by position for comparison
    const prevCardsByPosition = new Map<number, Card>();
    previousCardsRef.current.forEach(card => {
      if (card.position !== null) {
        prevCardsByPosition.set(card.position, card);
      }
    });
    
    // Check for replaced cards (same position, different card ID)
    const replacedPositions: number[] = [];
    const newOutgoingCards = new Map<number, Card>();
    
    // Compare previous cards to current cards
    Array.from(prevCardsByPosition.entries()).forEach(([position, prevCard]) => {
      const currentCardId = currentCardMap.get(position);
      if (currentCardId && currentCardId !== prevCard.id) {
        replacedPositions.push(position);
        newOutgoingCards.set(position, prevCard);
      }
    });
    
    // Only update state if there are replaced positions
    if (replacedPositions.length > 0) {
      // Start animation for replaced positions
      setAnimationState({
        animatingPositions: replacedPositions,
        outgoingCards: newOutgoingCards
      });
      
      // Clear previous timer if it exists
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
      
      // Clear animation after duration
      animationTimerRef.current = setTimeout(() => {
        setAnimationState(prev => ({
          ...prev,
          animatingPositions: []
        }));
        animationTimerRef.current = null;
      }, ANIMATION_DURATION);
    }
    
    // Update previous cards ref for next comparison
    previousCardsRef.current = [...sortedPlayerCards];
    
    // Clean up animation timer on unmount
    return () => {
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
    };
  }, [sortedPlayerCards]);

  return (
    <div className="flex gap-1 transform -rotate-6">
      {sortedPlayerCards.map((card) => {
        // Check if this card position is being animated
        const isAnimating = card.position !== null && animationState.animatingPositions.includes(card.position);
        
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
                  src={showFaceUp && card.position !== null && animationState.outgoingCards.has(card.position)
                    ? `${new URL(`../assets/images/${
                        animationState.outgoingCards.get(card.position)?.name.toLowerCase() || 'back'
                      }.png`, import.meta.url).href}`
                    : backImage}
                  alt="Previous card"
                  className="w-full h-full object-cover"
                />
                {showFaceUp && card.position !== null && animationState.outgoingCards.has(card.position) && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent">
                    <div className="absolute bottom-1 left-1 text-white font-bold text-[10px]">
                      {animationState.outgoingCards.get(card.position)?.name}
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