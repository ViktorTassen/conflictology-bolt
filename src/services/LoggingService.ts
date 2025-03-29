import { GameLogEntry, Player } from '../types';

export interface ILoggingService {
  createLog(type: GameLogEntry['type'], player: Player, data?: Partial<GameLogEntry>): GameLogEntry;
  createSystemLog(message: string): GameLogEntry;
  formatMessage(type: GameLogEntry['type'], data: Record<string, any>): string;
}

export class LoggingService implements ILoggingService {
  createLog(
    type: GameLogEntry['type'], 
    player: Player, 
    data?: Partial<Omit<GameLogEntry, 'type' | 'player' | 'playerColor' | 'timestamp'>>
  ): GameLogEntry {
    const formattedMessage = data?.message || this.formatMessage(type, data || {});
    
    return {
      type,
      player: player.name,
      playerColor: player.color,
      timestamp: Date.now(),
      ...data,
      message: formattedMessage
    };
  }

  createSystemLog(message: string): GameLogEntry {
    return {
      type: 'system',
      player: 'System',
      playerColor: '#9CA3AF',
      timestamp: Date.now(),
      message
    };
  }

  formatMessage(type: GameLogEntry['type'], data: Record<string, any>): string {
    switch (type) {
      case 'duke':
        if (data.isChallenge && data.result === 'success') {
          return 'Duke bluff exposed! Tax fails';
        }
        return data.coins ? 'collects Tax (+3M)' : 'claims Duke to collect Tax';

      case 'foreign-aid':
        return data.coins ? 'receives Foreign Aid (+2M)' : 'claims Foreign Aid';

      case 'steal':
        if (data.coins) {
          return `steals ${data.coins}M from ${data.target}`;
        }
        return 'claims Captain to steal';

      case 'assassinate':
        if (data.result === 'blocked') {
          return 'Assassination blocked!';
        }
        return data.coins ? `assassinates ${data.target}` : 'pays 3M → assassinate';

      case 'exchange':
        return data.result === 'success' ? 'completes exchange' : 'claims Ambassador to exchange';

      case 'investigate':
        return `investigates ${data.target}`;

      case 'coup':
        return data.coins >= 10 ? 'has >10M! Must coup' : 'pays 7M to Coup';

      case 'block':
        return `blocks with ${data.card}`;

      case 'challenge':
        return `challenges ${data.target}`;

      case 'challenge-success':
        return `challenge succeeds against ${data.target}`;

      case 'challenge-fail':
        return `challenge fails against ${data.target}`;

      case 'lose-influence':
        return 'loses influence';

      case 'allow':
        return 'allows action';

      default:
        return '';
    }
  }
}

export const loggingService = new LoggingService();