import { GameLogEntry, Player, LogType } from '../types';
import { GameMessages } from '../messages';

export interface ILoggingService {
  createLog(type: LogType, player: Player, data?: Partial<GameLogEntry>): GameLogEntry;
  createSystemLog(message: string): GameLogEntry;
}

export class LoggingService implements ILoggingService {
  createLog(
    type: LogType, 
    player: Player, 
    data?: Partial<Omit<GameLogEntry, 'type' | 'player' | 'playerColor' | 'timestamp'>>
  ): GameLogEntry {
    // Generate message if not provided
    let message = data?.message;
    if (!message) {
      message = this.generateMessage(type, data || {});
    }

    return {
      type,
      player: player.name,
      playerColor: player.color,
      timestamp: Date.now(),
      ...data,
      message
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

  private generateMessage(type: LogType, data: Record<string, any>): string {
    switch (type) {
      case 'income':
        return GameMessages.results.income;
      
      case 'foreign-aid':
        return data.coins ? GameMessages.results.foreignAid : GameMessages.actions.foreignAid;
      
      case 'banker':
        return data.coins ? GameMessages.results.tax : GameMessages.actions.tax;
      
      case 'steal':
        return data.coins && data.target ? 
          GameMessages.results.steal(data.coins) : 
          GameMessages.actions.steal;
      
      case 'hack':
        return data.target ? 
          GameMessages.results.hack(data.target) : 
          GameMessages.actions.hack;
      
      case 'exchange':
        return GameMessages.results.exchange;
      
      case 'investigate':
        if (data.target) {
          return data.keepCard ? 
            GameMessages.results.investigateKeep() : 
            GameMessages.results.investigateSwap();
        }
        return GameMessages.actions.investigate;
      
      case 'scandal':
        return GameMessages.actions.scandal(data.coins || 0);
      
      case 'block':
        return data.card ? 
          GameMessages.blocks.generic(data.card) : 
          GameMessages.responses.allow;
      
      case 'challenge':
        return data.card ? 
          GameMessages.challenges.success(data.card) : 
          'challenges';
      
      case 'challenge-success':
        return data.card ? 
          GameMessages.challenges.blockSuccess(data.card) : 
          'challenge succeeds';
      
      case 'challenge-fail':
        return data.card ? 
          GameMessages.challenges.blockFail(data.card) : 
          'challenge fails';
      
      case 'lose-influence':
        return GameMessages.responses.loseInfluence;
      
      case 'allow':
        return GameMessages.responses.allow;
      
      default:
        return '';
    }
  }
}

export const loggingService = new LoggingService();