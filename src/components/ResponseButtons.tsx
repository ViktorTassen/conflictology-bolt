import { ShieldAlert, Swords, Check, Loader2 } from 'lucide-react';
import { CardType } from '../types';
import { useState } from 'react';

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
  blockCards = ['Banker'] as CardType[]
}: ResponseButtonsProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [responseType, setResponseType] = useState<'block' | 'challenge' | 'allow' | null>(null);
  const [blockCard, setBlockCard] = useState<CardType | null>(null);
  
  if (!visible) return null;

  // Check if we need to show separate block buttons for different cards
  const showMultipleBlockButtons = blockCards.length > 1 && showBlock;
  const showSingleBlockButton = blockCards.length === 1 && showBlock;

  const handleBlock = async (card: CardType) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setResponseType('block');
    setBlockCard(card);
    
    try {
      await onBlock?.(card);
    } finally {
      // We don't reset the state as the component will likely unmount
      // If it doesn't, the UI will show the processing state
    }
  };

  const handleChallenge = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setResponseType('challenge');
    
    try {
      await onChallenge?.();
    } finally {
      // We don't reset the state as the component will likely unmount
    }
  };

  const handleAllow = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setResponseType('allow');
    
    try {
      await onAllow?.();
    } finally {
      // We don't reset the state as the component will likely unmount
    }
  };

  return (
    <div className="rounded-lg w-full overflow-hidden mt-4 animate-in fade-in slide-in-from-bottom-2 mb-6">
      <div className="flex justify-center gap-2 flex-wrap relative">
        {/* For single block card, show just one block button */}
        {showSingleBlockButton && (
          <button
            onClick={() => handleBlock(blockCards[0])}
            disabled={isProcessing}
            className={`flex items-center gap-1.5 ${
              isProcessing && responseType === 'block' && blockCard === blockCards[0]
                ? 'bg-red-500/40 cursor-not-allowed'
                : 'bg-red-500/20 hover:bg-red-500/30'
            } text-red-400 px-3 py-2 rounded-lg transition-colors`}
          >
            {isProcessing && responseType === 'block' && blockCard === blockCards[0] ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ShieldAlert className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">{blockText}</span>
          </button>
        )}
        
        {/* For multiple block cards, show a compact button for each */}
        {showMultipleBlockButtons && blockCards.map(card => (
          <button
            key={card}
            onClick={() => handleBlock(card)}
            disabled={isProcessing}
            className={`flex items-center gap-1 ${
              isProcessing && responseType === 'block' && blockCard === card
                ? 'bg-red-500/40 cursor-not-allowed'
                : 'bg-red-500/20 hover:bg-red-500/30'
            } text-red-400 px-3 py-2 rounded-lg transition-colors`}
          >
            {isProcessing && responseType === 'block' && blockCard === card ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <ShieldAlert className="w-3 h-3" />
            )}
            <span className="text-sm font-medium">{card}</span>
          </button>
        ))}
        
        {showChallenge && (
          <button
            onClick={handleChallenge}
            disabled={isProcessing}
            className={`flex items-center gap-1.5 ${
              isProcessing && responseType === 'challenge'
                ? 'bg-yellow-500/40 cursor-not-allowed'
                : 'bg-yellow-500/20 hover:bg-yellow-500/30'
            } text-yellow-400 px-3 py-2 rounded-lg transition-colors`}
          >
            {isProcessing && responseType === 'challenge' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Swords className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">{challengeText}</span>
          </button>
        )}
        
        {showAllow && (
          <button
            onClick={handleAllow}
            disabled={isProcessing}
            className={`flex items-center gap-1.5 ${
              isProcessing && responseType === 'allow'
                ? 'bg-green-500/40 cursor-not-allowed'
                : 'bg-green-500/20 hover:bg-green-500/30'
            } text-green-400 px-3 py-2 rounded-lg transition-colors`}
          >
            {isProcessing && responseType === 'allow' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">{allowText}</span>
          </button>
        )}
      </div>
    </div>
  );
}