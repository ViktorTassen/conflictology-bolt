import { incomeAction } from './income';
import { foreignAidAction } from './foreignAid';
import { dukeAction } from './duke';
import { ActionHandler } from './types';

export const actions: Record<string, ActionHandler> = {
  income: incomeAction,
  'foreign-aid': foreignAidAction,
  duke: dukeAction,
};

export * from './types';