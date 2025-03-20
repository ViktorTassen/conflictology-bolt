import { incomeAction } from './income';
import { foreignAidAction } from './foreignAid';
import { ActionHandler } from './types';

export const actions: Record<string, ActionHandler> = {
  income: incomeAction,
  'foreign-aid': foreignAidAction,
};

export * from './types';