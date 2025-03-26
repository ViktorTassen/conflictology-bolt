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
    noMoreCards: (name: string) => `${name} has no more cards to lose.`,
    stealBlocked: 'The steal was blocked.',
    dukeBluffExposed: (name: string) => `${name} bluff! Block fails.`,
    assassinationBlocked: 'The assassination was blocked.',
    contessaBlock: (name: string) => `${name} may now block with Contessa.`,
    blockingOptions: (name: string) => `${name} may now block with Captain or Ambassador.`,
    secondInfluenceLoss: (name: string) => `${name} loses a second card for failing to challenge the Assassin.`,
    deckReplace: (name: string, card: string) => `${name} revealed ${card}, drew a new card.`,
    cardReveal: (name: string, card: string) => `${name} reveals ${card}, draws new card.`
  },

  // Action claims
  claims: {
    tax: 'claims Duke to collect Tax',
    foreignAid: 'claims Foreign Aid',
    steal: 'claims Captain to steal from',
    assassinate: 'pays $3M → assassinate',
    exchange: 'claims Ambassador to exchange',
    investigate: 'claims Inquisitor to investigate',
    swap: 'claims Inquisitor to swap cards',
    coup: 'pays $7M to Coup',
    coupWithExcess: 'has $10M! Must coup'
  },

  // Action results
  results: {
    income: 'takes Income (+$1M)',
    tax: 'collects Tax with Duke (+$3M)',
    foreignAidSuccess: 'receives Foreign Aid (+$2M)',
    steal: "steals $2M from",
    exchangeComplete: 'completes the 2 cards exchange',
    swapComplete: 'completes the card swap',
    investigateKeep: (targetName?: string) => targetName ?
      `lets ${targetName} keep their card` :
      'lets target keep their card',
    investigateSwap: (targetName?: string) => targetName ?
      `forces ${targetName} to swap their card` :
      'forces target to swap their card',
    foreignAidBlocked: 'Foreign Aid blocked! Gains 0M',
    stealBlocked: 'Steal blocked! Gains 0M',
    assassinationBlocked: 'Assassination blocked!',
    assassinationSucceeds: (targetName?: string) => targetName ?
      `assassinates ${targetName}` :
      'Assassination succeeds!'
  },

  // Blocks
  blocks: {
    generic: (card: string) => `claims ${card} to block`,
    duke: 'blocks with Duke',
    dukeBlockForeignAid: 'blocks Foreign Aid with Duke',
    captain: 'claims Captain to block steal',
    ambassador: 'claims Ambassador to block steal',
    contessa: 'blocks with Contessa'
  },

  // Challenges
  challenges: {
    generic: 'challenges',
    succeedDuke: 'challenges Duke claim! Success',
    failDuke: 'challenges Duke claim! Fails',
    succeedCaptain: 'challenges Captain claim! Success',
    failCaptain: 'challenges Captain claim! Fails',
    succeedAssassin: 'challenges Assassin claim! Success',
    failAssassin: 'challenges Assassin claim! Fails',
    succeedAmbassador: 'challenges Ambassador claim! Success',
    failAmbassador: 'challenges Ambassador claim! Fails',
    succeedInquisitor: 'challenges Inquisitor claim! Success',
    failInquisitor: 'challenges Inquisitor claim! Fails',
    succeedContessa: 'challenges Contessa block! Success',
    failContessa: 'challenges Contessa block! Fails',
    challengeBlockSuccess: (card: string) => `challenges ${card} block! Success`,
    challengeBlockFail: (card: string) => `challenges ${card} block! Fails`
  },

  // Player responses
  responses: {
    allow: 'allows action',
    allowBlock: 'allows block',
    allowSteal: 'allows steal',
    allowAssassination: 'allows assassination',
    loseInfluence: 'loses 1 Influence card',
    eliminated: 'eliminated from game',
    bluffExposed: 'bluff! Loses 1 Influence card',
    taxBluffExposed: 'bluff! Tax fails, loses 1 card'
  }
};