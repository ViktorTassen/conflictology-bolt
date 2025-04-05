import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Info, Skull, X, LoaderPinwheel } from 'lucide-react';
import yourTurnImage from '../assets/images/your-turn.png';
import { ActionButton } from './ActionButton';
import { GameAction, GameState, CardType } from '../types';
import { GameLog } from './GameLog';
import { PlayerCard } from './PlayerCard';
import { EmptyPlayerCard } from './EmptyPlayerCard';
import { ActionMenu } from './ActionMenu';
import { BottomPlayerInfo } from './BottomPlayerInfo';
import { InfluenceCards } from './InfluenceCards';
import { ResponseButtons } from './ResponseButtons';
import { LoseInfluenceDialog } from './LoseInfluenceDialog';
import { ExchangeCardsDialog } from './ExchangeCardsDialog';
import { SelectCardForInvestigationDialog } from './SelectCardForInvestigationDialog';
import { InvestigateDecisionDialog } from './InvestigateDecisionDialog';
import { GameLobby } from './GameLobby';
import { GameOverScreen } from './GameOverScreen';
import { ConfirmationDialog } from './ConfirmationDialog';
import { CheatSheet } from './CheatSheet';
import { useGame } from '../hooks/useGame';
import { useGameState } from '../hooks/useGameState';
import { TargetSelectionOverlay } from './TargetSelectionOverlay';
import { cardService } from '../services/CardService';
import deskBg from '../assets/images/desk-bg-2.png';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface GameViewProps {
  gameId: string;
  playerId: number;
  onReturnToLobby?: () => void;
}

