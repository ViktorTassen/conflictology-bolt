import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  arrayUnion,
  getDoc,
  runTransaction
} from 'firebase/firestore';
import { GameMessages } from '../messages';
import { nanoid } from 'nanoid';
import { Game, Player, CARDS, CardType, GameAction } from '../types';
import { actions, ActionResponse } from '../actions';

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Each card type should have exactly 3 copies in the deck
function createDeck(): CardType[] {
  // Create a deck with exactly 3 copies of each card type
  const deck: CardType[] = [];
  CARDS.forEach(card => {
    for (let i = 0; i < 3; i++) {
      deck.push(card);
    }
  });
  return shuffleArray(deck);
}

// Helper to clean objects before sending to Firebase
// Removes any keys with undefined values
function cleanFirebaseObject<T>(obj: T | null): T | null {
  if (obj === null || obj === undefined) return null;
  
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([_, value]) => value !== undefined)
  ) as unknown as T;
}

function dealCards(deck: CardType[], numPlayers: number): [CardType[], CardType[][]] {
  const hands: CardType[][] = [];
  const remainingDeck = [...deck];
  
  for (let i = 0; i < numPlayers; i++) {
    const hand = remainingDeck.splice(0, 2);
    hands.push(hand);
  }
  
  return [remainingDeck, hands];
}

// Exactly 6 predefined colors for the game
const PLAYER_COLORS = [
  '#E74C3C', // Red
  '#2ECC71', // Green
  '#3498DB', // Blue
  '#F1C40F', // Yellow
  '#9B59B6', // Purple
  '#E67E22', // Orange
];

// Find a unique color that's not already used by other players
const assignUniqueColor = (existingPlayers: Player[]): string => {
  // Get all colors already in use
  const usedColors = new Set(existingPlayers.map(p => p.color));
  
  // Find the first available color that's not used
  for (const color of PLAYER_COLORS) {
    if (!usedColors.has(color)) {
      return color;
    }
  }
  
  // If all colors are in use (shouldn't happen with max 6 players), use the first color
  return PLAYER_COLORS[0];
};

