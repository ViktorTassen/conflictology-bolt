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

      const currentDeck = game.deck || createDeck();
      const [newDeck, hands] = dealCards(currentDeck, game.players.length + 1);
      const playerHand = hands[hands.length - 1];

      const completePlayer: Player = {
        ...player,
        influence: playerHand.map(card => ({ 
          card,
          revealed: false
        }))
      };

      await updateDoc(gameRef, {
        players: [...game.players, completePlayer],
        deck: newDeck,
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
      await updateDoc(gameRef, {
        status: 'playing',
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

  return {
    game,
    error,
    createGame,
    joinGame,
    performAction,
    respondToAction,
    startGame
  };
}
