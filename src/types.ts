import { DivideIcon as LucideIcon } from 'lucide-react';

export interface Influence {
  card: string;
  revealed?: boolean;
}

export interface Player {
  id: number;
  name: string;
  coins: number;
  color: string;
  avatar: string;
  influence: Influence[];
}

export type LogType = 
  | 'income'
  | 'foreign-aid'
  | 'coup'
  | 'tax'
  | 'assassinate'
  | 'steal'
  | 'exchange'
  | 'block'
  | 'challenge'
  | 'challenge-success'
  | 'challenge-fail'
  | 'lose-influence'
  | 'allow'
  | 'exchange-complete'
  | 'system';

export interface GameLogEntry {
  type: LogType;
  player: string;
  playerColor: string;
  target?: string;
  targetColor?: string;
  card?: string;
  targetCard?: string;
  coins?: number;
  timestamp: number;
  message?: string;
}

export type View = 'lobby' | 'game';

export type TargetableAction = 'steal' | 'assassinate' | 'coup';

export interface GameAction {
  icon: LucideIcon;
  name: string;
  description: string;
  type: 'income' | 'foreign-aid' | TargetableAction | 'duke' | 'ambassador';
  cost?: number;
}

export type GameState = 
  | 'waiting_for_action'
  | 'waiting_for_target'
  | 'waiting_for_response'
  | 'waiting_for_influence_loss'
  | 'waiting_for_others'
  | 'waiting_for_turn'
  | 'waiting_for_exchange';

export interface Game {
  id: string;
  players: Player[];
  currentTurn: number;
  deck: string[];
  logs: GameLogEntry[];
  status: 'waiting' | 'playing' | 'finished';
  actionInProgress?: {
    type: string;
    player: number;
    target?: number;
    responseDeadline?: number;
    blockingPlayer?: number;
    blockingCard?: CardType;
    losingPlayer?: number;
    responses: Record<number, { type: string; card?: string }>;
    resolved?: boolean;
  };
  responses: Record<number, { type: string; card?: string }>;
}

export type GameResponse = 'allow' | 'block' | 'challenge' | 'lose_influence';

export const CARDS = ['Duke', 'Assassin', 'Captain', 'Ambassador', 'Contessa'] as const;
export type CardType = typeof CARDS[number];