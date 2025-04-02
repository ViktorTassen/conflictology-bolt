import { Card, CardType } from '../types';
import { Skull } from 'lucide-react';

// Import card images
import reporterImg from '../assets/images/reporter.png';
import hackerImg from '../assets/images/hacker.png';
import mafiaImg from '../assets/images/mafia.png';
import judgeImg from '../assets/images/judge.png';
import bankerImg from '../assets/images/banker.png';
import policeImg from '../assets/images/police.png';

// Card image mapping
const cardImages: Record<CardType, string> = {
  'Reporter': reporterImg,
  'Hacker': hackerImg,
  'Mafia': mafiaImg,
  'Judge': judgeImg,
  'Banker': bankerImg,
  'Police': policeImg
};

interface LoseInfluenceDialogProps {
  cards: Card[];
  playerId: number;
  onCardSelect: (cardName: CardType) => void;
}

export function LoseInfluenceDialog({ cards, playerId, onCardSelect }: LoseInfluenceDialogProps) {
  const availableCards = cards.filter(card => 
    card.playerId === playerId && 
    card.location === 'player' && 
    !card.revealed
  );

  if (availableCards.length === 0) return null;

  return (
    <div className="absolute inset-x-0 bottom-0 z-50 animate-in fade-in slide-in-from-bottom-4">
      <div className="relative">
        {/* Background blur and gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent backdrop-blur-md" />
        
        {/* Content */}
        <div className="relative px-6 pt-12 pb-6">
          {/* Warning icon */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-6">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
              <Skull className="w-6 h-6 text-red-500" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-white mb-1">Lose Influence</h3>
            <p className="text-red-400/80 text-sm">
              Select a card to remove from your influence
            </p>
          </div>

          {/* Cards */}
          <div className="flex justify-center gap-4">
            {availableCards.map((card) => (
              <button
                key={card.id}
                onClick={() => onCardSelect(card.name)}
                className="group relative"
              >
                <div className="absolute -inset-2 rounded-xl bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
                    <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/30 transition-colors duration-300" />
                  </div>

                  {/* Selection indicator */}
                  <div className="absolute -bottom-1 inset-x-0 h-1 bg-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}