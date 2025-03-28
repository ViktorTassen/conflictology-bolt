import React from 'react';
import { Card, CardType } from '../types';
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
  cards: Card[];
  playerId: number;
  onCardSelect: (card: CardType) => void;
}

export function SelectCardForInvestigationDialog({ 
  cards,
  playerId,
  onCardSelect
}: SelectCardForInvestigationDialogProps) {
  // Get player's active (non-revealed) cards
  const playerCards = cards.filter(card => 
    card.playerId === playerId && 
    card.location === 'player' && 
    !card.revealed
  );

  if (playerCards.length === 0) return null;

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
              {playerCards.map((card, i) => (
                <button
                  key={card.id}
                  onClick={() => onCardSelect(card.name)}
                  className="group relative"
                >
                  <div className="absolute -inset-2 rounded-xl bg-purple-500/0 group-hover:bg-purple-500/20 transition-all duration-300" />
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
                      <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/20 transition-colors duration-300" />
                    </div>

                    {/* Selection indicator */}
                    <div className="absolute -bottom-1 inset-x-0 h-1 bg-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}