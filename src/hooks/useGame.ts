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
import { Game, Player, GameAction } from '../types';
import { actions, ActionResponse } from '../actions';
import { cardService } from '../services/CardService';
import { loggingService } from '../services/LoggingService';

// Exactly 6 predefined colors for the game with distinct contrast
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
  const usedColors = new Set(existingPlayers.map(p => p.color));
  for (const color of PLAYER_COLORS) {
    if (!usedColors.has(color)) {
      return color;
    }
  }
  return PLAYER_COLORS[0];
};

// Helper to clean objects before sending to Firebase
function cleanFirebaseObject<T>(obj: T | null): T | null {
  if (obj === null || obj === undefined) return null;
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([_, value]) => value !== undefined)
  ) as unknown as T;
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
      const cards = cardService.createDeck();
      
      const initialGame: Game = {
        id: newGameId,
        players: [],
        currentTurn: 0,
        cards,
        logs: [loggingService.createSystemLog(GameMessages.system.gameCreated)],
        status: 'waiting',
        actionInProgress: null,
        responses: {},
        actionUsedThisTurn: false
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

      // Validate and fix card counts if needed
      if (!cardService.validateCardCounts(game.cards)) {
        game.cards = cardService.createDeck();
      }

      // Deal cards to the new player
      const updatedCards = cardService.dealCards(game.cards, [player.id]);

      // Assign a unique color to the player
      const uniqueColor = assignUniqueColor(game.players);
      const completePlayer: Player = {
        ...player,
        color: uniqueColor,
      };

      await updateDoc(gameRef, {
        players: [...game.players, completePlayer],
        cards: updatedCards,
        logs: arrayUnion(loggingService.createSystemLog(GameMessages.system.playerJoined(player.name)))
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
        actionUsedThisTurn: false,
        logs: arrayUnion(loggingService.createSystemLog(GameMessages.system.gameStarted))
      });
    } catch (err) {
      setError('Failed to start game');
      throw err;
    }
  };

  const performAction = async (playerId: number, action: GameAction) => {
    if (!game || !action || playerId < 0 || playerId >= game.players.length) {
      throw new Error('Invalid action parameters');
    }
    
    if (game.actionUsedThisTurn && game.currentTurn === playerId) {
      throw new Error('You have already used your action this turn');
    }
    
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
        
        if (['steal', 'assassinate', 'coup', 'investigate'].includes(action.type) && action.target !== undefined) {
          currentGame.actionInProgress = {
            type: action.type,
            player: playerId,
            target: action.target,
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
        if (result.cards !== undefined) updates.cards = result.cards;
        updates.actionUsedThisTurn = result.actionUsedThisTurn !== undefined ? result.actionUsedThisTurn : true;

        transaction.update(gameRef, updates);
      });
    } catch (err) {
      setError('Failed to perform action');
      throw err;
    }
  };

  const respondToAction = async (playerId: number, response: ActionResponse) => {
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
        if (result.cards !== undefined) updates.cards = result.cards;
        if (result.actionUsedThisTurn !== undefined) updates.actionUsedThisTurn = result.actionUsedThisTurn;

        transaction.update(gameRef, updates);
      });
    } catch (err) {
      setError('Failed to respond to action');
      throw err;
    }
  };

  const isGameOver = game && game.status === 'playing' && 
    game.players.filter(p => !p.eliminated).length === 1;
    
  useEffect(() => {
    const setWinner = async () => {
      if (isGameOver && game && !game.winner) {
        const winner = game.players.findIndex(p => !p.eliminated);
        if (winner !== -1) {
          try {
            const gameRef = doc(db, 'games', game.id);
            await updateDoc(gameRef, {
              winner: winner,
              status: 'waiting' // Change status to waiting (lobby) to keep players in room
            });
          } catch (err) {
            console.error('Failed to set winner:', err);
          }
        }
      }
    };
    
    setWinner();
  }, [isGameOver, game]);
  
  // No vote-related effects needed anymore
  
  const startNewMatch = async () => {
    if (!game) return;
    
    try {
      const gameRef = doc(db, 'games', game.id);
      const cards = cardService.createDeck();
      const updatedCards = cardService.dealCards(cards, game.players.map(p => p.id));
      
      // Create updated player list with reset stats
      const updatedPlayers = game.players.map(player => ({
        ...player,
        coins: 2,
        eliminated: false
      }));
      
      // Get the winner's name for the log message if there was a winner
      let newMatchLogMessage = 'New match started!';
      if (game.winner !== undefined && game.winner >= 0 && game.winner < game.players.length) {
        const previousWinner = game.players[game.winner]?.name;
        newMatchLogMessage = `New match started! Previous winner: ${previousWinner}`;
      }
      
      // Complete game state reset
      await updateDoc(gameRef, {
        status: 'playing',
        players: updatedPlayers,
        cards: updatedCards,
        currentTurn: 0,
        actionInProgress: null,
        responses: {},
        voteNextMatch: {},
        winner: null, // Clear winner so the announcement won't show again
        newMatchCountdownStarted: false,
        newMatchStartTime: null,
        redirectToLobby: false,
        actionUsedThisTurn: false,
        logs: [loggingService.createSystemLog(newMatchLogMessage)]
      });
      
      console.log("Game reset completed - new match started");
    } catch (err) {
      console.error('Failed to start new match', err);
      setError('Failed to start new match');
      throw err;
    }
  };
  
  const leaveGame = async (playerId: number) => {
    if (!game || playerId < 0 || playerId >= game.players.length) {
      throw new Error('Invalid player ID');
    }
    
    try {
      const gameRef = doc(db, 'games', game.id);
      
      // Return player's cards to the deck
      const playerCards = cardService.getPlayerCards(game.cards, playerId);
      const updatedCards = cardService.returnCardsToDeck(game.cards, playerCards.map(c => c.id));
      
      // Mark player as eliminated
      const updatedPlayers = game.players.map((p, i) => 
        i === playerId ? { ...p, eliminated: true } : p
      );
      
      await updateDoc(gameRef, {
        players: updatedPlayers,
        cards: updatedCards,
        logs: arrayUnion(loggingService.createSystemLog(`${game.players[playerId].name} has left the game.`))
      });
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
    startNewMatch,
    leaveGame
  };
}