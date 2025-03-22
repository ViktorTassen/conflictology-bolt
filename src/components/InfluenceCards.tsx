import React from 'react';
import { Influence } from '../types';
import backImage from '../assets/images/back.png';

interface InfluenceCardsProps {
  influence: Influence[];
  showFaceUp?: boolean;
}

export function InfluenceCards({ influence, showFaceUp = false }: InfluenceCardsProps) {
  // Only show unrevealed cards
  const availableCards = influence.filter(card => !card.revealed);

  return (
    <div className="flex gap-1 transform -rotate-6">
      {availableCards.map((card, index) => {
        const cardImage = showFaceUp 
          ? `/src/assets/images/${card.card.toLowerCase()}.png`
          : backImage;

        return (
          <div
            key={index}
            className={`w-[75px] h-[105px] rounded-md overflow-hidden transform ${
              index === 1 ? 'rotate-6' : ''
            }`}
            style={{
              boxShadow: '0 0 20px rgba(0,0,0,0.3)',
            }}
          >
            <img
              src={cardImage}
              alt={showFaceUp ? card.card : "Card back"}
              className="w-full h-full object-cover"
            />
            {showFaceUp && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent">
                <div className="absolute bottom-1 left-1 text-white font-bold text-[10px]">
                  {card.card}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}