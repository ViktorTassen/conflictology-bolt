import { Card, CardType, CARDS } from '../types';
import { nanoid } from 'nanoid';

export function createDeck(): Card[] {
  const cards: Card[] = [];
  
  CARDS.forEach(cardType => {
    for (let i = 0; i < 3; i++) {
      cards.push({
        id: `${cardType}-${nanoid(6)}`,
        name: cardType,
        playerId: null,
        location: 'deck',
        revealed: false
      });
    }
  });
  
  return shuffleCards(cards);
}

export function shuffleCards<T>(cards: T[]): T[] {
  const shuffled = [...cards];
  
  for (let pass = 0; pass < 3; pass++) {
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
  }
  
  return shuffled;
}

export function dealCards(cards: Card[], playerIds: number[]): Card[] {
  const updatedCards = [...cards];
  
  playerIds.forEach(playerId => {
    for (let i = 0; i < 2; i++) {
      const cardIndex = updatedCards.findIndex(c => c.location === 'deck' && c.playerId === null);
      if (cardIndex !== -1) {
        updatedCards[cardIndex] = {
          ...updatedCards[cardIndex],
          playerId,
          location: 'player'
        };
      }
    }
  });
  
  return updatedCards;
}

export function getPlayerCards(cards: Card[], playerId: number): Card[] {
  return cards.filter(card => 
    card.playerId === playerId && 
    card.location === 'player' && 
    !card.revealed
  );
}

export function hasCardType(cards: Card[], playerId: number, cardType: CardType): boolean {
  return cards.some(card => 
    card.playerId === playerId && 
    card.location === 'player' && 
    !card.revealed && 
    card.name === cardType
  );
}

export function drawCards(cards: Card[], count: number, location: 'exchange' | 'investigate'): Card[] {
  const updatedCards = [...cards];
  const drawnCardIds: string[] = [];
  
  for (let i = 0; i < count; i++) {
    const cardIndex = updatedCards.findIndex(c => c.location === 'deck' && c.playerId === null);
    if (cardIndex !== -1) {
      updatedCards[cardIndex] = {
        ...updatedCards[cardIndex],
        location
      };
      drawnCardIds.push(updatedCards[cardIndex].id);
    }
  }
  
  return updatedCards;
}

export function returnCardsToDeck(cards: Card[], cardIds: string[]): Card[] {
  const updatedCards = [...cards];
  
  cardIds.forEach(cardId => {
    const cardIndex = updatedCards.findIndex(c => c.id === cardId);
    if (cardIndex !== -1) {
      updatedCards[cardIndex] = {
        ...updatedCards[cardIndex],
        playerId: null,
        location: 'deck',
        revealed: false
      };
    }
  });
  
  return shuffleCards(updatedCards);
}

export function revealCard(cards: Card[], cardId: string): Card[] {
  const updatedCards = [...cards];
  const cardIndex = updatedCards.findIndex(c => c.id === cardId);
  
  if (cardIndex !== -1) {
    updatedCards[cardIndex] = {
      ...updatedCards[cardIndex],
      revealed: true
    };
  }
  
  return updatedCards;
}

export function replaceCard(cards: Card[], cardId: string): Card[] {
  const updatedCards = [...cards];
  
  const cardToReplace = updatedCards.find(c => c.id === cardId);
  if (!cardToReplace) {
    return updatedCards;
  }
  
  const newCardIndex = updatedCards.findIndex(c => c.location === 'deck' && c.playerId === null);
  if (newCardIndex === -1) {
    return updatedCards;
  }
  
  const cardIndex = updatedCards.findIndex(c => c.id === cardId);
  if (cardIndex !== -1) {
    updatedCards[cardIndex] = {
      ...updatedCards[cardIndex],
      playerId: null,
      location: 'deck',
      revealed: false
    };
  }
  
  updatedCards[newCardIndex] = {
    ...updatedCards[newCardIndex],
    playerId: cardToReplace.playerId,
    location: 'player'
  };
  
  return shuffleCards(updatedCards);
}

export function validateCardCounts(cards: Card[]): boolean {
  if (cards.length !== 18) return false;
  
  for (const cardType of CARDS) {
    const count = cards.filter(c => c.name === cardType).length;
    if (count !== 3) return false;
  }
  
  const ids = new Set(cards.map(c => c.id));
  if (ids.size !== cards.length) return false;
  
  return true;
}