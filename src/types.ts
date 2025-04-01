// Core game types
export interface Card {
  id: string;
  name: CardType;
  playerId: number | null;
  location: 'player' | 'deck' | 'exchange' | 'investigate';
  revealed?: boolean;
}

export interface Player {
  id: number;
  name: string;
  coins: number;
  color: string;
  avatar: string;
  eliminated?: boolean;
  tempViewState?: 'game' | 'lobby'; // Player-specific UI state
}

// Game state types
export const CARDS = ['Duke', 'Assassin', 'Captain', 'Ambassador', 'Contessa', 'Inquisitor'] as const;
export type CardType = typeof CARDS[number];

export type GameStatus = 'waiting' | 'playing' | 'finished';
export type GameState = 
  | 'waiting_for_action'
  | 'waiting_for_target'
  | 'waiting_for_response'
  | 'waiting_for_influence_loss'
  | 'waiting_for_others'
  | 'waiting_for_turn'
  | 'waiting_for_exchange'
  | 'waiting_for_card_selection'
  | 'waiting_for_investigate_decision';

// Action types
export type ActionType = 
  | 'income'
  | 'foreign-aid'
  | 'duke'
  | 'assassinate'
  | 'steal'
  | 'exchange'
  | 'coup'
  | 'contessa'
  | 'investigate'
  | 'swap';

export type ResponseType = 'allow' | 'block' | 'challenge' | 'lose_influence' | 'exchange_selection' | 'select_card_for_investigation' | 'investigate_decision';

export interface GameAction {
  type: ActionType;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  cost?: number;
  target?: number;
  requiresTarget?: boolean;
  cardImage?: string;
}

// Response option types
export interface ResponseOptions {
  showBlock: boolean;
  showChallenge: boolean;
  showAllow: boolean;
  blockText: string;
  challengeText: string;
  allowText: string;
  blockCards?: CardType[];
}

// Log types
export type LogType = 
  | ActionType
  | 'block'
  | 'challenge'
  | 'challenge-success'
  | 'challenge-fail'
  | 'lose-influence'
  | 'allow'
  | 'exchange-complete'
  | 'swap-complete'
  | 'investigate-result'
  | 'show-card'
  | 'system'
  | 'eliminated';

export interface GameLogEntry {
  type: LogType;
  player: string;
  playerColor: string;
  target?: string;
  targetColor?: string;
  card?: CardType;
  targetCard?: CardType;
  coins?: number;
  timestamp: number;
  message?: string;
}

// Game interface
export interface Game {
  id: string;
  players: Player[];
  currentTurn: number;
  cards: Card[]; // Replace deck with cards array
  logs: GameLogEntry[];
  status: GameStatus;
  actionUsedThisTurn?: boolean;
  actionInProgress?: {
    type: ActionType;
    player: number;
    target?: number;
    blockingPlayer?: number;
    blockingCard?: CardType;
    losingPlayer?: number;
    challengeDefense?: boolean;
    challengeInProgress?: boolean;
    loseTwo?: boolean; // Flag to indicate that challenger loses two influence cards (for Assassin)
    exchangeCards?: string[]; // Now stores card IDs instead of CardType
    investigateCard?: {
      cardId: string;
      cardIndex: number;
    };
    // IDs of cards revealed during successful defense of challenges
    revealedDukeCardId?: string;
    revealedCaptainCardId?: string;
    revealedAmbassadorCardId?: string;
    revealedAssassinCardId?: string;
    revealedContessaCardId?: string;
    revealedInquisitorCardId?: string;
    revealedBlockingCardId?: string; // Generic for any blocking card
    responses: Record<number, { 
      type: ResponseType;
      card?: CardType;
      selectedIndices?: number[];
    }>;
    resolved: boolean;
  } | null;
  responses: Record<number, {
    type: ResponseType;
    card?: CardType;
  }>;
  voteNextMatch?: Record<number, boolean>;
  winner?: number;
  newMatchCountdownStarted?: boolean;
  newMatchStartTime?: number;
  redirectToLobby?: boolean;
}