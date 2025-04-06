import { GameLogEntry, Player, LogType } from '../types';
import { GameMessages } from '../messages';

export interface ILoggingService {
  createLog(type: LogType, player: Player, data?: Partial<GameLogEntry>): GameLogEntry;
  createSystemLog(message: string, playerId?: number, targetId?: number): GameLogEntry;
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

    const log: GameLogEntry = {
      type,
      player: player.name,
      playerColor: player.color,
      timestamp: Date.now(),
      playerId: data?.playerId !== undefined ? data.playerId : player.id,
      message // Keep for backward compatibility but use messageParts
    };
    
    // Create message parts for all log types
    log.messageParts = [];
    
    // Add player ID and target ID for reference (not for display)
    if (data?.targetId !== undefined) {
      log.targetId = data.targetId;
    }
    
    // Construct messageParts based on the log type
    switch (type) {
      case 'allow':
        if (data?.actionType === 'block' && data?.target && data?.targetId !== undefined) {
          // Allow block format: "Player A allows Player B to block"
          log.messageParts = [
            { type: 'text', content: GameMessages.responses.allowBlock + ' ' },
            { type: 'player', content: data.target, playerId: data.targetId, color: data.targetColor || '#FFFFFF' },
            { type: 'text', content: ' ' + GameMessages.responses.allowBlockSuffix }
          ];
        } else if (data?.target && data?.targetId !== undefined) {
          // Standard allow format: "Player A allows [action]"
          log.messageParts = [
            { type: 'text', content: message }
          ];
        } else {
          log.messageParts = [{ type: 'text', content: message }];
        }
        break;
        
      case 'challenge':
      case 'challenge-success':
      case 'challenge-fail':
        // Challenge format: "Player A challenges Banker claim. Success!"
        log.messageParts = [
          { type: 'text', content: message }
        ];
        break;
        
      case 'block':
        // Block format: "Player A claims [Card] to block"
        log.messageParts = [
          { type: 'text', content: message }
        ];
        break;
        
      case 'steal':
        // Special handling for steal results
        if (data?.coins && data?.target && data?.targetId !== undefined) {
          // This is a successful steal result: "Player A steals $2M from Player B"
          log.messageParts = [
            { type: 'text', content: message },
            { type: 'player', content: data.target, playerId: data.targetId, color: data.targetColor || '#FFFFFF' }
          ];
          
          // Also update the legacy message
          log.message = message + data.target;
        } else if (data?.target && data?.targetId !== undefined) {
          // This is a steal attempt: "Player A claims Mafia to Steal from Player B"
          log.messageParts = [
            { type: 'text', content: message },
            { type: 'player', content: data.target, playerId: data.targetId, color: data.targetColor || '#FFFFFF' }
          ];
          
          // Also update the legacy message
          log.message = message + data.target;
        } else {
          // Fallback for any other steal message
          log.messageParts = [
            { type: 'text', content: message }
          ];
        }
        break;
        
      case 'scandal':
        // Special handling for scandal action: "Player A pays $7M to expose Player B in a Scandal"
        if (data?.target && data?.targetId !== undefined) {
          log.messageParts = [
            { type: 'text', content: message + ' ' },
            { type: 'player', content: data.target, playerId: data.targetId, color: data.targetColor || '#FFFFFF' }
          ];
          
          // Also update the legacy message
          log.message = message + ' ' + data.target;
        } else {
          // Fallback for scandal message without target
          log.messageParts = [
            { type: 'text', content: message }
          ];
        }
        break;
        
      case 'hack':
      case 'income':
      case 'foreign-aid':
      case 'banker':
      case 'exchange':
      case 'investigate':
        // Action formats
        if (data?.target && data?.targetId !== undefined) {
          // Action with target: "Player A [action] Player B"
          log.messageParts = [
            { type: 'text', content: message + ' ' },
            { type: 'player', content: data.target, playerId: data.targetId, color: data.targetColor || '#FFFFFF' }
          ];
        } else {
          // Action without target
          log.messageParts = [
            { type: 'text', content: message }
          ];
        }
        break;
        
      default:
        // Default for any other log type
        log.messageParts = [
          { type: 'text', content: message }
        ];
    }
    
