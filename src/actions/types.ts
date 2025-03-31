import { Game, Player, GameLogEntry, CardType, ResponseType } from '../types';
import { Firestore, Transaction } from 'firebase/firestore';

export interface ActionContext {
  game: Game;
  player: Player;
  playerId: number;
  transaction: Transaction;
  db: Firestore;
}

export interface ActionResult {
  players?: Player[];
  logs?: GameLogEntry[];
  currentTurn?: number;
  actionInProgress?: Game['actionInProgress'];
  responses?: Game['responses'];
  actionUsedThisTurn?: boolean;
  cards?: Game['cards'];
}

export interface ActionHandler {
  execute: (context: ActionContext) => Promise<ActionResult>;
  respond: (context: ActionContext, response: ActionResponse) => Promise<ActionResult>;
}

export interface ActionResponse {
  type: ResponseType;
  playerId: number;
  card?: CardType;
  selectedIndices?: number[];
  keepCard?: boolean;
}

export const isPlayerEliminated = (player: Player): boolean => {
  return player.eliminated === true;
};

export const advanceToNextLivingPlayer = (players: Player[], currentTurn: number): number => {
  let nextTurn = (currentTurn + 1) % players.length;
  while (isPlayerEliminated(players[nextTurn])) {
    nextTurn = (nextTurn + 1) % players.length;
  }
  return nextTurn;
};

export const advanceToNextTurn = (players: Player[], currentTurn: number): { currentTurn: number, actionUsedThisTurn: boolean } => {
  const nextTurn = advanceToNextLivingPlayer(players, currentTurn);
  return {
    currentTurn: nextTurn,
    actionUsedThisTurn: false
  };
};