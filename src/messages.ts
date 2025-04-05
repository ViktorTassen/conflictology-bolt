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
    hackBlocked: 'The hack was blocked.',
    secondCardRequired: (name: string) => `${name} was hacked. Must lose a second card.`,
    swapAllowed: (name: string) => `Swap allowed. ${name} selecting cards.`,
    loseInfluence: (name: string) => `${name} must select a card to lose.`
  },

  // Action claims
  actions: {
    tax: 'claims Banker to collect Tax',
    foreignAid: 'claims Foreign Aid',
    steal: 'claims Mafia to Steal from',
    hack: 'pays $3M to launch a Hack on',
    exchange: 'claims Reporter to Exchange',
    investigate: 'claims Police to Investigate',
    swap: 'claims Police to Swap one card',
    scandal: (coins: number) => coins >= 10 ? 'pays $7M to expose' : 'pays $7M to expose'
  },

  // Action results
  results: {
    income: 'takes Income (+$1M)',
    tax: 'collects Tax with Banker (+$3M)',
    foreignAid: 'receives Foreign Aid (+$2M)',
    steal: (coins: number) => `Steals $${coins}M from`,
    exchange: 'completes the 2 cards Exchange',
    swap: 'completes the card swap',
    investigateKeep: () => 'lets them keep their card',
    investigateSwap: () => 'forces them to swap their card',
    hack: (targetName: string) => `executed Hacker attack on ${targetName}`
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
    success: (card: string) => `challenges ${card} claim.. Success!`,
    fail: (card: string) => `challenges ${card} claim.. Fails!`,
    blockSuccess: (card: string) => `challenges ${card} block.. Success!`,
    blockFail: (card: string) => `challenges ${card} block.. Fails!`
  },

  // Player responses
  responses: {
    allow: 'allows action',
    allowBlock: 'allows to block',
    eliminated: 'eliminated from game',
    loseInfluence: 'lost 1 influence card',
    showCard: 'shows a card to',
  }
};