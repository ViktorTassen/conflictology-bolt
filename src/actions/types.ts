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
}

export interface ActionResult {
  players?: Player[];
  logs?: GameLogEntry[];
  currentTurn?: number;
  actionInProgress?: Game['actionInProgress'];
  responses?: Game['responses'];
}

export interface ActionHandler {
  execute: (context: ActionContext) => Promise<ActionResult>;
  respond: (context: ActionContext, response: ActionResponse) => Promise<ActionResult>;
}

// Helper functions for common operations
export const isPlayerEliminated = (player: Player): boolean => {
  return player.eliminated || player.influence.every(i => i.revealed);
};

export const advanceToNextLivingPlayer = (players: Player[], currentTurn: number): number => {
  let nextTurn = (currentTurn + 1) % players.length;
  while (isPlayerEliminated(players[nextTurn])) {
    nextTurn = (nextTurn + 1) % players.length;
  }
  return nextTurn;
};

export const getClaimedRole = (actionType: string): CardType | null => {
  const roleMap: Record<string, CardType> = {
    'duke': 'Duke',
    'steal': 'Captain',
    'assassinate': 'Assassin',
    'exchange': 'Ambassador',
  };
  return roleMap[actionType] || null;
};

export const verifyPlayerHasRole = (player: Player, role: CardType): boolean => {
  return player.influence.some(i => !i.revealed && i.card === role);
};

export const markPlayerAsLosing = (game: Game, playerId: number): ActionResult => {
  return {
    actionInProgress: {
      ...game.actionInProgress!,
      losingPlayer: playerId,
    }
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
  // Standard message patterns based on the examples and messages file
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

export const applyInfluenceLoss = (
  player: Player, 
  cardIndex: number | undefined,
  players: Player[]
): {
  logs: GameLogEntry[],
  eliminated: boolean
} => {
  const logs: GameLogEntry[] = [];
  
  // Safety check - make sure player and influence exist
  if (!player || !player.influence || player.influence.length === 0) {
    logs.push(createSystemLog('Error: Could not find player influence cards'));
    return { logs, eliminated: false };
  }
  
  // If card index is provided, reveal that specific card
  if (cardIndex !== undefined && cardIndex >= 0 && cardIndex < player.influence.length) {
    player.influence[cardIndex].revealed = true;
  } else {
    // Otherwise reveal the first hidden card
    const firstHiddenIndex = player.influence.findIndex(i => !i.revealed);
    if (firstHiddenIndex !== -1) {
      player.influence[firstHiddenIndex].revealed = true;
    } else {
      // No hidden cards found, player should already be eliminated
      player.eliminated = true;
      logs.push(createSystemLog(`${player.name} has no more cards to lose.`));
      return { logs, eliminated: true };
    }
  }
  
  logs.push(createLog('lose-influence', player));
  
  // Check if player is eliminated
  const remainingCards = player.influence.filter(i => !i.revealed).length;
  if (remainingCards === 0) {
    player.eliminated = true;
    logs.push({
      type: 'eliminated',
      player: player.name,
      playerColor: player.color,
      timestamp: Date.now(),
      message: `${player.name} has been eliminated!`
    });
    return { logs, eliminated: true };
  }
  
  return { logs, eliminated: false };
};

export const replaceRevealedCard = (
  player: Player,
  revealedCardType: CardType,
  game: Game
): {
  logs: GameLogEntry[]
} => {
  const logs: GameLogEntry[] = [];
  
  // Find the index of the revealed card
  const revealedCardIndex = player.influence.findIndex(
    i => !i.revealed && i.card === revealedCardType
  );
  
  if (revealedCardIndex === -1) {
    logs.push(createSystemLog(`Error: Could not find the revealed card in player's influence`));
    return { logs };
  }
  
  
  // Shuffle the deck (Fisher-Yates algorithm)
  for (let i = game.deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [game.deck[i], game.deck[j]] = [game.deck[j], game.deck[i]];
  }
  
  // Draw a new card for the player
  if (game.deck.length === 0) {
    logs.push(createSystemLog(`Error: No cards left in the deck to draw`));
    return { logs };
  }
  
  const newCard = game.deck.pop()!;
  player.influence[revealedCardIndex].card = newCard;

  
  return { logs };
};