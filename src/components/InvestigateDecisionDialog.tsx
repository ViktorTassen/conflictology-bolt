import { CardType } from '../types';
import { Eye, RefreshCw, LoaderPinwheel } from 'lucide-react';
import { useState } from 'react';

// Import card images
import bankerImg from '../assets/images/banker.png';
import hackerImg from '../assets/images/hacker.png';
import mafiaImg from '../assets/images/mafia.png';
import judgeImg from '../assets/images/judge.png';
import reporterImg from '../assets/images/reporter.png';
import policeImg from '../assets/images/police.png';

// Card image mapping
const cardImages: Record<CardType, string> = {
  'Banker': bankerImg,
  'Hacker': hackerImg,
  'Mafia': mafiaImg,
  'Judge': judgeImg,
  'Reporter': reporterImg,
  'Police': policeImg
};

interface InvestigateDecisionDialogProps {
  card: CardType;
  targetName: string;
  onDecision: (keepCard: boolean) => void;
}

export function InvestigateDecisionDialog({ 
  card, 
  targetName,
  onDecision 
}: InvestigateDecisionDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<'keep' | 'swap' | null>(null);
  
  const handleDecision = async (keepCard: boolean) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setSelectedDecision(keepCard ? 'keep' : 'swap');
    
    try {
      await onDecision(keepCard);
    } catch (error) {
      console.error('Failed to make investigation decision:', error);
      setIsProcessing(false);
      setSelectedDecision(null);
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
            <h3 className="text-lg font-bold text-white mb-1">Investigation Result</h3>
            <p className="text-purple-400/80 text-sm">
              {targetName} showed you this card
            </p>
          </div>

          {/* Card Display */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="w-32 h-48 rounded-lg overflow-hidden mx-auto">
                <img
                  src={cardImages[card]}
                  alt={card}
                  className="w-full h-full object-cover"
                />
                
                {/* Loading overlay if processing */}
                {isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <LoaderPinwheel className="w-10 h-10 text-white/80 animate-spin" />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Decision buttons */}
          <div className="flex justify-center gap-3 flex-wrap">
            <button
              onClick={() => handleDecision(true)}
              disabled={isProcessing}
              className={`
                flex items-center justify-center gap-1.5 px-5 py-2 rounded-full
                ${isProcessing ? 
                  (selectedDecision === 'keep' ? 'bg-green-700' : 'bg-green-600/50 cursor-not-allowed') : 
                  'bg-green-600 hover:bg-green-700'
                } 
                text-white text-sm font-medium transition-colors duration-200 shadow-sm
              `}
            >
              {isProcessing && selectedDecision === 'keep' ? (
                <LoaderPinwheel className="w-4 h-4 animate-spin" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              <span>Let Them Keep It</span>
            </button>
            
            <button
              onClick={() => handleDecision(false)}
              disabled={isProcessing}
              className={`
                flex items-center justify-center gap-1.5 px-5 py-2 rounded-full
                ${isProcessing ? 
                  (selectedDecision === 'swap' ? 'bg-purple-700' : 'bg-purple-600/50 cursor-not-allowed') : 
                  'bg-purple-600 hover:bg-purple-700'
                } 
                text-white text-sm font-medium transition-colors duration-200 shadow-sm
              `}
            >
              {isProcessing && selectedDecision === 'swap' ? (
                <LoaderPinwheel className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span>Force Card Swap</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}