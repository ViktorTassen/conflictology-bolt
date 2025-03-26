import React, { useState } from 'react';
import { CardType, Influence } from '../types';
import { Shuffle } from 'lucide-react';

// Import card images
import ambassadorImg from '../assets/images/ambassador.png';
import assassinImg from '../assets/images/assassin.png';
import captainImg from '../assets/images/captain.png';
import contessaImg from '../assets/images/contessa.png';
import dukeImg from '../assets/images/duke.png';
import inquisitorImg from '../assets/images/inquisitor.png';

// Card image mapping
const cardImages: Record<CardType, string> = {
  'Ambassador': ambassadorImg,
  'Assassin': assassinImg,
  'Captain': captainImg,
  'Contessa': contessaImg,
  'Duke': dukeImg,
  'Inquisitor': inquisitorImg
};

interface ExchangeCardsDialogProps {
  playerInfluence: Influence[];
  drawnCards: CardType[];
  onExchangeComplete: (keptIndices: number[]) => void;
}

export function ExchangeCardsDialog({ 
  playerInfluence, 
  drawnCards, 
  onExchangeComplete 
}: ExchangeCardsDialogProps) {
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  
  // Count active (not revealed) player cards
  const activeCardCount = playerInfluence.filter(card => !card.revealed).length;

  // Combine player's active cards with drawn cards for selection
  const availableCards: { 
    card: CardType; 
    isPlayerCard: boolean;
    originalIndex: number;
  }[] = [
    // Player's cards
    ...playerInfluence
      .map((infl, idx) => ({ 
        card: infl.card, 
        isPlayerCard: true,
        revealed: infl.revealed,
        originalIndex: idx
      }))
      .filter(card => !card.revealed),
      
    // Drawn cards from deck
    ...drawnCards.map((card, idx) => ({ 
      card, 
      isPlayerCard: false,
      revealed: false,
      originalIndex: idx
    }))
  ];
  
  const handleCardSelect = (index: number) => {
    if (selectedCards.includes(index)) {
      // Deselect the card
      setSelectedCards(selectedCards.filter(i => i !== index));
    } else {
      // Check if we've already selected the required number of cards
      if (selectedCards.length < activeCardCount) {
        setSelectedCards([...selectedCards, index]);
      }
    }
  };
  
  const handleConfirmSelection = () => {
    if (selectedCards.length === activeCardCount) {
      onExchangeComplete(selectedCards);
    }
  };

  if (availableCards.length === 0) return null;

  return (
    <div className="absolute inset-x-0 bottom-0 z-50 animate-in fade-in slide-in-from-bottom-4">
      <div className="relative">
        {/* Background blur and gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent backdrop-blur-md" />
        
        {/* Content */}
        <div className="relative px-6 pt-12 pb-6">
          {/* Exchange icon */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-6">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center animate-pulse">
              <Shuffle className="w-6 h-6 text-blue-500" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-white mb-1">Exchange Cards</h3>
            <p className="text-blue-400/80 text-sm">
              Select {activeCardCount} card{activeCardCount !== 1 ? 's' : ''} to keep
            </p>
          </div>

          {/* Cards - Separate into two rows */}
          <div className="mb-8 space-y-6">
            {/* Current cards row with header */}
            <div>
              <h4 className="text-white/80 text-sm font-semibold mb-3 text-center">Your Current Cards</h4>
              <div className="flex justify-center gap-3 flex-wrap">
                {availableCards
                  .filter(card => card.isPlayerCard)
                  .map((cardInfo, i) => {
                    // Calculate the actual index in the combined array
                    const index = availableCards.findIndex(c => 
                      c.isPlayerCard && c.originalIndex === cardInfo.originalIndex
                    );
                    
                    return (
                      <button
                        key={`current-${i}`}
                        onClick={() => handleCardSelect(index)}
                        className={`group relative ${selectedCards.includes(index) ? 'ring-2 ring-blue-500' : ''}`}
                      >
                        <div className={`absolute -inset-2 rounded-xl ${selectedCards.includes(index) ? 'bg-blue-500/30' : 'bg-blue-500/0 group-hover:bg-blue-500/20'} transition-all duration-300`} />
                        <div className="relative">
                          {/* Card */}
                          <div className="w-20 h-32 rounded-lg overflow-hidden transform transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-1">
                            <img
                              src={cardImages[cardInfo.card]}
                              alt={cardInfo.card}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent">
                              <div className="absolute bottom-2 left-2 text-white font-bold text-sm">
                                {cardInfo.card}
                              </div>
                              <div className="absolute top-2 right-2 text-white/70 text-xs">
                                Current
                              </div>
                            </div>
                            
                            {/* Hover overlay */}
                            <div className={`absolute inset-0 ${selectedCards.includes(index) ? 'bg-blue-500/30' : 'bg-blue-500/0 group-hover:bg-blue-500/20'} transition-colors duration-300`} />
                          </div>

                          {/* Selection indicator */}
                          <div className={`absolute -bottom-1 inset-x-0 h-1 bg-blue-500 transform ${selectedCards.includes(index) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'} transition-transform duration-300`} />
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
            
            {/* New drawn cards row with header */}
            <div>
              <h4 className="text-white/80 text-sm font-semibold mb-3 text-center">New Cards From Deck</h4>
              <div className="flex justify-center gap-3 flex-wrap">
                {availableCards
                  .filter(card => !card.isPlayerCard)
                  .map((cardInfo, i) => {
                    // Calculate the actual index in the combined array
                    const index = availableCards.findIndex(c => 
                      !c.isPlayerCard && c.originalIndex === cardInfo.originalIndex
                    );
                    
                    return (
                      <button
                        key={`drawn-${i}`}
                        onClick={() => handleCardSelect(index)}
                        className={`group relative ${selectedCards.includes(index) ? 'ring-2 ring-blue-500' : ''}`}
                      >
                        <div className={`absolute -inset-2 rounded-xl ${selectedCards.includes(index) ? 'bg-blue-500/30' : 'bg-blue-500/0 group-hover:bg-blue-500/20'} transition-all duration-300`} />
                        <div className="relative">
                          {/* Card */}
                          <div className="w-20 h-32 rounded-lg overflow-hidden transform transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-1">
                            <img
                              src={cardImages[cardInfo.card]}
                              alt={cardInfo.card}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent">
                              <div className="absolute bottom-2 left-2 text-white font-bold text-sm">
                                {cardInfo.card}
                              </div>
                              <div className="absolute top-2 right-2 text-blue-400/70 text-xs">
                                New
                              </div>
                            </div>
                            
                            {/* Hover overlay */}
                            <div className={`absolute inset-0 ${selectedCards.includes(index) ? 'bg-blue-500/30' : 'bg-blue-500/0 group-hover:bg-blue-500/20'} transition-colors duration-300`} />
                          </div>

                          {/* Selection indicator */}
                          <div className={`absolute -bottom-1 inset-x-0 h-1 bg-blue-500 transform ${selectedCards.includes(index) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'} transition-transform duration-300`} />
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
          
          {/* Confirm button */}
          <div className="flex justify-center">
            <button
              onClick={handleConfirmSelection}
              disabled={selectedCards.length !== activeCardCount}
              className={`
                px-6 py-2 rounded-full 
                ${selectedCards.length === activeCardCount ? 
                  'bg-blue-600 hover:bg-blue-700 text-white' : 
                  'bg-gray-700 text-gray-400 cursor-not-allowed'}
                transition-colors duration-300
              `}
            >
              Confirm Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}