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
  eliminated?: boolean;
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
  cardImage?: string; // Path to card image for character actions
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
  deck: CardType[];
  logs: GameLogEntry[];
  status: GameStatus;
  actionUsedThisTurn?: boolean; // Flag to track if the current player has used an action during their turn
  actionInProgress?: {
    type: ActionType;
    player: number;
    target?: number;
    responseDeadline: number;
    blockingPlayer?: number;
    blockingCard?: CardType;
    losingPlayer?: number;
    challengeDefense?: boolean; // Indicates if a player successfully defended a challenge and should replace their card
    challengeInProgress?: boolean;
    exchangeCards?: CardType[];
    investigateCard?: {
      card: CardType;
      cardIndex: number;
    };
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
  // Record of player IDs who have voted for the next match
  voteNextMatch?: Record<number, boolean>;
  winner?: number; // ID of the winning player
  newMatchCountdownStarted?: boolean; // Whether countdown to new match has started
  newMatchStartTime?: number; // Timestamp when the new match will start
  redirectToLobby?: boolean; // Whether to redirect players to lobby
}