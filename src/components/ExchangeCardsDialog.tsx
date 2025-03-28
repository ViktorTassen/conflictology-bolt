import React, { useState } from 'react';
import { CardType, Card } from '../types';
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
  cards: Card[];
  playerId: number;
  exchangeCardIds: string[];
  onExchangeComplete: (selectedIndices: number[]) => void;
}

export function ExchangeCardsDialog({ 
  cards,
  playerId,
  exchangeCardIds,
  onExchangeComplete 
}: ExchangeCardsDialogProps) {
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  
  // Get player's active cards and exchange cards
  console.log('Exchange dialog - playerId:', playerId);
  console.log('Exchange dialog - cards:', cards.map(c => ({ 
    id: c.id, 
    name: c.name, 
    playerId: c.playerId, 
    location: c.location, 
    revealed: c.revealed 
  })));
  console.log('Exchange dialog - exchangeCardIds:', exchangeCardIds);
  
  // Filter for cards belonging to the player who initiated the exchange (playerId)
  // In this component, playerId is the player's index from game.actionInProgress.player
  const playerCards = cards.filter(c => 
    c.playerId === playerId && 
    c.location === 'player' && 
    !c.revealed
  );
  
  // If we don't find any player cards but we have exchange cards,
  // this might be an edge case where the player's cards aren't properly assigned
  if (playerCards.length === 0 && exchangeCardIds.length > 0) {
    console.warn('No player cards found for player index', playerId, 
      '- this could indicate an issue with card assignment');
  }
  
  console.log('Exchange dialog - filtered playerCards:', playerCards.map(c => ({ 
    id: c.id, 
    name: c.name, 
    playerId: c.playerId 
  })));
  
  const exchangeCards = cards.filter(c => 
    exchangeCardIds.includes(c.id)
  );
  
  console.log('Exchange dialog - filtered exchangeCards:', exchangeCards.map(c => ({ 
    id: c.id, 
    name: c.name 
  })));
  
  // Combine all available cards
  const availableCards = [...playerCards, ...exchangeCards];
  
  // Player must select exactly the same number of cards they currently have
  const requiredSelectionCount = playerCards.length;

  const handleCardSelect = (index: number) => {
    if (selectedIndices.includes(index)) {
      // Deselect card
      setSelectedIndices(selectedIndices.filter(i => i !== index));
    } else {
      // Only allow selection if we haven't reached the required count
      if (selectedIndices.length < requiredSelectionCount) {
        setSelectedIndices([...selectedIndices, index]);
      }
    }
  };
  
  const handleConfirmSelection = () => {
    // Only allow confirmation when exactly the required number of cards are selected
    if (selectedIndices.length === requiredSelectionCount) {
      onExchangeComplete(selectedIndices);
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
              Select {requiredSelectionCount} card{requiredSelectionCount !== 1 ? 's' : ''} to keep
            </p>
          </div>

          {/* Cards - Separate into two rows */}
          <div className="mb-8 space-y-6">
            {/* Current cards row with header */}
            <div>
              <h4 className="text-white/80 text-sm font-semibold mb-3 text-center">Your Current Cards</h4>
              <div className="flex justify-center gap-3 flex-wrap">
                {playerCards.map((card, i) => {
                  const index = availableCards.findIndex(c => c.id === card.id);
                  
                  return (
                    <button
                      key={card.id}
                      onClick={() => handleCardSelect(index)}
                      className={`group relative ${selectedIndices.includes(index) ? 'ring-2 ring-blue-500' : ''}`}
                    >
                      <div className={`absolute -inset-2 rounded-xl ${selectedIndices.includes(index) ? 'bg-blue-500/30' : 'bg-blue-500/0 group-hover:bg-blue-500/20'} transition-all duration-300`} />
                      <div className="relative">
                        {/* Card */}
                        <div className="w-20 h-32 rounded-lg overflow-hidden transform transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-1">
                          <img
                            src={cardImages[card.name]}
                            alt={card.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent">
                            <div className="absolute bottom-2 left-2 text-white font-bold text-sm">
                              {card.name}
                            </div>
                          </div>
                          
                          {/* Hover overlay */}
                          <div className={`absolute inset-0 ${selectedIndices.includes(index) ? 'bg-blue-500/30' : 'bg-blue-500/0 group-hover:bg-blue-500/20'} transition-colors duration-300`} />
                        </div>

                        {/* Selection indicator */}
                        <div className={`absolute -bottom-1 inset-x-0 h-1 bg-blue-500 transform ${selectedIndices.includes(index) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'} transition-transform duration-300`} />
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
                {exchangeCards.map((card, i) => {
                  const index = availableCards.findIndex(c => c.id === card.id);
                  
                  return (
                    <button
                      key={card.id}
                      onClick={() => handleCardSelect(index)}
                      className={`group relative ${selectedIndices.includes(index) ? 'ring-2 ring-blue-500' : ''}`}
                    >
                      <div className={`absolute -inset-2 rounded-xl ${selectedIndices.includes(index) ? 'bg-blue-500/30' : 'bg-blue-500/0 group-hover:bg-blue-500/20'} transition-all duration-300`} />
                      <div className="relative">
                        {/* Card */}
                        <div className="w-20 h-32 rounded-lg overflow-hidden transform transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-1">
                          <img
                            src={cardImages[card.name]}
                            alt={card.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent">
                            <div className="absolute bottom-2 left-2 text-white font-bold text-sm">
                              {card.name}
                            </div>
                          </div>
                          
                          {/* Hover overlay */}
                          <div className={`absolute inset-0 ${selectedIndices.includes(index) ? 'bg-blue-500/30' : 'bg-blue-500/0 group-hover:bg-blue-500/20'} transition-colors duration-300`} />
                        </div>

                        {/* Selection indicator */}
                        <div className={`absolute -bottom-1 inset-x-0 h-1 bg-blue-500 transform ${selectedIndices.includes(index) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'} transition-transform duration-300`} />
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
              disabled={selectedIndices.length !== requiredSelectionCount}
              className={`
                px-6 py-2 rounded-full 
                ${selectedIndices.length === requiredSelectionCount ? 
                  'bg-blue-600 hover:bg-blue-700 text-white' : 
                  'bg-gray-700 text-gray-400 cursor-not-allowed'}
                transition-colors duration-300
              `}
            >
              Confirm Selection ({selectedIndices.length}/{requiredSelectionCount})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}