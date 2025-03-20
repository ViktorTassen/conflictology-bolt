import { Game, Player, GameLogEntry, CardType } from '../types';
import { Firestore, Transaction } from 'firebase/firestore';

export interface ActionContext {
  game: Game;
  player: Player;
  playerId: number;
  transaction: Transaction;
  db: Firestore;
}

export interface ActionHandler {
  execute: (context: ActionContext) => Promise<void>;
  respond: (context: ActionContext, response: ActionResponse) => Promise<void>;
}

export interface ActionResponse {
  type: 'allow' | 'block' | 'challenge';
  playerId: number;
  card?: CardType;
}

export interface ActionProgress {
  type: string;
  player: number;
  target?: number;
  responseDeadline: number;
  blockingPlayer?: number;
  blockingCard?: CardType;
  responses: Record<number, { type: string; card?: string }>;
  resolved: boolean;
}

export interface ActionResult {
  players?: Player[];
  logs?: GameLogEntry[];
  currentTurn?: number;
  actionInProgress?: ActionProgress | null;
  responses?: Record<number, { type: string; card?: string }>;
}