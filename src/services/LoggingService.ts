import { GameLogEntry, Player, LogType } from '../types';
import { GameMessages } from '../messages';

export interface ILoggingService {
  createLog(type: LogType, player: Player, data?: Partial<GameLogEntry>): GameLogEntry;
  createSystemLog(message: string): GameLogEntry;
  createSpecificSystemLog(messageType: string, params?: any): GameLogEntry;
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

  createSpecificSystemLog(messageType: string, params?: any): GameLogEntry {
    let message = '';
    
    switch (messageType) {
      case 'loseInfluence':
        message = GameMessages.system.loseInfluence(params.playerName);
        break;
      case 'selectCardToShow':
        message = GameMessages.system.selectCardToShow(params.playerName);
        break;
      case 'decideInvestigation':
        message = GameMessages.system.decideInvestigation(params.playerName);
        break;
      case 'stealBlocked':
        message = GameMessages.system.stealBlocked;
        break;
      case 'foreignAidBlocked':
        message = GameMessages.system.foreignAidBlocked;
        break;
      case 'hackBlocked':
        message = GameMessages.system.hackBlocked;
        break;
      case 'secondCardRequired':
        message = GameMessages.system.secondCardRequired(params.playerName);
        break;
      case 'swapAllowed':
        message = GameMessages.system.swapAllowed(params.playerName);
        break;
      case 'exchangeSelecting':
        message = GameMessages.system.exchangeSelecting(params.playerName);
        break;
      default:
        message = params?.message || '';
    }

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
          GameMessages.results.hack : 
          data.targetName ? GameMessages.actions.hack(data.targetName) : GameMessages.actions.hack('');
      
      case 'exchange':
        return data.completed ? GameMessages.results.exchange : GameMessages.actions.exchange;
      
      case 'investigate':
        if (data.result) {
          return data.keepCard ? 
            GameMessages.results.investigateKeep : 
            GameMessages.results.investigateSwap;
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
          GameMessages.challenges.generic;
      
      case 'challenge-success':
        return data.card ? 
          GameMessages.challenges.blockSuccess(data.card) : 
          'challenge succeeds';
      
      case 'challenge-fail':
        return data.card ? 
          GameMessages.challenges.blockFail(data.card) : 
          'challenge fails';
      
      case 'lose-influence':
        return GameMessages.results.loseInfluence;
      
      case 'show-card':
        return GameMessages.results.showCard;
      
      case 'allow':
        if (data.actionType) {
          switch (data.actionType) {
            case 'foreignAid':
              return GameMessages.responses.allowForeignAid;
            case 'tax':
              return GameMessages.responses.allowTax;
            case 'exchange':
              return GameMessages.responses.allowExchange;
            case 'investigate':
              return GameMessages.responses.allowInvestigation;
            case 'swap':
              return GameMessages.responses.allowSwap;
            case 'steal':
              return GameMessages.responses.allowSteal;
            case 'hack':
              return GameMessages.responses.allowHack;
            case 'block':
              return GameMessages.responses.allowBlock;
            default:
              return GameMessages.responses.allow;
          }
        }
        return GameMessages.responses.allow;
      
      default:
        return '';
    }
  }
}

export const loggingService = new LoggingService();