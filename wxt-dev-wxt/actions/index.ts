import { ActionHandler } from './types';
import { incomeAction } from './income';
import { foreignAidAction } from './foreignAid';
import { bankerAction } from './banker';
import { hackAction } from './hacker';
import { stealAction } from './steal';
import { exchangeAction } from './exchange';
import { scandalAction } from './scandal';
import { investigateAction, swapAction } from './police';
import { ResponseType, CardType } from '../types';

// Export the ActionResponse interface directly
export interface ActionResponse {
  type: ResponseType;
  playerId: number;
  card?: CardType;
  selectedIndices?: number[];
  keepCard?: boolean;
}

// Map of action handlers
export const actions: Record<string, ActionHandler> = {
  'income': incomeAction,
  'foreign-aid': foreignAidAction,
  'banker': bankerAction,
  'hack': hackAction,
  'steal': stealAction,
  'exchange': exchangeAction,
  'scandal': scandalAction,
  'investigate': investigateAction,
  'swap': swapAction
};