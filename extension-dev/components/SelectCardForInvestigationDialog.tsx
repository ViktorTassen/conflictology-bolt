import { Card, CardType } from '../types';
import { Eye, LoaderPinwheel } from 'lucide-react';
import { useState } from 'react';

// Import card images
import bankerImg from '../images/banker.png';
import hackerImg from '../images/hacker.png';
import mafiaImg from '../images/mafia.png';
import judgeImg from '../images/judge.png';
import reporterImg from '../images/reporter.png';
import policeImg from '../images/police.png';

// Card image mapping
const cardImages: Record<CardType, string> = {
  'Banker': bankerImg,
  'Hacker': hackerImg,
  'Mafia': mafiaImg,
  'Judge': judgeImg,
  'Reporter': reporterImg,
  'Police': policeImg
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
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Get player's active (non-revealed) cards
  const playerCards = cards.filter(card => 
    card.playerId === playerId && 
    card.location === 'player' && 
    !card.revealed
  );

  if (playerCards.length === 0) return null;

  const handleCardSelect = async (card: Card) => {
    if (isProcessing) return;
    
    setSelectedCardId(card.id);
    setIsProcessing(true);
    
    try {
      await onCardSelect(card.name);
    } catch (error) {
      console.error('Failed to select card for investigation:', error);
      setIsProcessing(false);
      setSelectedCardId(null);
    }
  };

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
              Choose one of your cards to show the Police
            </p>
          </div>

          {/* Cards */}
          <div className="mb-8">
            <div className="flex justify-center gap-3 flex-wrap">
              {playerCards.map((card) => {
                const isSelected = card.id === selectedCardId;
                const isDisabled = isProcessing && !isSelected;
                
                return (
                  <button
                    key={card.id}
                    onClick={() => handleCardSelect(card)}
                    disabled={isDisabled}
                    className={`group relative ${isDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    <div className={`
                      absolute -inset-2 rounded-xl 
                      ${isSelected ? 'bg-purple-500/40' : 'bg-purple-500/0 group-hover:bg-purple-500/20'} 
                      transition-all duration-300
                    `} />
                    <div className="relative">
                      {/* Card */}
                      <div className={`
                        w-20 h-32 rounded-lg overflow-hidden 
                        transform transition-all duration-300
                        ${isSelected ? 'scale-105 -translate-y-1' : 'group-hover:scale-105 group-hover:-translate-y-1'}
                      `}>
                        <img
                          src={cardImages[card.name]}
                          alt={card.name}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Hover/Selected overlay */}
                        <div className={`
                          absolute inset-0 
                          ${isSelected ? 'bg-purple-500/30' : 'bg-purple-500/0 group-hover:bg-purple-500/20'} 
                          transition-colors duration-300
                        `} />
                        
                        {/* Loading spinner overlay */}
                        {isSelected && isProcessing && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <LoaderPinwheel className="w-8 h-8 text-white animate-spin" />
                          </div>
                        )}
                      </div>

                      {/* Selection indicator */}
                      <div className={`
                        absolute -bottom-1 inset-x-0 h-1 bg-purple-500 transform 
                        ${isSelected ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'} 
                        transition-transform duration-300
                      `} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}