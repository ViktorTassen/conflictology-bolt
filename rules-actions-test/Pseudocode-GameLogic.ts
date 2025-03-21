class Deck {
    constructor() {
      this.cards = [];
      this.reset();
    }
  
    reset() {
      const roles = ['Duke', 'Assassin', 'Captain', 'Ambassador', 'Contessa'];
      this.cards = [];
      for (let role of roles) {
        this.cards.push(role, role, role, role, role, role); // 6 of each role
      }
      this.shuffle();
    }
  
    shuffle() {
      for (let i = this.cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
      }
    }
  
    draw(num = 1) {
      return this.cards.splice(0, num);
    }
  
    returnCards(cards) {
      this.cards.push(...cards);
      this.shuffle();
    }
  }
  
  class Player {
    constructor(name) {
      this.name = name;
      this.coins = 2;
      this.influences = [];
      this.alive = true;
    }
  
    loseInfluence() {
      if (this.influences.length === 0) {
        this.alive = false;
        return null;
      }
      // In real game, player would choose which to lose
      const lost = this.influences.pop();
      return lost;
    }
  
    hasInfluence(role) {
      return this.influences.includes(role);
    }
  
    drawInfluences(deck, count = 2) {
      this.influences.push(...deck.draw(count));
    }
  
    returnInfluences(deck, count = 2) {
      const returned = this.influences.splice(-count, count);
      deck.returnCards(returned);
    }
  }
  
  class CoupGame {
    constructor(players) {
      this.players = players.map(name => new Player(name));
      this.deck = new Deck();
      this.currentPlayerIndex = 0;
      this.currentAction = null;
      this.responseQueue = [];
      
      // Initialize player influences
      this.players.forEach(player => {
        player.drawInfluences(this.deck, 2);
      });
    }
  
    get currentPlayer() {
      return this.players[this.currentPlayerIndex];
    }
  
    nextTurn() {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
      this.currentAction = null;
      this.responseQueue = [];
    }
  
    // Core action handling
    async handleAction(action, target = null) {
      const player = this.currentPlayer;
      
      // Check mandatory Coup
      if (player.coins >= 10 && action !== 'Coup') {
        throw new Error('Must perform Coup when having 10+ coins');
      }
  
      this.currentAction = {
        type: action,
        initiator: player,
        target,
        state: 'PENDING',
        responses: new Map(),
        resolved: false
      };
  
      // Deduct action costs
      if (action === 'Assassinate') player.coins -= 3;
      if (action === 'Coup') player.coins -= 7;
  
      await this.processResponses();
    }
  
    async processResponses() {
      while (!this.currentAction.resolved) {
        const step = this.getNextResponseStep();
        const responses = await this.collectResponses(step);
        this.resolveResponses(responses, step);
      }
      this.nextTurn();
    }
  
    getNextResponseStep() {
      const action = this.currentAction.type;
      let responders = [];
      let options = {};
  
      switch(action) {
        case 'Income':
          this.executeIncome();
          break;
  
        case 'ForeignAid':
          responders = this.players.filter(p => p !== this.currentAction.initiator);
          options = {
            block: 'Duke',
            challenge: false
          };
          break;
  
        case 'Tax':
          responders = this.players.filter(p => p !== this.currentAction.initiator);
          options = { challenge: true };
          break;
  
        case 'Steal':
          responders = [this.currentAction.target];
          options = {
            block: ['Captain', 'Ambassador'],
            challenge: true
          };
          break;
  
        case 'Exchange':
          responders = this.players.filter(p => p !== this.currentAction.initiator);
          options = { challenge: true };
          break;
  
        case 'Assassinate':
          responders = [this.currentAction.target];
          options = {
            block: 'Contessa',
            challenge: true,
            cost: 3
          };
          break;
  
        case 'Coup':
          this.executeCoup();
          break;
      }
  
      return { responders, options };
    }
  
    async collectResponses(step) {
      const responses = new Map();
      for (const player of step.responders) {
        const availableActions = [];
        if (step.options.challenge) availableActions.push('Challenge');
        if (step.options.block) availableActions.push(`Block (${step.options.block})`);
        availableActions.push('Allow');
  
        // Simulate UI choice (in real app, await player input)
        const response = await this.getPlayerResponse(player, availableActions);
        responses.set(player, response);
      }
      return responses;
    }
  
    resolveResponses(responses, step) {
      // Process challenges first
      for (const [player, response] of responses) {
        if (response === 'Challenge') {
          const valid = this.resolveChallenge(player, step);
          if (!valid) {
            player.loseInfluence();
          } else {
            this.currentAction.initiator.loseInfluence();
          }
          this.currentAction.resolved = true;
          return;
        }
      }
  
      // Process blocks
      for (const [player, response] of responses) {
        if (response.startsWith('Block')) {
          const blockValid = this.resolveBlock(player, step.options.block);
          if (blockValid) {
            this.currentAction.resolved = true;
            return;
          }
        }
      }
  
      // Execute action if no blocks/challenges
      this.executeAction();
      this.currentAction.resolved = true;
    }
  
    resolveChallenge(challenger, step) {
      const claimedRole = this.getClaimedRole(this.currentAction.type);
      const actualRole = this.currentAction.initiator.hasInfluence(claimedRole);
      
      if (!actualRole) {
        // Handle failed challenge
        this.deck.returnCards([claimedRole]);
        this.currentAction.initiator.drawInfluences(this.deck, 1);
      }
      
      return actualRole;
    }
  
    resolveBlock(blocker, allowedBlocks) {
      const blockRole = allowedBlocks.includes(blocker.influences);
      if (!blockRole) {
        blocker.loseInfluence();
        return false;
      }
      return true;
    }
  
    getClaimedRole(action) {
      const roleMap = {
        'Tax': 'Duke',
        'Steal': 'Captain',
        'Assassinate': 'Assassin',
        'Exchange': 'Ambassador',
        'ForeignAid': 'Duke'
      };
      return roleMap[action];
    }
  
    // Action executions
    executeIncome() {
      this.currentPlayer.coins += 1;
      this.currentAction.resolved = true;
    }
  
    executeForeignAid() {
      this.currentPlayer.coins += 2;
    }
  
    executeTax() {
      this.currentPlayer.coins += 3;
    }
  
    executeSteal() {
      const amount = Math.min(2, this.currentAction.target.coins);
      this.currentAction.target.coins -= amount;
      this.currentPlayer.coins += amount;
    }
  
    executeExchange() {
      const player = this.currentPlayer;
      const newCards = this.deck.draw(2);
      player.influences.push(...newCards);
      // Player would select 2 to keep (simplified)
      const returned = player.influences.splice(-2, 2);
      this.deck.returnCards(returned);
    }
  
    executeAssassinate() {
      this.currentAction.target.loseInfluence();
    }
  
    executeCoup() {
      this.currentAction.target.loseInfluence();
    }
  
    // Simulated player response
    async getPlayerResponse(player, actions) {
      // In real implementation, this would wait for UI input
      // For simulation, randomly choose an action
      return actions[Math.floor(Math.random() * actions.length)];
    }
  }
  
  // Example usage
  const game = new CoupGame(['Alice', 'Bob', 'Charlie']);
  
  // Simulate a game turn
  async function playTurn() {
    // Player takes Foreign Aid
    await game.handleAction('ForeignAid');
    
    // Other players could block/challenge...
    // Action resolves automatically
  }
  
  playTurn();