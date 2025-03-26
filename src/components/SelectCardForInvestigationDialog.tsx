import React, { useState } from 'react';
import { CardType, Influence } from '../types';
import { Eye } from 'lucide-react';

// Import card images
import dukeImg from '../assets/images/duke.png';
import assassinImg from '../assets/images/assassin.png';
import captainImg from '../assets/images/captain.png';
import contessaImg from '../assets/images/contessa.png';
import ambassadorImg from '../assets/images/ambassador.png';
import inquisitorImg from '../assets/images/inquisitor.png';

// Card image mapping
const cardImages: Record<CardType, string> = {
  'Duke': dukeImg,
  'Assassin': assassinImg,
  'Captain': captainImg,
  'Contessa': contessaImg,
  'Ambassador': ambassadorImg,
  'Inquisitor': inquisitorImg
};

interface SelectCardForInvestigationDialogProps {
  playerInfluence: Influence[];
  onCardSelect: (card: CardType) => void;
}

export function SelectCardForInvestigationDialog({ 
  playerInfluence, 
  onCardSelect
}: SelectCardForInvestigationDialogProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  
  // Create an array of non-revealed influence cards with their indices
  const availableInfluence = playerInfluence
    .map((infl, index) => ({ infl, index }))
    .filter(item => !item.infl.revealed);

  const handleCardSelect = (index: number) => {
    setSelectedIndex(index);
  };
  
  const handleConfirmSelection = () => {
    if (selectedIndex !== null) {
      const selectedCard = playerInfluence[selectedIndex].card;
      onCardSelect(selectedCard);
    }
  };

  if (availableInfluence.length === 0) return null;

  return (
    <div className="absolute inset-x-0 bottom-0 z-50 animate-in fade-in slide-in-from-bottom-4">
      <div className="relative">
        {/* Background blur and gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent backdrop-blur-md" />
        
        {/* Content */}
        <div className="relative px-6 pt-12 pb-6">
          {/* Investigation icon */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-6">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center animate-pulse">
              <Eye className="w-6 h-6 text-purple-500" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-white mb-1">Select Card for Investigation</h3>
            <p className="text-purple-400/80 text-sm">
              Choose one of your cards to show the Inquisitor
            </p>
          </div>

          {/* Cards */}
          <div className="mb-8">
            <div className="flex justify-center gap-3 flex-wrap">
              {availableInfluence.map((item, i) => {
                const card = item.infl.card;
                const originalIndex = item.index;
                
                return (
                  <button
                    key={`card-${originalIndex}`}
                    onClick={() => handleCardSelect(originalIndex)}
                    className={`group relative ${selectedIndex === originalIndex ? 'ring-2 ring-purple-500' : ''}`}
                  >
                    <div className={`absolute -inset-2 rounded-xl ${selectedIndex === originalIndex ? 'bg-purple-500/30' : 'bg-purple-500/0 group-hover:bg-purple-500/20'} transition-all duration-300`} />
                    <div className="relative">
                      {/* Card */}
                      <div className="w-20 h-32 rounded-lg overflow-hidden transform transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-1">
                        <img
                          src={cardImages[card]}
                          alt={card}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent">
                          <div className="absolute bottom-2 left-2 text-white font-bold text-sm">
                            {card}
                          </div>
                          <div className="absolute top-2 right-2 text-white/70 text-xs">
                            Card {i+1}
                          </div>
                        </div>
                        
                        {/* Hover overlay */}
                        <div className={`absolute inset-0 ${selectedIndex === originalIndex ? 'bg-purple-500/30' : 'bg-purple-500/0 group-hover:bg-purple-500/20'} transition-colors duration-300`} />
                      </div>

                      {/* Selection indicator */}
                      <div className={`absolute -bottom-1 inset-x-0 h-1 bg-purple-500 transform ${selectedIndex === originalIndex ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'} transition-transform duration-300`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Confirm button */}
          <div className="flex justify-center">
            <button
              onClick={handleConfirmSelection}
              disabled={selectedIndex === null}
              className={`
                px-6 py-2 rounded-full 
                ${selectedIndex !== null ? 
                  'bg-purple-600 hover:bg-purple-700 text-white' : 
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