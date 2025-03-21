import React, { useState } from 'react';
import { ShieldAlert, Swords, Check, ChevronDown } from 'lucide-react';
import { CardType } from '../types';

interface ResponseButtonsProps {
  onBlock?: (card?: CardType) => void;
  onChallenge?: () => void;
  onAllow?: () => void;
  visible?: boolean;
  showBlock?: boolean;
  showChallenge?: boolean;
  showAllow?: boolean;
  blockText?: string;
  challengeText?: string;
  allowText?: string;
  blockCards?: CardType[];
}

export function ResponseButtons({ 
  onBlock, 
  onChallenge, 
  onAllow, 
  visible = true,
  showBlock = true,
  showChallenge = false,
  showAllow = true,
  blockText = "Block",
  challengeText = "Challenge",
  allowText = "Allow",
  blockCards = ['Duke']
}: ResponseButtonsProps) {
  const [showBlockOptions, setShowBlockOptions] = useState(false);
  
  if (!visible) return null;

  const handleBlockClick = () => {
    if (blockCards.length > 1 && onBlock) {
      setShowBlockOptions(!showBlockOptions);
    } else if (onBlock) {
      onBlock(blockCards[0]);
    }
  };
  
  const handleBlockWithCard = (card: CardType) => {
    if (onBlock) {
      onBlock(card);
      setShowBlockOptions(false);
    }
  };

  return (
    <div className="bg-[#2a2a2a]/80 backdrop-blur-sm rounded-lg shadow-lg w-full overflow-hidden mt-2 animate-in fade-in slide-in-from-bottom-2">
      <div className="p-2 flex justify-center gap-2 flex-wrap relative">
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
              <div className="absolute top-full left-0 mt-1 bg-[#1a1a1a] border border-gray-800 rounded-md shadow-lg z-10 min-w-full">
                {blockCards.map(card => (
                  <button
                    key={card}
                    onClick={() => handleBlockWithCard(card)}
                    className="block w-full text-left px-3 py-1.5 hover:bg-gray-800 text-sm"
                  >
                    Block with {card}
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