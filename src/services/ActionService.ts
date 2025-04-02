import { Game, Player, ActionType } from '../types';
import { ILoggingService, loggingService } from './LoggingService';
import { ICardService, cardService } from './CardService';

export interface IActionContext {
  game: Game;
  player: Player;
  playerId: number;
}

export interface IActionResult {
  players?: Player[];
  logs?: any[];
  currentTurn?: number;
  actionInProgress?: Game['actionInProgress'];
  responses?: Game['responses'];
  actionUsedThisTurn?: boolean;
  cards?: Game['cards'];
}

export interface IActionHandler {
  execute(context: IActionContext): Promise<IActionResult>;
  respond(context: IActionContext, response: any): Promise<IActionResult>;
}

export abstract class BaseActionHandler implements IActionHandler {
  constructor(
    protected loggingService: ILoggingService,
    protected cardService: ICardService
  ) {}

  abstract execute(context: IActionContext): Promise<IActionResult>;
  abstract respond(context: IActionContext, response: any): Promise<IActionResult>;

  protected validatePlayer(player: Player): void {
    if (player.eliminated) {
      throw new Error('Eliminated players cannot perform actions');
    }
  }

  protected validateTarget(game: Game, targetId: number): void {
    if (targetId === undefined) {
      throw new Error('Action requires a target');
    }

    const targetPlayer = game.players[targetId];
    if (!targetPlayer || targetPlayer.eliminated) {
      throw new Error('Invalid or eliminated target player');
    }
  }

  protected validateCoins(player: Player, required: number): void {
    if (player.coins < required) {
      throw new Error(`Action requires ${required}M`);
    }
  }

  protected advanceToNextTurn(players: Player[], currentTurn: number): { currentTurn: number, actionUsedThisTurn: boolean } {
    let nextTurn = (currentTurn + 1) % players.length;
    while (players[nextTurn].eliminated) {
      nextTurn = (nextTurn + 1) % players.length;
    }
    return {
      currentTurn: nextTurn,
      actionUsedThisTurn: false
    };
  }
}

export class ActionService {
  private handlers: Map<ActionType, IActionHandler>;

  constructor(
    private loggingService: ILoggingService,
    private cardService: ICardService
  ) {
    this.handlers = new Map();
    // Register handlers here
  }

  async executeAction(
    actionType: ActionType,
    context: IActionContext
  ): Promise<IActionResult> {
    const handler = this.handlers.get(actionType);
    if (!handler) {
      throw new Error(`No handler found for action type: ${actionType}`);
    }
    return handler.execute(context);
  }

  async handleResponse(
    actionType: ActionType,
    context: IActionContext,
    response: any
  ): Promise<IActionResult> {
    const handler = this.handlers.get(actionType);
    if (!handler) {
      throw new Error(`No handler found for action type: ${actionType}`);
    }
    return handler.respond(context, response);
  }
}

export const actionService = new ActionService(loggingService, cardService);