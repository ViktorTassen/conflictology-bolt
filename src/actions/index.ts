import { ActionHandler } from './types';
import { incomeAction } from './income';
import { foreignAidAction } from './foreignAid';
import { dukeAction } from './duke';
import { assassinateAction } from './assassinate';
import { stealAction } from './steal';
import { exchangeAction } from './exchange';
import { coupAction } from './coup';
import { investigateAction, swapAction } from './inquisitor';
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
  'duke': dukeAction,
  'assassinate': assassinateAction,
  'steal': stealAction,
  'exchange': exchangeAction,
  'coup': coupAction,
  'investigate': investigateAction,
  'swap': swapAction
};