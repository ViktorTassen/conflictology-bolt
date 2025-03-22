import React from 'react';
import { ShieldAlert, Swords, Check } from 'lucide-react';
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
  
  if (!visible) return null;

  // Check if we need to show separate block buttons for different cards
  const showMultipleBlockButtons = blockCards.length > 1 && showBlock;
  const showSingleBlockButton = blockCards.length === 1 && showBlock;

  return (
    <div className="rounded-lg w-full overflow-hidden mt-4 animate-in fade-in slide-in-from-bottom-2 mb-6">
      <div className="flex justify-center gap-1 flex-wrap relative">
        {/* For single block card, show just one block button */}
        {showSingleBlockButton && (
          <button
            onClick={() => onBlock?.(blockCards[0])}
            className="flex items-center gap-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1.5 rounded-lg transition-colors"
          >
            <ShieldAlert className="w-4 h-4" />
            <span className="text-sm font-medium">{blockText}</span>
          </button>
        )}
        
        {/* For multiple block cards, show a compact button for each */}
        {showMultipleBlockButtons && blockCards.map(card => (
          <button
            key={card}
            onClick={() => onBlock?.(card)}
            className="flex items-center gap-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-2 py-1.5 rounded-lg transition-colors"
          >
            <ShieldAlert className="w-3 h-3" />
            <span className="text-xs font-medium">{card}</span>
          </button>
        ))}
        
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