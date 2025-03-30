/**
 * Game Messages
 * Central source of truth for all game messages
 */

export const GameMessages = {
  system: {
    gameCreated: 'Game room created',
    gameStarted: 'Game started',
    playerJoined: (name: string) => `${name} joined the game`,
    playerEliminated: (name: string) => `${name} has been eliminated!`,
    stealBlocked: 'The steal was blocked.',
    assassinationBlocked: 'The assassination was blocked.',
    blockingOptions: (name: string) => `${name} may now block with Captain or Ambassador.`,
    secondInfluenceLoss: (name: string) => `${name} loses a second card for failing to challenge the Assassin.`
  },

  actions: {
    income: 'takes Income (+$1M)',
    foreignAid: 'claims Foreign Aid',
    tax: 'claims Duke to collect Tax',
    steal: 'claims Captain to steal from',
    assassinate: 'pays $3M → assassinate',
    exchange: 'claims Ambassador to exchange',
    investigate: 'claims Inquisitor to investigate',
    swap: 'claims Inquisitor to swap cards',
    coup: (coins: number) => coins >= 10 ? 'has >$10M! Must coup' : 'pays $7M to Coup'
  },

  results: {
    income: 'takes Income (+$1M)',
    tax: 'collects Tax with Duke (+$3M)',
    foreignAid: 'receives Foreign Aid (+$2M)',
    steal: (coins: number, target: string) => `steals $${coins}M from ${target}`,
    exchange: 'completes the exchange',
    investigate: {
      keep: (target: string) => `lets ${target} keep their card`,
      swap: (target: string) => `forces ${target} to swap their card`
    },
    assassinate: (target: string) => `assassinates ${target}`
  },

  blocks: {
    duke: 'blocks with Duke',
    captain: 'blocks with Captain',
    ambassador: 'blocks with Ambassador',
    contessa: 'blocks with Contessa',
    generic: (card: string) => `blocks with ${card}`
  },

  challenges: {
    success: (card: string) => `challenges ${card} claim! Success`,
    fail: (card: string) => `challenges ${card} claim! Fails`,
    blockSuccess: (card: string) => `challenges ${card} block! Success`,
    blockFail: (card: string) => `challenges ${card} block! Fails`
  },

  responses: {
    allow: 'allows action',
    loseInfluence: 'loses influence'
  }
};