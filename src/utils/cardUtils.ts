import { Card, CardType, CARDS } from '../types';
import { nanoid } from 'nanoid';

// Create a new deck of cards
export function createDeck(): Card[] {
  const cards: Card[] = [];
  
  // Create 3 copies of each card type
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
  
  // Shuffle the cards
  return shuffleCards(cards);
}

// Shuffle an array of cards using Fisher-Yates algorithm
export function shuffleCards<T>(cards: T[]): T[] {
  const shuffled = [...cards];
  
  // Multiple passes to ensure thorough shuffling
  for (let pass = 0; pass < 3; pass++) {
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
  }
  
  return shuffled;
}

// Deal cards to players
export function dealCards(cards: Card[], playerIds: number[]): Card[] {
  const updatedCards = [...cards];
  
  playerIds.forEach(playerId => {
    // Find 2 cards in deck to deal to this player
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

// Get a player's active (non-revealed) cards
export function getPlayerCards(cards: Card[], playerId: number): Card[] {
  return cards.filter(card => 
    card.playerId === playerId && 
    card.location === 'player' && 
    !card.revealed
  );
}

// Check if a player has a specific card type
export function hasCardType(cards: Card[], playerId: number, cardType: CardType): boolean {
  return cards.some(card => 
    card.playerId === playerId && 
    card.location === 'player' && 
    !card.revealed && 
    card.name === cardType
  );
}

// Draw cards from deck for exchange/investigate
export function drawCards(cards: Card[], count: number, location: 'exchange' | 'investigate'): Card[] {
  const updatedCards = [...cards];
  const drawnCardIds: string[] = [];
  
  // Find cards in deck to draw
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

// Return cards to deck
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

// Reveal a card
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

// Replace a revealed card with a new one from the deck
export function replaceCard(cards: Card[], cardId: string): Card[] {
  console.log("REPLACE CARD DEBUG: Starting replacement for card ID:", cardId);
  const updatedCards = [...cards];
  
  // Find the card to replace
  const cardToReplace = updatedCards.find(c => c.id === cardId);
  if (!cardToReplace) {
    console.log("REPLACE CARD DEBUG: Card to replace not found!");
    return updatedCards;
  }
  
  console.log("REPLACE CARD DEBUG: Found card to replace:", cardToReplace);
  
  // Find a new card in the deck
  const newCardIndex = updatedCards.findIndex(c => c.location === 'deck' && c.playerId === null);
  if (newCardIndex === -1) {
    console.log("REPLACE CARD DEBUG: No available card in deck!");
    return updatedCards;
  }
  
  console.log("REPLACE CARD DEBUG: Found new card from deck:", updatedCards[newCardIndex]);
  
  // Update the old card
  const cardIndex = updatedCards.findIndex(c => c.id === cardId);
  if (cardIndex !== -1) {
    console.log("REPLACE CARD DEBUG: Updating old card at index:", cardIndex);
    updatedCards[cardIndex] = {
      ...updatedCards[cardIndex],
      playerId: null,
      location: 'deck',
      revealed: false
    };
  }
  
  // Update the new card
  console.log("REPLACE CARD DEBUG: Updating new card at index:", newCardIndex);
  updatedCards[newCardIndex] = {
    ...updatedCards[newCardIndex],
    playerId: cardToReplace.playerId,
    location: 'player'
  };
  
  console.log("REPLACE CARD DEBUG: Cards after replacing before shuffle:",
    updatedCards.filter(c => c.playerId === cardToReplace.playerId || c.id === cardId));
  
  const shuffledResult = shuffleCards(updatedCards);
  
  console.log("REPLACE CARD DEBUG: Cards after replacing after shuffle:",
    shuffledResult.filter(c => c.playerId === cardToReplace.playerId));
  
  return shuffledResult;
}

// Validate card counts
export function validateCardCounts(cards: Card[]): boolean {
  // Check total number of cards
  if (cards.length !== 18) return false;
  
  // Check count of each card type
  for (const cardType of CARDS) {
    const count = cards.filter(c => c.name === cardType).length;
    if (count !== 3) return false;
  }
  
  // Check for duplicate IDs
  const ids = new Set(cards.map(c => c.id));
  if (ids.size !== cards.length) return false;
  
  return true;
}