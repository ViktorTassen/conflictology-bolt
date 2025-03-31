/**
 * Game Messages
 * 
 * This file contains all game messages for Conflictology Capitol.
 * Having them in a separate file makes it easier to translate to different languages.
 */

export const GameMessages = {
  // System messages
  system: {
    gameCreated: 'Game room created',
    gameStarted: 'Game started',
    playerJoined: (name: string) => `${name} joined the game`,
    playerEliminated: (name: string) => `${name} has been eliminated!`,
    stealBlocked: 'The steal was blocked.',
    assassinationBlocked: 'The assassination was blocked.',
    blockingOptions: (name: string) => `${name} may now block with Captain or Ambassador.`,
    secondInfluenceLoss: (name: string) => `${name} loses a second card for failing to challenge the Assassin.`,
    cardReveal: (name: string, card: string) => `${name} reveals ${card}.`,
    swapAllowed: (name: string) => `Swap allowed. ${name} selecting cards.`,
    deckReplace: (name: string, card: string) => `${name} revealed ${card}, drew a new card.`
  },

  // Action claims
  actions: {
    tax: 'claims Duke to collect Tax',
    foreignAid: 'claims Foreign Aid',
    steal: 'claims Captain to steal from',
    assassinate: 'pays $3M to assassinate',
    exchange: 'claims Ambassador to exchange',
    investigate: 'claims Inquisitor to investigate',
    swap: 'claims Inquisitor to swap cards',
    coup: (coins: number) => coins >= 10 ? 'has >$10M! Must coup' : 'pays $7M to Coup'
  },

  // Action results
  results: {
    income: 'takes Income (+$1M)',
    tax: 'collects Tax with Duke (+$3M)',
    foreignAid: 'receives Foreign Aid (+$2M)',
    steal: (coins: number, target: string) => `steals $${coins}M from ${target}`,
    exchange: 'completes the 2 cards exchange',
    swap: 'completes the card swap',
    investigateKeep: () => 'lets them keep their card',
    investigateSwap: () => 'forces them to swap their card',
    assassinate: (targetName: string) => `assassinates ${targetName}`
  },

  // Blocks
  blocks: {
    generic: (card: string) => `claims ${card} to block`,
    blockSuccess: (card: string) => `blocks with ${card}`,
    blockFail: (card: string) => `fails to block with ${card}`
  },

  // Challenges
  challenges: {
    generic: 'challenges',
    success: (card: string) => `challenges ${card} claim! Success`,
    fail: (card: string) => `challenges ${card} claim! Fails`,
    blockSuccess: (card: string) => `challenges ${card} block! Success`,
    blockFail: (card: string) => `challenges ${card} block! Fails`
  },

  // Player responses
  responses: {
    allow: 'allows action',
    allowBlock: 'allows to block',
    eliminated: 'eliminated from game',
    loseInfluence: 'loses 1 card of influence',
    showCard: 'shows a card to',
  }
};