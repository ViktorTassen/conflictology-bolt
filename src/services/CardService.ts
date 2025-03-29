import { Card, CardType } from '../types';
import { nanoid } from 'nanoid';

export interface ICardService {
  createDeck(): Card[];
  shuffleCards<T>(cards: T[]): T[];
  dealCards(cards: Card[], playerIds: number[]): Card[];
  getPlayerCards(cards: Card[], playerId: number): Card[];
  hasCardType(cards: Card[], playerId: number, cardType: CardType): boolean;
  drawCards(cards: Card[], count: number, location: 'exchange' | 'investigate'): Card[];
  returnCardsToDeck(cards: Card[], cardIds: string[]): Card[];
  revealCard(cards: Card[], cardId: string): Card[];
  replaceCard(cards: Card[], cardId: string): Card[];
  validateCardCounts(cards: Card[]): boolean;
}

export class CardService implements ICardService {
  createDeck(): Card[] {
    const cards: Card[] = [];
    const cardTypes: CardType[] = ['Duke', 'Assassin', 'Captain', 'Ambassador', 'Contessa', 'Inquisitor'];
    
    cardTypes.forEach(cardType => {
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
    
    return this.shuffleCards(cards);
  }

  shuffleCards<T>(cards: T[]): T[] {
    const shuffled = [...cards];
    for (let pass = 0; pass < 3; pass++) {
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
    }
    return shuffled;
  }

  dealCards(cards: Card[], playerIds: number[]): Card[] {
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

  getPlayerCards(cards: Card[], playerId: number): Card[] {
    return cards.filter(card => 
      card.playerId === playerId && 
      card.location === 'player' && 
      !card.revealed
    );
  }

  hasCardType(cards: Card[], playerId: number, cardType: CardType): boolean {
    return cards.some(card => 
      card.playerId === playerId && 
      card.location === 'player' && 
      !card.revealed && 
      card.name === cardType
    );
  }

  drawCards(cards: Card[], count: number, location: 'exchange' | 'investigate'): Card[] {
    const updatedCards = [...cards];
    
    for (let i = 0; i < count; i++) {
      const cardIndex = updatedCards.findIndex(c => c.location === 'deck' && c.playerId === null);
      if (cardIndex !== -1) {
        updatedCards[cardIndex] = {
          ...updatedCards[cardIndex],
          location
        };
      }
    }
    
    return updatedCards;
  }

  returnCardsToDeck(cards: Card[], cardIds: string[]): Card[] {
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
    
    return this.shuffleCards(updatedCards);
  }

  revealCard(cards: Card[], cardId: string): Card[] {
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

  replaceCard(cards: Card[], cardId: string): Card[] {
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
    
    return this.shuffleCards(updatedCards);
  }

  validateCardCounts(cards: Card[]): boolean {
    if (cards.length !== 18) return false;
    
    const cardTypes: CardType[] = ['Duke', 'Assassin', 'Captain', 'Ambassador', 'Contessa', 'Inquisitor'];
    for (const cardType of cardTypes) {
      const count = cards.filter(c => c.name === cardType).length;
      if (count !== 3) return false;
    }
    
    const ids = new Set(cards.map(c => c.id));
    return ids.size === cards.length;
  }
}

export const cardService = new CardService();