// Core game types
export interface Influence {
  card: CardType;
  revealed: boolean;
}

export interface Player {
  id: number;
  name: string;
  coins: number;
  color: string;
  avatar: string;
  influence: Influence[];
  eliminated?: boolean; // New field to track elimination status
}

// Game state types
export const CARDS = ['Duke', 'Assassin', 'Captain', 'Ambassador', 'Contessa'] as const;
export type CardType = typeof CARDS[number];

export type GameStatus = 'waiting' | 'playing' | 'finished';
export type GameState = 
  | 'waiting_for_action'
  | 'waiting_for_target'
  | 'waiting_for_response'
  | 'waiting_for_influence_loss'
  | 'waiting_for_others'
  | 'waiting_for_turn'
  | 'waiting_for_exchange';

// Action types
export type ActionType = 
  | 'income'
  | 'foreign-aid'
  | 'duke'
  | 'assassinate'
  | 'steal'
  | 'exchange'
  | 'coup';

export type ResponseType = 'allow' | 'block' | 'challenge' | 'lose_influence' | 'exchange_selection';

export interface GameAction {
  type: ActionType;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  cost?: number;
  target?: number; // Added target property for targeted actions
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
  | 'system'
  | 'eliminated'; // New log type for elimination

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
  deck: CardType[];
  logs: GameLogEntry[];
  status: GameStatus;
  actionInProgress?: {
    type: ActionType;
    player: number;
    target?: number;
    responseDeadline: number;
    blockingPlayer?: number;
    blockingCard?: CardType;
    losingPlayer?: number;
    challengeDefense?: boolean;
    challengeInProgress?: boolean; // Flag to indicate challenge resolution in progress
    exchangeCards?: CardType[]; // Cards drawn for exchange
    responses: Record<number, { 
      type: ResponseType;
      card?: CardType;
    }>;
    resolved: boolean;
  } | null;
  responses: Record<number, {
    type: ResponseType;
    card?: CardType;
  }>;
}