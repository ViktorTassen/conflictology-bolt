import { CardType } from '../types';
import { Eye, RefreshCw } from 'lucide-react';

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
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent">
                  <div className="absolute bottom-3 left-3 text-white font-bold text-lg">
                    {card}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decision buttons */}
          <div className="flex justify-center gap-3 flex-wrap">
            <button
              onClick={() => onDecision(true)}
              className="flex items-center justify-center gap-1.5 px-5 py-2 rounded-full  bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors duration-200 shadow-sm"
            >
              <Eye className="w-4 h-4" />
              <span>Let Them Keep It</span>
            </button>
            
            <button
              onClick={() => onDecision(false)}
              className="flex items-center justify-center gap-1.5 px-5 py-2 rounded-full  bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors duration-200 shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Force Card Swap</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}