export function useGame(gameId?: string) {
  const [game, setGame] = useState<Game | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gameId) return;

    const unsubscribe = onSnapshot(doc(db, 'games', gameId), (doc) => {
      if (doc.exists()) {
        setGame(doc.data() as Game);
      } else {
        setError('Game not found');
      }
    });

    return () => unsubscribe();
  }, [gameId]);

  const createGame = async () => {
    try {
      const newGameId = nanoid(6);
      const deck = createDeck();
      
      const initialGame: Game = {
        id: newGameId,
        players: [],
        currentTurn: 0,
        deck,
        logs: [{
          type: 'system',
          player: 'System',
          playerColor: '#9CA3AF',
          timestamp: Date.now(),
          message: GameMessages.system.gameCreated
        }],
        status: 'waiting',
        actionInProgress: null,
        responses: {}
      };

      await setDoc(doc(db, 'games', newGameId), initialGame);
      return newGameId;
    } catch (err) {
      setError('Failed to create game');
      throw err;
    }
  };

  const joinGame = async (gameId: string, player: Omit<Player, 'influence'>) => {
    if (!gameId || !player) {
      throw new Error('Invalid game ID or player data');
    }

    if (!player.id || typeof player.id !== 'number') {
      throw new Error('Invalid player ID');
    }

    try {
      const gameRef = doc(db, 'games', gameId);
      const gameDoc = await getDoc(gameRef);
      
      if (!gameDoc.exists()) {
        throw new Error('Game not found');
      }

      const game = gameDoc.data() as Game;
      
      if (game.players.length >= 6) {
        throw new Error('Game is full');
      }

      if (game.status !== 'waiting') {
        throw new Error('Game has already started');
      }

      if (game.players.some(p => p.id === player.id)) {
        throw new Error('Player already in game');
      }

      // Assign a unique color to the player
      const uniqueColor = assignUniqueColor(game.players);

      // We're not dealing cards when joining, only when the game starts
      const completePlayer: Player = {
        ...player,
        color: uniqueColor, // Override any color passed in with a unique one
        coins: 2, // Start with 2 coins
        influence: [], // Empty influence array until game starts
        lastActivity: Date.now() // Initialize lastActivity timestamp
      };

      await updateDoc(gameRef, {
        players: [...game.players, completePlayer],
        logs: arrayUnion({
          type: 'system',
          player: 'System',
          playerColor: '#9CA3AF',
          timestamp: Date.now(),
          message: GameMessages.system.playerJoined(player.name)
        })
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join game');
      throw err;
    }
  };

  const startGame = async () => {
    if (!gameId) return;

    try {
      const gameRef = doc(db, 'games', gameId);
      
      // Get the current game state
      const gameDoc = await getDoc(gameRef);
      if (!gameDoc.exists()) {
        throw new Error('Game not found');
      }
      
      const currentGame = gameDoc.data() as Game;
      
      // Create a new shuffled deck at game start
      const newDeck = createDeck();
      
      // Deal cards to all players
      const [remainingDeck, hands] = dealCards(newDeck, currentGame.players.length);
      
      // Update each player with their new cards
      const updatedPlayers = currentGame.players.map((player, index) => ({
        ...player,
        influence: hands[index].map(card => ({
          card,
          revealed: false
        }))
      }));
      
      // Update the game with the new state
      await updateDoc(gameRef, {
        status: 'playing',
        players: updatedPlayers,
        deck: remainingDeck,
        logs: arrayUnion({
          type: 'system',
          player: 'System',
          playerColor: '#9CA3AF',
          timestamp: Date.now(),
          message: GameMessages.system.gameStarted
        })
      });
    } catch (err) {
      setError('Failed to start game');
      throw err;
    }
  };

  const performAction = async (
    playerId: number,
    action: GameAction
  ) => {
    if (!game || !action || playerId < 0 || playerId >= game.players.length) {
      throw new Error('Invalid action parameters');
    }
    
    // Validate target for actions that require one
    if (['steal', 'assassinate', 'coup'].includes(action.type) && action.target === undefined) {
      throw new Error(`${action.type} requires a target`);
    }

    const gameRef = doc(db, 'games', game.id);
    const player = game.players[playerId];

    if (!player) {
      throw new Error('Player not found');
    }

    try {
      await runTransaction(db, async (transaction) => {
        const gameDoc = await transaction.get(gameRef);
        if (!gameDoc.exists()) {
          throw new Error('Game not found');
        }

        const currentGame = gameDoc.data() as Game;
        const actionHandler = actions[action.type];

        if (!actionHandler) {
          throw new Error('Invalid action type');
        }
        
        // For targeted actions, set up the actionInProgress with target
        if (['steal', 'assassinate', 'coup'].includes(action.type) && action.target !== undefined) {
          currentGame.actionInProgress = {
            type: action.type,
            player: playerId,
            target: action.target,
            responseDeadline: Date.now() + 10000,
            responses: {},
            resolved: false
          };
        }

        const result = await actionHandler.execute({
          game: currentGame,
          player,
          playerId,
          transaction,
          db
        });

        if (result.logs) {
          result.logs.forEach(log => {
            // Clean log object before using arrayUnion to prevent undefined values
            const cleanedLog = cleanFirebaseObject(log);
            if (cleanedLog) {
              transaction.update(gameRef, {
                logs: arrayUnion(cleanedLog)
              });
            }
          });
        }

        const updates: Partial<Game> = {};
        if (result.players) updates.players = result.players;
        if (result.currentTurn !== undefined) updates.currentTurn = result.currentTurn;
        if (result.actionInProgress !== undefined) updates.actionInProgress = cleanFirebaseObject(result.actionInProgress);
        if (result.responses !== undefined) updates.responses = result.responses;

        transaction.update(gameRef, updates);
      });
    } catch (err) {
      setError('Failed to perform action');
      throw err;
    }
  };

  const respondToAction = async (
    playerId: number,
    response: ActionResponse
  ) => {
    if (!game || !game.actionInProgress || playerId < 0 || playerId >= game.players.length) {
      throw new Error('Invalid response parameters');
    }

    const gameRef = doc(db, 'games', game.id);
    const player = game.players[playerId];

    if (!player) {
      throw new Error('Player not found');
    }

    try {
      await runTransaction(db, async (transaction) => {
        const gameDoc = await transaction.get(gameRef);
        if (!gameDoc.exists()) {
          throw new Error('Game not found');
        }

        const currentGame = gameDoc.data() as Game;
        if (!currentGame.actionInProgress) return;

        const actionHandler = actions[currentGame.actionInProgress.type];
        if (!actionHandler) {
          throw new Error('Invalid action type');
        }

        const result = await actionHandler.respond({
          game: currentGame,
          player,
          playerId,
          transaction,
          db
        }, response);

        if (result.logs) {
          result.logs.forEach(log => {
            // Clean log object before using arrayUnion to prevent undefined values
            const cleanedLog = cleanFirebaseObject(log);
            if (cleanedLog) {
              transaction.update(gameRef, {
                logs: arrayUnion(cleanedLog)
              });
            }
          });
        }

        const updates: Partial<Game> = {};
        if (result.players) updates.players = result.players;
        if (result.currentTurn !== undefined) updates.currentTurn = result.currentTurn;
        if (result.actionInProgress !== undefined) updates.actionInProgress = cleanFirebaseObject(result.actionInProgress);
        if (result.responses !== undefined) updates.responses = result.responses;

        transaction.update(gameRef, updates);
      });
    } catch (err) {
      setError('Failed to respond to action');
      throw err;
    }
  };

  // Check if game is over (only one player remains)
  const isGameOver = game && game.status === 'playing' && 
    game.players.filter(p => !p.eliminated).length === 1;
    
  // Set winner if game is over but winner is not yet set
  useEffect(() => {
    const setWinner = async () => {
      if (isGameOver && game && !game.winner) {
        const winner = game.players.findIndex(p => !p.eliminated);
        if (winner !== -1) {
          try {
            const gameRef = doc(db, 'games', game.id);
            await updateDoc(gameRef, {
              winner: winner,
              // Initialize empty vote object if it doesn't exist
              voteNextMatch: game.voteNextMatch || {}
            });
          } catch (err) {
            console.error('Failed to set winner:', err);
          }
        }
      }
    };
    
    setWinner();
  }, [isGameOver, game]);
  
  // Auto-start new match when all players have voted or redirect to lobby if < 3 players
  useEffect(() => {
    if (!game || !game.voteNextMatch) return;
    
    const voteCount = Object.keys(game.voteNextMatch).length;
    const totalPlayers = game.players.length;
    
    console.log(`Vote count: ${voteCount}/${totalPlayers}, Game state: `, 
                game.newMatchCountdownStarted ? 'starting' : 'waiting');
    
    // If all players have voted, start immediately
    if (voteCount === totalPlayers && voteCount >= 3) {
      console.log("All players voted! Starting new match...");
      
      // Force-start the new match immediately - no intermediate state
      startNewMatch();
    } 
    // If there are less than 3 players who have voted to play
    else if (voteCount < 3 && voteCount === totalPlayers) {
      console.log("Not enough players voted to continue. Redirecting to lobby...");
      
      // Not enough players agreed to start new match, redirect to lobby
      if (!game.redirectToLobby) {
        const gameRef = doc(db, 'games', game.id);
        
        // Mark game as redirecting to lobby
        updateDoc(gameRef, {
          redirectToLobby: true
        });
        
        // In a real app, you'd implement your redirect logic here
        console.log('Not enough players to start new match. Redirecting to lobby...');
      }
    }
  }, [game?.voteNextMatch]);
  
  // Vote for next match
  const voteForNextMatch = async (playerId: number) => {
    if (!game || playerId < 0 || playerId >= game.players.length) {
      throw new Error('Invalid player ID');
    }
    
    try {
      console.log(`Player ${playerId} voting for next match`);
      const gameRef = doc(db, 'games', game.id);
      
      // Create or update the voteNextMatch object
      const voteNextMatch = game.voteNextMatch || {};
      voteNextMatch[playerId] = true;
      
      await updateDoc(gameRef, {
        voteNextMatch
      });
      
      console.log("Vote recorded successfully");
      
      // Check if this vote completes the required votes to start a new match
      const voteCount = Object.keys(voteNextMatch).length;
      if (voteCount === game.players.length && voteCount >= 3) {
        console.log("This was the final vote needed! Starting match directly...");
        // Start immediately if this was the last vote needed
        startNewMatch();
      }
    } catch (err) {
      console.error('Failed to vote for next match', err);
      setError('Failed to vote for next match');
      throw err;
    }
  };
  
  // Start a new match with the same players
  const startNewMatch = async () => {
    if (!game) return;
    
    console.log("Starting new match now!");
    
    try {
      const gameRef = doc(db, 'games', game.id);
      const newDeck = createDeck();
      const playerHands = dealCards(newDeck, game.players.length)[1];
      
      // Reset all players
      const updatedPlayers = game.players.map((player, index) => ({
        ...player,
        coins: 2, // Start with 2 coins
        eliminated: false,
        influence: playerHands[index].map(card => ({
          card,
          revealed: false
        }))
      }));
      
      // Important: Reset all game state completely
      // Firestore doesn't accept undefined values, so we use null instead
      await updateDoc(gameRef, {
        status: 'playing',
        players: updatedPlayers,
        deck: newDeck,
        currentTurn: 0,
        actionInProgress: null,
        responses: {},
        voteNextMatch: {},
        winner: null, // Use null instead of undefined
        newMatchCountdownStarted: false,
        newMatchStartTime: null, // Use null instead of undefined
        redirectToLobby: false,
        logs: [{
          type: 'system',
          player: 'System',
          playerColor: '#9CA3AF',
          timestamp: Date.now(),
          message: 'New match started!'
        }]
      });
      
      console.log("New match started successfully!");
    } catch (err) {
      console.error('Failed to start new match', err);
      setError('Failed to start new match');
      throw err;
    }
  };
  
  // Leave game and return to lobby
  const leaveGame = async (playerId: number) => {
    if (!game || playerId < 0 || playerId >= game.players.length) {
      throw new Error('Invalid player ID');
    }
    
    try {
      console.log(`Player ${playerId} leaving the game`);
      
      // In a production app, you might want to update player status in the database
      // such as removing them from the players array
      
      // We will rely on the caller to handle the navigation
      // This is much better than using window.location.href directly
      console.log('Player left the game');
    } catch (err) {
      console.error('Failed to leave game:', err);
      setError('Failed to leave game');
      throw err;
    }
  };

  return {
    game,
    error,
    createGame,
    joinGame,
    performAction,
    respondToAction,
    startGame,
    isGameOver,
    voteForNextMatch,
    startNewMatch,
    leaveGame
  };
}
