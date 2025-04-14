import { useState } from 'react';
import { CardType, Card } from '../types';
import { Shuffle, LoaderPinwheel } from 'lucide-react';
import { cardService } from '../services/CardService';

// Import card images
import reporterImg from '../images/reporter.png';
import hackerImg from '../images/hacker.png';
import mafiaImg from '../images/mafia.png';
import judgeImg from '../images/judge.png';
import bankerImg from '../images/banker.png';
import policeImg from '../images/police.png';

// Card image mapping
const cardImages: Record<CardType, string> = {
  'Reporter': reporterImg,
  'Hacker': hackerImg,
  'Mafia': mafiaImg,
  'Judge': judgeImg,
  'Banker': bankerImg,
  'Police': policeImg
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
  const [isProcessing, setIsProcessing] = useState(false);
  
  const playerCards = cardService.getPlayerCards(cards, playerId);
  
  const exchangeCards = cards.filter(c => 
    exchangeCardIds.includes(c.id)
  );
  
  const availableCards = [...playerCards, ...exchangeCards];
  const requiredSelectionCount = playerCards.length;

  const handleCardSelect = (index: number) => {
    if (isProcessing) return;
    
    if (selectedIndices.includes(index)) {
      setSelectedIndices(selectedIndices.filter(i => i !== index));
    } else {
      if (selectedIndices.length < requiredSelectionCount) {
        setSelectedIndices([...selectedIndices, index]);
      }
    }
  };
  
  const handleConfirmSelection = async () => {
    if (selectedIndices.length !== requiredSelectionCount || isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      await onExchangeComplete(selectedIndices);
    } catch (error) {
      console.error('Failed to complete exchange:', error);
      setIsProcessing(false);
    }
  };

  if (availableCards.length === 0) return null;

  return (
    <div className="absolute inset-x-0 bottom-0 z-50 animate-in fade-in slide-in-from-bottom-4">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent backdrop-blur-md" />
        
        <div className="relative px-6 pt-12 pb-6">
          <div className="absolute left-1/2 -translate-x-1/2 -top-6">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center animate-pulse">
              <Shuffle className="w-6 h-6 text-blue-500" />
            </div>
          </div>

          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-white mb-1">Exchange Cards</h3>
            <p className="text-blue-400/80 text-sm">
              Select {requiredSelectionCount} card{requiredSelectionCount !== 1 ? 's' : ''} to keep
            </p>
          </div>

          <div className="mb-8 space-y-6">
            <div>
              <h4 className="text-white/80 text-sm font-semibold mb-3 text-center">Your Current Cards</h4>
              <div className="flex justify-center gap-3 flex-wrap">
                {playerCards.map((card) => {
                  const index = availableCards.findIndex(c => c.id === card.id);
                  const isSelected = selectedIndices.includes(index);
                  const isDisabled = isProcessing && !isSelected;
                  
                  return (
                    <button
                      key={card.id}
                      onClick={() => handleCardSelect(index)}
                      disabled={isDisabled || isProcessing}
                      className={`
                        group relative 
                        ${isSelected ? 'ring-2 ring-blue-500' : ''} 
                        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                        
                      `}
                    >
                      <div className={`
                        absolute -inset-2 rounded-xl 
                        ${isSelected ? 'bg-blue-500/30' : 'bg-blue-500/0 group-hover:bg-blue-500/20'} 
                        transition-all duration-300
                      `} />
                      <div className="relative">
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
                          
                          <div className={`
                            absolute inset-0 
                            ${isSelected ? 'bg-blue-500/30' : 'bg-blue-500/0 group-hover:bg-blue-500/20'} 
                            transition-colors duration-300
                          `} />
                        </div>

                        <div className={`
                          absolute -bottom-1 inset-x-0 h-1 bg-blue-500 transform 
                          ${isSelected ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'} 
                          transition-transform duration-300
                        `} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div>
              <h4 className="text-white/80 text-sm font-semibold mb-3 text-center">New Cards From Deck</h4>
              <div className="flex justify-center gap-3 flex-wrap">
                {exchangeCards.map((card) => {
                  const index = availableCards.findIndex(c => c.id === card.id);
                  const isSelected = selectedIndices.includes(index);
                  const isDisabled = isProcessing && !isSelected;
                  
                  return (
                    <button
                      key={card.id}
                      onClick={() => handleCardSelect(index)}
                      disabled={isDisabled || isProcessing}
                      className={`
                        group relative 
                        ${isSelected ? 'ring-2 ring-blue-500' : ''} 
                        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      <div className={`
                        absolute -inset-2 rounded-xl 
                        ${isSelected ? 'bg-blue-500/30' : 'bg-blue-500/0 group-hover:bg-blue-500/20'} 
                        transition-all duration-300
                      `} />
                      <div className="relative">
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
                          
                          <div className={`
                            absolute inset-0 
                            ${isSelected ? 'bg-blue-500/30' : 'bg-blue-500/0 group-hover:bg-blue-500/20'} 
                            transition-colors duration-300
                          `} />
                        </div>

                        <div className={`
                          absolute -bottom-1 inset-x-0 h-1 bg-blue-500 transform 
                          ${isSelected ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'} 
                          transition-transform duration-300
                        `}/>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={handleConfirmSelection}
              disabled={selectedIndices.length !== requiredSelectionCount || isProcessing}
              className={`
                px-6 py-2 rounded-full flex items-center gap-2
                ${selectedIndices.length === requiredSelectionCount && !isProcessing ? 
                  'bg-blue-600 hover:bg-blue-700 text-white' : 
                  'bg-gray-700 text-gray-400 cursor-not-allowed'}
                transition-colors duration-300
              `}
            >
              {isProcessing && <LoaderPinwheel className="w-4 h-4 animate-spin" />}
              {isProcessing ? 'Processing...' : `Confirm Selection (${selectedIndices.length}/${requiredSelectionCount})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}