    // Add all other properties from data, except those we've already handled
    for (const key in data) {
      if (key !== 'playerId' && key !== 'targetId' && key !== 'message' && 
          key !== 'messageParts' && data[key] !== undefined) {
        log[key] = data[key];
      }
    }
    
    return log;
  }

  createSystemLog(message: string, playerId?: number, targetId?: number): GameLogEntry {
    const log: GameLogEntry = {
      type: 'system',
      player: "",
      playerColor: '#9CA3AF',
      timestamp: Date.now(),
      message, // Keep for backward compatibility
      messageParts: [
        { type: 'text', content: message }
      ]
    };
    
    // Only add these properties if they're defined
    if (playerId !== undefined) log.playerId = playerId;
    if (targetId !== undefined) log.targetId = targetId;
    
    return log;
  }

  createSpecificSystemLog(messageType: string, params?: any): GameLogEntry {
    let message = '';
    let playerId = params?.playerId;
    let targetId = params?.targetId;
    let playerName = params?.playerName;
    
    switch (messageType) {
      case 'loseInfluence':
        message = GameMessages.system.loseInfluence(playerName);
        playerId = params.playerId;
        break;
      case 'selectCardToShow':
        message = GameMessages.system.selectCardToShow(playerName);
        playerId = params.playerId;
        break;
      case 'decideInvestigation':
        message = GameMessages.system.decideInvestigation(playerName);
        playerId = params.playerId;
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
        message = GameMessages.system.secondCardRequired(playerName);
        playerId = params.playerId;
        break;
      case 'swapAllowed':
        message = GameMessages.system.swapAllowed(playerName);
        playerId = params.playerId;
        break;
      case 'exchangeSelecting':
        message = GameMessages.system.exchangeSelecting(playerName);
        playerId = params.playerId;
        break;
      default:
        message = params?.message || '';
    }

    const log: GameLogEntry = {
      type: 'system',
      player: 'System',
      playerColor: '#9CA3AF',
      timestamp: Date.now(),
      message, // Keep for backward compatibility
      messageParts: []
    };
    
    // System messages should display player names as regular text (no special formatting)
    // Don't separate the player name as a different type of message part
    log.messageParts = [
      { type: 'text', content: message }
    ];
    
    // Only add these properties if they're defined
    if (playerId !== undefined) log.playerId = playerId;
    if (targetId !== undefined) log.targetId = targetId;
    
    return log;
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
        return data.coins ? 
          GameMessages.results.hack : 
          data.target ? GameMessages.actions.hack : GameMessages.actions.hack;
      
      case 'exchange':
        return data.completed ? GameMessages.results.exchange : GameMessages.actions.exchange;
      
      case 'investigate':
        if (data.result) {
          // For investigate result, we may need to adapt for player ID coloring
          if (data.keepCard) {
            return GameMessages.results.investigateKeep;
          } else {
            return GameMessages.results.investigateSwap;
          }
        }
        return GameMessages.actions.investigate;
      
      case 'scandal':
        return GameMessages.actions.scandal(data.coins || 0);
      
      case 'block':
        if (data.card) {
          switch (data.card) {
            case 'Banker':
              return GameMessages.blocks.banker;
            case 'Judge':
              return GameMessages.blocks.judge;
            case 'Mafia':
              return GameMessages.blocks.mafia;
            case 'Police':
              return GameMessages.blocks.police;
            case 'Reporter':
              return GameMessages.blocks.reporter;
            default:
              // Fallback to old format if needed
              return `claims ${data.card} to block`;
          }
        }
        return GameMessages.responses.allow;
      
      case 'challenge':
        return data.card ? 
          GameMessages.challenges.success(data.card) : 
          'challenges'; // Simplified generic challenge message
      
      case 'challenge-success':
        return data.card ? 
          GameMessages.challenges.success(data.card) : 
          'challenge succeeds';
      
      case 'challenge-fail':
        return data.card ? 
          GameMessages.challenges.fail(data.card) : 
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