import { Game, Player, GameLogEntry, CardType, ResponseType } from '../types';
import { Firestore, Transaction } from 'firebase/firestore';
import { GameMessages } from '../messages';

export interface ActionContext {
  game: Game;
  player: Player;
  playerId: number;
  transaction: Transaction;
  db: Firestore;
}

export interface ActionResponse {
  type: ResponseType;
  playerId: number;
  card?: CardType;
  selectedIndices?: number[]; // For exchange_selection
  keepCard?: boolean; // For investigate_decision
}

export interface ActionResult {
  players?: Player[];
  logs?: GameLogEntry[];
  currentTurn?: number;
  actionInProgress?: Game['actionInProgress'];
  responses?: Game['responses'];
  actionUsedThisTurn?: boolean;
  cards?: Game['cards']; // Add cards to ActionResult
}

export interface ActionHandler {
  execute: (context: ActionContext) => Promise<ActionResult>;
  respond: (context: ActionContext, response: ActionResponse) => Promise<ActionResult>;
}

// Helper functions for common operations
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

// This function advances to the next player and resets the actionUsedThisTurn flag
export const advanceToNextTurn = (players: Player[], currentTurn: number): { currentTurn: number, actionUsedThisTurn: boolean } => {
  const nextTurn = advanceToNextLivingPlayer(players, currentTurn);
  return {
    currentTurn: nextTurn,
    actionUsedThisTurn: false
  };
};

export interface LogMessageOptions {
  action?: string;
  result?: 'success' | 'fail' | 'blocked';
  coins?: number;
  card?: CardType;
  targetCard?: CardType;
  isBluff?: boolean;
  isChallenge?: boolean;
  isBlock?: boolean;
}

export const createLog = (
  type: GameLogEntry['type'],
  player: Player,
  data?: Partial<Omit<GameLogEntry, 'type' | 'player' | 'playerColor' | 'timestamp'>> & LogMessageOptions
): GameLogEntry => {
  // Format message according to standardized pattern
  let formattedMessage = data?.message;
  
  if (!formattedMessage && data) {
    formattedMessage = generateStandardMessage(type, data);
  }
  
  return {
    type,
    player: player.name,
    playerColor: player.color,
    timestamp: Date.now(),
    ...data,
    message: formattedMessage
  };
};

// Helper function to create system logs consistently
export const createSystemLog = (message: string): GameLogEntry => {
  return {
    type: 'system',
    player: 'System',
    playerColor: '#9CA3AF',
    timestamp: Date.now(),
    message
  };
};

// Helper function to generate standardized messages
function generateStandardMessage(type: GameLogEntry['type'], options: LogMessageOptions): string | undefined {
  switch (type) {
    case 'duke': // Tax
      if (options.isChallenge && options.result === 'success') {
        return GameMessages.responses.taxBluffExposed;
      } else if (!options.result) {
        return GameMessages.claims.tax;
      } else if (options.result === 'success') {
        return GameMessages.results.tax;
      }
      break;
      
    case 'foreign-aid':
      if (!options.result) {
        return GameMessages.claims.foreignAid;
      } else if (options.result === 'success') {
        return GameMessages.results.foreignAid;
      }
      break;
      
    case 'steal':
      if (!options.result) {
        return GameMessages.claims.steal;
      } else if (options.result === 'success' && options.coins !== undefined) {
        return GameMessages.results.steal(options.coins, options.target);
      } else if (options.result === 'blocked') {
        return GameMessages.results.stealBlocked;
      }
      break;
      
    case 'assassinate':
      if (!options.result) {
        return GameMessages.claims.assassinate;
      } else if (options.result === 'blocked') {
        return GameMessages.results.assassinationBlocked;
      } else if (options.result === 'success') {
        return GameMessages.results.assassinationSucceeds(options.target);
      }
      break;
      
    case 'exchange':
      if (!options.result) {
        return GameMessages.claims.exchange;
      } else if (options.result === 'success') {
        return GameMessages.results.exchangeComplete;
      } else if (options.isBluff) {
        return GameMessages.responses.bluffExposed;
      }
      break;
      
    case 'coup':
      if (options.coins && options.coins >= 10) {
        return GameMessages.claims.coupWithExcess;
      } else {
        return GameMessages.claims.coup;
      }
      break;
      
    case 'block':
      if (options.card) {
        return GameMessages.blocks.generic(options.card);
      }
      break;
      
    case 'challenge':
      return GameMessages.challenges.generic;
      
    case 'challenge-success':
      if (options.card) {
        return GameMessages.challenges.challengeBlockSuccess(options.card);
      } else {
        return 'challenge succeeds';
      }
      break;
      
    case 'challenge-fail':
      if (options.card) {
        return GameMessages.challenges.challengeBlockFail(options.card);
      } else {
        return 'challenge fails';
      }
      break;
      
    case 'eliminated':
      return GameMessages.responses.eliminated;
      
    case 'lose-influence':
      return GameMessages.responses.loseInfluence;
      
    case 'allow':
      return GameMessages.responses.allow;
  }
  
  return undefined;
}