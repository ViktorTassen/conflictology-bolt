import { useState, useEffect, useRef } from 'react';
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
  
  // Create a new object without undefined values
  const cleaned = {} as Record<string, any>;
  
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  
  return cleaned as unknown as T;
}

export function useGame(gameId?: string, playerId?: number) {
  const [game, setGame] = useState<Game | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [wasKicked, setWasKicked] = useState<boolean>(false);
  const prevPlayersRef = useRef<Player[] | null>(null);

  useEffect(() => {
    if (!gameId) return;

    const unsubscribe = onSnapshot(doc(db, 'games', gameId), (doc) => {
      if (doc.exists()) {
        const gameData = doc.data() as Game;
        setGame(gameData);
        
        // Check if player has been removed from the game (kicked)
        if (playerId !== undefined && prevPlayersRef.current && 
            prevPlayersRef.current.some(p => p.id === playerId) && 
            !gameData.players.some(p => p.id === playerId)) {
          console.log(`Player ${playerId} was removed from the game!`);
          setWasKicked(true);
          
          // No need to set redirectToLobby flag, the wasKicked state will handle the redirect
        }
        
        // Store current players list for comparison next time
        prevPlayersRef.current = gameData.players;
      } else {
        setError('Game not found');
      }
    });

    return () => unsubscribe();
  }, [gameId, playerId]);

  const createGame = async () => {
    try {
      const newGameId = nanoid(6);
      const cards = cardService.createDeck();
      
      const initialGame: Game = {
        id: newGameId,
        players: [],
        currentTurn: 0,
        firstPlayerOfMatch: 0, // Initialize first player (host gets first turn in first match)
        cards,
        logs: [loggingService.createSystemLog(GameMessages.system.gameCreated)],
        status: 'waiting',
        actionInProgress: null,
        responses: {},
        actionUsedThisTurn: false,
        createdAt: Date.now() // Add timestamp for when game was created
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
    
    if (['steal', 'hack', 'scandal'].includes(action.type) && action.target === undefined) {
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
        
        if (['steal', 'hack', 'scandal', 'investigate'].includes(action.type) && action.target !== undefined) {
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
      
      // Rotate first turn to next player in each new match
      const playerCount = updatedPlayers.length;
      // Store which player will go first
      const nextFirstPlayer = (game.firstPlayerOfMatch !== undefined) 
        ? (game.firstPlayerOfMatch + 1) % playerCount
        : 1; // If this is the first rotation, move from player 0 to player 1
      
      const firstPlayerName = updatedPlayers[nextFirstPlayer].name;
      let newMatchLogMessage = `New game started! ${firstPlayerName} will take the first turn.`;

      
      // Complete game state reset
      await updateDoc(gameRef, {
        status: 'playing',
        players: updatedPlayers,
        cards: updatedCards,
        currentTurn: nextFirstPlayer, // Set turn to the rotated player index
        firstPlayerOfMatch: nextFirstPlayer, // Store who went first in this match
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
      
      // Get player name before removing
      const playerName = game.players[playerId].name;
      
      // For consistent behavior, always completely remove the player 
      // instead of just marking them as eliminated
      const updatedPlayers = game.players.filter((_, i) => i !== playerId);
      
      // Adjust current turn index if needed
      let currentTurn = game.currentTurn;
      if (game.status === 'playing') {
        // If the leaving player is the current player, advance to the next player
        if (playerId === game.currentTurn) {
          // Find the next player's index (accounting for the player removal)
          const nextPlayerOriginalIndex = (game.currentTurn + 1) % game.players.length;
          
          // If the next player's index is the same as the leaving player, it means we've wrapped around
          // In this case, we need to stay at index 0
          if (nextPlayerOriginalIndex === playerId) {
            currentTurn = 0;
          } 
          // If the next player's index is greater than the leaving player, it needs to be adjusted down by 1
          else if (nextPlayerOriginalIndex > playerId) {
            currentTurn = nextPlayerOriginalIndex - 1;
          } 
          // If the next player's index is less than the leaving player, it stays the same
          else {
            currentTurn = nextPlayerOriginalIndex;
          }
        }
        // If the leaving player's turn was before the current player,
        // we need to decrement the current turn index
        else if (playerId < game.currentTurn) {
          currentTurn = game.currentTurn - 1;
        }
        // If the leaving player's turn was after the current player,
        // the current turn index stays the same
        
        // Make sure the turn index is still valid after player removal
        const playerCount = updatedPlayers.length;
        if (playerCount > 0) {
          currentTurn = currentTurn % playerCount;
        } else {
          currentTurn = 0;
        }
      }
      
      await updateDoc(gameRef, {
        players: updatedPlayers,
        cards: updatedCards,
        currentTurn: currentTurn,
        logs: arrayUnion(loggingService.createSystemLog(`${playerName} has left the game.`))
      });
      
      // Special case handling for player removal
      if (game.status === 'playing') {
        if (updatedPlayers.length === 1) {
          // If only one player remains, they win by default
          await updateDoc(gameRef, {
            winner: 0, // The only player left is at index 0
            status: 'waiting', // Change to waiting to return to lobby
            logs: arrayUnion(loggingService.createSystemLog(`${updatedPlayers[0].name} wins the game!`))
          });
        } else if (updatedPlayers.length === 0) {
          // If no players remain, the game is over with no winner
          await updateDoc(gameRef, {
            status: 'waiting', // Change to waiting
            logs: arrayUnion(loggingService.createSystemLog(`Game ended - all players have left.`))
          });
        }
      }
    } catch (err) {
      console.error('Failed to leave game:', err);
      setError('Failed to leave game');
      throw err;
    }
  };

  return {
    game,
    error,
    wasKicked,
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