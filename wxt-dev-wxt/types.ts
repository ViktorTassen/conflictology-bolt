// Core game types
export interface Card {
  id: string;
  name: CardType;
  playerId: number | null;
  location: 'player' | 'deck' | 'exchange' | 'investigate';
  revealed?: boolean;
  position: number | null; // 0 or 1 for player cards, null for other locations
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
export const CARDS = ['Banker', 'Hacker', 'Mafia', 'Reporter', 'Judge', 'Police'] as const;
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



export type ActionType = 
  | 'income'
  | 'foreign-aid'
  | 'banker' 
  | 'hack'
  | 'steal'
  | 'exchange'
  | 'scandal'
  | 'judge' 
  | 'investigate'
  | 'swap';

export type ResponseType = 'allow' | 'block' | 'challenge' | 'lose_influence' | 'exchange_selection' | 'select_card_for_investigation' | 'investigate_decision'

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

// Segmented message part for advanced log formatting
export type MessagePart = 
  | { type: 'text'; content: string }
  | { type: 'player'; content: string; playerId: number; color: string };

export interface GameLogEntry {
  type: LogType;
  player: string;
  playerColor: string;
  playerId?: number;  // Added player ID for coloring
  target?: string;
  targetColor?: string;
  targetId?: number;  // Added target ID for coloring
  card?: CardType;
  targetCard?: CardType;
  coins?: number;
  timestamp: number;
  message?: string;
  messageParts?: MessagePart[]; // New system for segmented messages with player coloring
  actionType?: string; // Used by LoggingService to determine the message for 'allow' actions
}

// Game interface
export interface Game {
  id: string;
  players: Player[];
  currentTurn: number;
  firstPlayerOfMatch?: number; // Track which player started the current match
  cards: Card[]; // Replace deck with cards array
  logs: GameLogEntry[];
  status: GameStatus;
  actionUsedThisTurn?: boolean;
  createdAt?: number; // Timestamp when the game was created
  createdBy?: string; // UID of the user who created the game
  actionInProgress?: {
    type: ActionType;
    player: number;
    target?: number;
    blockingPlayer?: number;
    blockingCard?: CardType;
    losingPlayer?: number;
    challengeDefense?: boolean;
    challengeInProgress?: boolean;
    loseTwo?: boolean; // Flag to indicate that challenger loses two influence cards (for Hacker)
    cardsLostCounter?: number; // Counter to track how many cards have been lost when loseTwo is true
    exchangeCards?: string[]; // Now stores card IDs instead of CardType
    investigateCard?: {
      cardId: string;
      cardIndex: number;
    };

    revealedBankerCardId?: string;
    revealedMafiaCardId?: string;
    revealedReporterCardId?: string;
    revealedHackerCardId?: string;
    revealedJudgeCardId?: string;
    revealedPoliceCardId?: string;
    revealedBlockingCardId?: string; // Generic for any blocking card
    responses: Record<number, { 
      type: ResponseType | null;
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