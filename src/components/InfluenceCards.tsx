import { Card } from '../types';
import backImage from '../assets/images/back-2.png';

interface InfluenceCardsProps {
  playerId: number;
  cards: Card[];
  showFaceUp?: boolean;
}

export function InfluenceCards({ playerId, cards, showFaceUp = false }: InfluenceCardsProps) {
  // Get player's active (non-revealed) cards
  const playerCards = cards.filter(card => 
    card.playerId === playerId && 
    card.location === 'player' && 
    !card.revealed
  );

  return (
    <div className="flex gap-1 transform -rotate-6">
      {playerCards.map((card, index) => {
        // Import dynamically from assets for face-up cards
        const cardImage = showFaceUp 
          ? new URL(`../assets/images/${card.name.toLowerCase()}.png`, import.meta.url).href
          : backImage;

        return (
          <div
            key={card.id}
            className={`w-[75px] h-[105px] rounded-md overflow-hidden transform ${
              index === 1 ? 'rotate-6' : ''
            }`}
            style={{
              boxShadow: '0 0 20px rgba(0,0,0,0.3)',
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
        );
      })}
    </div>
  );
}