export function GameView({ gameId, playerId, onReturnToLobby }: GameViewProps) {
  const [showActions, setShowActions] = useState(false);
  const [selectedAction, setSelectedAction] = useState<GameAction | null>(null);
  const [targetedPlayerId, setTargetedPlayerId] = useState<number | null>(null);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [isActionInProgress, setIsActionInProgress] = useState(false);
  const actionButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const {
    game,
    performAction,
    respondToAction,
    startGame,
    isGameOver,
    leaveGame,
    startNewMatch,
    wasKicked
  } = useGame(gameId, playerId);
  const gameStateHelpers = useGameState(game, selectedAction?.type);

  // Handle kick detection
  useEffect(() => {
    if (wasKicked && onReturnToLobby) {
      console.log("Player was kicked! Returning to lobby from GameView");
      onReturnToLobby();
    }
  }, [wasKicked, onReturnToLobby]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (actionButtonRef.current?.contains(event.target as Node)) {
        return;
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowActions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);



  const [visible, setVisible] = useState(false);
  const [animatingOut, setAnimatingOut] = useState(false);

  useEffect(() => {
    if (!game || !playerId) return;

    const playerIndex = game.players.findIndex(player => player.id === playerId);
    const isCurrentTurn = game.currentTurn === playerIndex && !game.players[playerIndex]?.eliminated;

    // Reset visibility when game status changes or game ID changes (new match)
    if (!isCurrentTurn) {
      setVisible(false);
      setAnimatingOut(false);
      return;
    }

    if (isCurrentTurn) {
      setAnimatingOut(false);
      setVisible(true);

      const timer = setTimeout(() => {
        setAnimatingOut(true);
        setTimeout(() => setVisible(false), 500); // Match fadeSlideOut duration
      }, 1500);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [game?.currentTurn, game?.id, game?.status]);

  if (!game) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/80">
        <LoaderPinwheel className="w-12 h-12 text-zinc-800 animate-spin" />
      </div>
    );
  }

  const currentPlayer = game.players.find(player => player.id === playerId);

  if (!currentPlayer) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/80">
        <LoaderPinwheel className="w-12 h-12 text-zinc-800 animate-spin" />
      </div>
    );
  }

  // Check game status or this player's individual view state
  if (game.status === 'waiting' || currentPlayer.tempViewState === 'lobby') {
    return (
      <GameLobby
        game={game}
        isHost={currentPlayer.id === game.players[0]?.id}
        currentPlayerId={playerId}
        onStartGame={game.winner !== undefined ? startNewMatch : startGame}
        onReturnToMainMenu={onReturnToLobby || (() => { })}
      />
    );
  }

  const playerIndex = game.players.findIndex(player => player.id === playerId);
  const isCurrentTurn = game.currentTurn === playerIndex && !currentPlayer.eliminated;
  const canTakeAction = isCurrentTurn && !game.actionUsedThisTurn;
  const actionInProgress = game.actionInProgress;

  const handleActionSelect = async (action: GameAction) => {
    if (!canTakeAction || currentPlayer.eliminated || isActionInProgress) return;

    if (action.cost && currentPlayer.coins < action.cost) {
      console.error(`Not enough coins for ${action.type}. Need ${action.cost}, have ${currentPlayer.coins}`);
      return;
    }

    setSelectedAction(action);
    setTargetedPlayerId(null);

    if (['steal', 'hack', 'scandal', 'investigate'].includes(action.type)) {
      // For actions requiring target, just close the action menu and wait for target selection
      setShowActions(false);
    } else {
      // For immediate actions, show loading state and execute
      setIsActionInProgress(true);
      try {
        await performAction(playerIndex, action);
        setSelectedAction(null);
      } catch (error) {
        console.error('Failed to perform action:', error);
      } finally {
        setIsActionInProgress(false);
      }
    }
  };

  const handlePlayerTarget = async (targetId: number) => {
    if (selectedAction && 
        ['steal', 'hack', 'scandal', 'investigate'].includes(selectedAction.type) && 
        !isActionInProgress) {
      
      setTargetedPlayerId(targetId);
      setIsActionInProgress(true);
      
      try {
        const actionWithTarget = {
          ...selectedAction,
          target: targetId
        };

        await performAction(playerIndex, actionWithTarget);
        setSelectedAction(null);
        setTargetedPlayerId(null);
      } catch (error) {
        console.error('Failed to target player:', error);
      } finally {
        setIsActionInProgress(false);
      }
    }
  };

  const cancelTargetSelection = () => {
    setSelectedAction(null);
    setTargetedPlayerId(null);
  };

  const handleResponse = async (response: 'allow' | 'block' | 'challenge', card?: CardType) => {
    if (!actionInProgress || currentPlayer.eliminated || isActionInProgress) return;

    setIsActionInProgress(true);
    
    try {
      let responseData: any = {
        type: response,
        playerId: playerIndex
      };

      if (card && response === 'block') {
        responseData.card = card;
      }

      await respondToAction(playerIndex, responseData);

      console.log(`Player ${currentPlayer.name} (index ${playerIndex}) responded with ${response}`);
    } catch (error) {
      console.error('Failed to respond:', error);
    } finally {
      setIsActionInProgress(false);
    }
  };

  const handleLoseInfluence = async (cardName: CardType) => {
    if (!actionInProgress || isActionInProgress) return;

    setIsActionInProgress(true);
    
    try {
      // Keep track of the current loseTwo flag to see if we need a second card
      const needSecondCard = actionInProgress.loseTwo;
      
      await respondToAction(playerIndex, {
        type: 'lose_influence',
        playerId: playerIndex,
        card: cardName
      });
      
      // Small delay to ensure the state updates properly before allowing the next selection
      if (needSecondCard) {
        setTimeout(() => {
          setIsActionInProgress(false);
        }, 100);
      } else {
        setIsActionInProgress(false);
      }
    } catch (error) {
      console.error('Failed to lose influence:', error);
      setIsActionInProgress(false);
    }
  };

  const handleExchangeCards = async (keptCardIndices: number[]) => {
    if (!game || !game.actionInProgress || !game.actionInProgress.exchangeCards || isActionInProgress) {
      console.error('Exchange/Swap attempted without proper game state or action in progress');
      return;
    }

    if ((game.actionInProgress.type !== 'exchange' && game.actionInProgress.type !== 'swap') ||
      game.actionInProgress.player !== playerIndex) {
      console.error('Exchange/Swap attempted by the wrong player or with wrong action type');
      return;
    }

    if (!Array.isArray(game.actionInProgress.exchangeCards) || game.actionInProgress.exchangeCards.length === 0) {
      console.error('Exchange/Swap attempted with no cards available');
      return;
    }

    const initiatingPlayer = game.players[game.actionInProgress.player];
    const activeCardCount = cardService.getPlayerCards(game.cards, initiatingPlayer.id).length;

    if (keptCardIndices.length !== activeCardCount) {
      console.error(`Wrong number of cards selected: got ${keptCardIndices.length}, expected ${activeCardCount}`);
      return;
    }

    setIsActionInProgress(true);
    
    try {
      await respondToAction(playerIndex, {
        type: 'exchange_selection',
        playerId: playerIndex,
        selectedIndices: keptCardIndices
      });
    } catch (error) {
      console.error('Failed to exchange/swap cards:', error);
    } finally {
      setIsActionInProgress(false);
    }
  };

  const handleCardSelectForInvestigation = async (card: CardType) => {
    if (!game || !game.actionInProgress || game.actionInProgress.type !== 'investigate' || isActionInProgress) {
      console.error('Investigation card selection attempted without proper game state or action in progress');
      return;
    }

    if (game.actionInProgress.target !== playerIndex) {
      console.error('Investigation card selection attempted by the wrong player');
      return;
    }

    setIsActionInProgress(true);
    
    try {
      await respondToAction(playerIndex, {
        type: 'select_card_for_investigation',
        playerId: playerIndex,
        card
      });
    } catch (error) {
      console.error('Failed to select card for investigation:', error);
    } finally {
      setIsActionInProgress(false);
    }
  };

  const handleInvestigateDecision = async (keepCard: boolean) => {
    if (!game || !game.actionInProgress ||
      game.actionInProgress.type !== 'investigate' ||
      !game.actionInProgress.investigateCard ||
      isActionInProgress) {
      console.error('Investigation decision attempted without proper game state or action in progress');
      return;
    }

    if (game.actionInProgress.player !== playerIndex) {
      console.error('Investigation decision attempted by the wrong player');
      return;
    }

    setIsActionInProgress(true);
    
    try {
      await respondToAction(playerIndex, {
        type: 'investigate_decision',
        playerId: playerIndex,
        keepCard
      });
    } catch (error) {
      console.error('Failed to complete investigation decision:', error);
    } finally {
      setIsActionInProgress(false);
    }
  };

  const isPlayerTargetable = (id: number): boolean | undefined => {
    const targetPlayer = game.players[id];
    return !!(selectedAction &&
      ['steal', 'hack', 'scandal', 'investigate'].includes(selectedAction.type) &&
      id !== playerIndex &&
      !targetPlayer.eliminated);
  };

  const getGameState = (): GameState => {
    return gameStateHelpers.getGameState(playerIndex);
  };

  const shouldShowResponseButtons = () => {
    return gameStateHelpers.shouldShowResponseButtons(playerIndex);
  };

  const getResponseButtons = () => {
    return gameStateHelpers.getResponseOptions(playerIndex);
  };

  const allPlayerSpots = Array(6).fill(null).map((_, index) => {
    const player = game.players[index];
    return {
      index,
      player: player || null
    };
  }).filter(({ index }) => index !== playerIndex);

  const getPlayerPosition = (index: number) => {
    if (index === 0) {
      return 'top-0 left-1/2 -translate-x-1/2';
    }
    if (index === 1) {
      return 'top-20 left-8';
    }
    if (index === 2) {
      return 'top-20 right-8';
    }
    if (index === 3) {
      return 'top-44 left-8';
    }
    if (index === 4) {
      return 'top-44 right-8';
    }
    return '';
  };

  const responseButtons = getResponseButtons();
  const gameState = getGameState();

  return (
    <div className="h-full flex flex-col relative">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={deskBg}
          alt="Game Table Background"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />
      </div>

      {/* Your Turn Banner */}
      {visible && (
        <div className="absolute top-2/4 left-0 right-0 z-30 pointer-events-none flex justify-center items-center">
          <img
            src={yourTurnImage}
            alt="Your Turn"
            className={`max-w-[240px] ${animatingOut ? 'animate-[fadeSlideOut_0.5s_ease-in_forwards]' : 'animate-[fadeSlideIn_0.7s_ease-out]'
              }`}
            style={{
              filter: 'drop-shadow(0 10px 25px rgba(251, 191, 36, 0.5))'
            }}
          />
        </div>
      )}

      <button
        className="w-10 h-10 bg-zinc-900/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-zinc-800 transition-colors absolute left-4 top-4 z-30 border border-zinc-800/30"
        onClick={async () => {
          if (game.status === 'playing' && !currentPlayer.eliminated) {
            // Set only this player's view state to lobby
            const gameRef = doc(db, 'games', game.id);
            const playerIndex = game.players.findIndex(p => p.id === playerId);

            if (playerIndex !== -1) {
              // Create updated players array with player-specific view state
              const updatedPlayers = [...game.players];
              updatedPlayers[playerIndex] = {
                ...updatedPlayers[playerIndex],
                tempViewState: 'lobby'
              };

              // Update Firestore with player-specific view state
              await updateDoc(gameRef, { players: updatedPlayers });
            }
          } else {
            onReturnToLobby?.();
          }
        }}
      >
        <ArrowLeft className="w-5 h-5 text-white/80" />
      </button>

      <button
        className="w-10 h-10 bg-zinc-900/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-zinc-800 transition-colors absolute right-4 top-4 z-30 border border-zinc-800/30"
        onClick={() => setShowCheatSheet(true)}
      >
        <Info className="w-5 h-5 text-white/80" />
      </button>

      {showCheatSheet && (
        <div className="absolute inset-0 bg-[#1a1a1a] z-50 animate-in fade-in">
          <button
            onClick={() => setShowCheatSheet(false)}
            className="w-10 h-10 bg-zinc-900/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-zinc-800 transition-colors absolute right-4 top-4 z-60 border border-zinc-800/30"
          >
            <X className="w-5 h-5 text-white/80" />
          </button>
          <div className="h-full overflow-auto p-2">
            <CheatSheet />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-0 mt-6 relative z-20">
        <div className="h-72 relative">
          {allPlayerSpots.map(({ player, index }, displayIndex) => (
            <div
              key={index}
              className={`absolute ${getPlayerPosition(displayIndex)}`}
            >
              {player ? (
                <PlayerCard
                  player={player}
                  cards={game.cards}
                  isActive={game.currentTurn === index && !player.eliminated}
                  isTargetable={isPlayerTargetable(index)}
                  isTargeted={targetedPlayerId === index}
                  onTargetSelect={() => handlePlayerTarget(index)}
                  isCurrentPlayer={player.id === playerId}
                />
              ) : (
                <EmptyPlayerCard />
              )}
            </div>
          ))}
        </div>

        <div className="flex-1 px-4 overflow-y-auto min-h-0 backdrop-blur-sm rounded-t-xl">
          <GameLog
            logs={game.logs}
            currentPlayer={currentPlayer.name}
            currentPlayerColor={currentPlayer.color}
            gameState={gameState}
            selectedAction={selectedAction?.name}
            game={game}
          />
          {responseButtons && shouldShowResponseButtons() && (
            <ResponseButtons
              onBlock={(card) => handleResponse('block', card)}
              onChallenge={() => handleResponse('challenge')}
              onAllow={() => handleResponse('allow')}
              visible={true}
              showBlock={responseButtons.showBlock}
              showChallenge={responseButtons.showChallenge}
              showAllow={responseButtons.showAllow}
              blockText={responseButtons.blockText}
              challengeText={responseButtons.challengeText}
              allowText={responseButtons.allowText}
              blockCards={responseButtons.blockCards || []}
            />
          )}
        </div>

        <div className="h-32 relative mt-auto mb-2">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 px-6 pb-6">
            <div className="flex justify-between items-end">
              <div className="z-20">
                <BottomPlayerInfo player={currentPlayer} />
              </div>

              <div className="absolute left-[56%] bottom-6 transform -translate-x-1/2 z-10">
                <InfluenceCards
                  playerId={playerId}
                  cards={game.cards}
                />
              </div>

              <div className="z-20 relative mr-2">
                {currentPlayer.eliminated ? (
                  <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center">
                    <Skull className="w-8 h-8 text-red-500" />
                  </div>
                ) : (
                  <ActionButton
                    ref={actionButtonRef}
                    onClick={() => {
                      if (isActionInProgress) return;
                      
                      if (selectedAction) {
                        setSelectedAction(null);
                        setTargetedPlayerId(null);
                      }
                      setShowActions(!showActions);
                    }}
                    disabled={!canTakeAction || gameState === 'waiting_for_influence_loss' || isActionInProgress}
                    canTakeAction={canTakeAction}
                    isCurrentTurn={isCurrentTurn}
                    gameActionUsedThisTurn={!!game.actionUsedThisTurn}
                    isActionInProgress={isActionInProgress}
                    showActions={showActions}
                    gameState={gameState}
                  />
                )}

                {showActions && !currentPlayer.eliminated && (
                  <div
                    ref={menuRef}
                    className="absolute bottom-full right-0 mb-2 z-50"
                    style={{
                      filter: 'drop-shadow(0 20px 30px rgba(0, 0, 0, 0.3))',

                    }}
                  >
                    <ActionMenu
                      onClose={() => setShowActions(false)}
                      onActionSelect={handleActionSelect}
                      playerCoins={currentPlayer.coins}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {gameState === 'waiting_for_influence_loss' && (
        <LoseInfluenceDialog
          cards={game.cards}
          playerId={currentPlayer.id}
          onCardSelect={handleLoseInfluence}
        />
      )}

      {gameState === 'waiting_for_exchange' &&
        actionInProgress?.exchangeCards && (
          <ExchangeCardsDialog
            cards={game.cards}
            playerId={game.players[actionInProgress.player].id}
            exchangeCardIds={actionInProgress.exchangeCards}
            onExchangeComplete={handleExchangeCards}
          />
        )}

      {gameState === 'waiting_for_card_selection' &&
        actionInProgress?.type === 'investigate' && (
          <SelectCardForInvestigationDialog
            cards={game.cards}
            playerId={playerId}
            onCardSelect={handleCardSelectForInvestigation}
          />
        )}

      {gameState === 'waiting_for_investigate_decision' &&
        actionInProgress?.type === 'investigate' &&
        actionInProgress?.investigateCard && (
          <InvestigateDecisionDialog
            card={game.cards[actionInProgress.investigateCard.cardIndex].name}
            targetName={game.players[actionInProgress.target!].name}
            onDecision={handleInvestigateDecision}
          />
        )}

      <div className="pointer-events-none relative">
        {selectedAction && ['steal', 'hack', 'scandal', 'investigate'].includes(selectedAction.type) && (
          <TargetSelectionOverlay
            actionType={selectedAction.type}
            onCancel={cancelTargetSelection}
          />
        )}
      </div>

      {isGameOver && (
        <div className="absolute inset-0 z-50">
          <GameOverScreen
            game={game}
            currentPlayerId={playerId}
            onVoteNextMatch={() => { }} // No longer used but still in the interface
            onLeaveGame={() => { }} // Just close the modal, game state will automatically change to waiting
          />
        </div>
      )}

      {showLeaveConfirmation && (
        <ConfirmationDialog
          title="Leave Game"
          message="Are you sure you want to leave the game? You will forfeit the match and be removed from the game."
          confirmText="Leave Game"
          cancelText="Stay"
          onConfirm={async () => {
            try {
              await leaveGame(playerIndex);
              setShowLeaveConfirmation(false);
              onReturnToLobby?.();
            } catch (error) {
              console.error("Error leaving game:", error);
              // Still return to lobby even if there's an error
              setShowLeaveConfirmation(false);
              onReturnToLobby?.();
            }
          }}
          onCancel={() => setShowLeaveConfirmation(false)}
        />
      )}
    </div>
  );
}