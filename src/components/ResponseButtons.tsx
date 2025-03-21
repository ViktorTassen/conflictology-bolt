import React, { useState, useEffect } from 'react';
import { ShieldAlert, Swords, Check, ChevronDown } from 'lucide-react';
import { CardType } from '../types';

interface ResponseButtonsProps {
  onBlock?: (card: CardType) => void;
  onChallenge?: () => void;
  onAllow?: () => void;
  visible?: boolean;
  showBlock?: boolean;
  showChallenge?: boolean;
  showAllow?: boolean;
  blockText?: string;
  challengeText?: string;
  allowText?: string;
  blockCards: CardType[];
}

export function ResponseButtons({ 
  onBlock, 
  onChallenge, 
  onAllow, 
  visible = true,
  showBlock = true,
  showChallenge = true,
  showAllow = true,
  blockText = "Block",
  challengeText = "Challenge",
  allowText = "Allow",
  blockCards = ['Duke'] as CardType[]
}: ResponseButtonsProps) {
  const [showBlockOptions, setShowBlockOptions] = useState(false);
  
  // Log when component receives props
  useEffect(() => {
    console.log('ResponseButtons blockCards:', blockCards);
  }, [blockCards]);
  
  if (!visible) return null;

  const handleBlockClick = () => {
    console.log('Block button clicked with cards:', blockCards);
    
    if (blockCards.length > 1) {
      // Toggle the dropdown menu for multiple block cards
      setShowBlockOptions(!showBlockOptions);
    } else if (blockCards.length === 1 && onBlock) {
      // For single card blocks, call the handler directly with the only card option
      const card = blockCards[0];
      console.log('Blocking with single card option:', card);
      onBlock(card);
    } else {
      console.error('No block cards available');
    }
  };
  
  const handleBlockWithCard = (card: CardType) => {
    console.log('Selected block card from dropdown:', card);
    
    if (onBlock) {
      console.log('Passing card to parent handler:', card);
      onBlock(card);
      setShowBlockOptions(false);
    }
  };

  return (
    <div className="backdrop-blur-sm rounded-lg shadow-lg w-full overflow-hidden mt-4 animate-in fade-in slide-in-from-bottom-2 mb-6">
      <div className="flex justify-center gap-1 flex-wrap relative">
        {showBlock && (
          <div className="relative">
            <button
              onClick={handleBlockClick}
              className="flex items-center gap-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1.5 rounded-lg transition-colors"
            >
              <ShieldAlert className="w-4 h-4" />
              <span className="text-sm font-medium">{blockText}</span>
              {blockCards.length > 1 && <ChevronDown className="w-3 h-3 ml-1" />}
            </button>
            
            {showBlockOptions && blockCards.length > 1 && (
              <div className="absolute bottom-full left-0 mb-1 bg-red-500/10 border border-red-500/30 rounded-md shadow-lg z-10 min-w-full">
                {blockCards.map(card => (
                  <button
                    key={card}
                    onClick={() => handleBlockWithCard(card)}
                    className="block w-full text-left px-3 py-1.5 hover:bg-red-500/30 text-red-400 text-sm"
                  >
                    {card}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        
        {showChallenge && (
          <button
            onClick={onChallenge}
            className="flex items-center gap-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Swords className="w-4 h-4" />
            <span className="text-sm font-medium">{challengeText}</span>
          </button>
        )}
        
        {showAllow && (
          <button
            onClick={onAllow}
            className="flex items-center gap-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">{allowText}</span>
          </button>
        )}
      </div>
    </div>
  );
}