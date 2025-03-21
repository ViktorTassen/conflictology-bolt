import { incomeAction } from './income';
import { foreignAidAction } from './foreignAid';
import { dukeAction } from './duke';
import { stealAction } from './steal';
import { assassinateAction } from './assassinate';
import { exchangeAction } from './exchange';
import { coupAction } from './coup';
import { ActionHandler } from './types';

export const actions: Record<string, ActionHandler> = {
  income: incomeAction,
  'foreign-aid': foreignAidAction,
  duke: dukeAction,
  steal: stealAction,
  assassinate: assassinateAction,
  exchange: exchangeAction,
  coup: coupAction,
};

export * from './types';