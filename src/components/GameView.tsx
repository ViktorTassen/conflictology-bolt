import React, { useState, useRef, useEffect } from 'react';
import { Menu, ArrowLeft, Info, Skull } from 'lucide-react';
import { Player, GameLogEntry, GameAction, GameState, CardType } from '../types';
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
import { useGame } from '../hooks/useGame';
import { useGameState } from '../hooks/useGameState';
import { TargetSelectionOverlay } from './TargetSelectionOverlay';

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
  const actionButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { 
    game, 
    performAction, 
    respondToAction, 
    startGame, 
    isGameOver,
    voteForNextMatch,
    startNewMatch,
    leaveGame
  } = useGame(gameId);
  const gameStateHelpers = useGameState(game, selectedAction?.type);
  
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

  if (!game) {
    return <div className="p-4 text-white">Loading game...</div>;
  }

  const currentPlayer = game.players.find(player => player.id === playerId);
  
  if (!currentPlayer) {
    return (
      <div className="p-4 text-white">
        Waiting to join game...
      </div>
    );
  }

  if (game.status === 'waiting') {
    return (
      <GameLobby 
        game={game}
        isHost={currentPlayer.id === game.players[0]?.id} // First player is host
        currentPlayerId={playerId}
        onStartGame={startGame}
        onReturnToMainMenu={onReturnToLobby || (() => {})}
      />
    );
  }
  
  // We'll show the game over screen as an overlay, not as a replacement

  // Find current player's index for turn-based game logic
  const playerIndex = game.players.findIndex(player => player.id === playerId);
  const isCurrentTurn = game.currentTurn === playerIndex && !currentPlayer.eliminated;
  const canTakeAction = isCurrentTurn && !game.actionUsedThisTurn;
  const actionInProgress = game.actionInProgress;

  const handleActionSelect = async (action: GameAction) => {
    if (!canTakeAction || currentPlayer.eliminated) return;
    
    // Check if the player has enough coins for the action
    if (action.cost && currentPlayer.coins < action.cost) {
      console.error(`Not enough coins for ${action.type}. Need ${action.cost}, have ${currentPlayer.coins}`);
      return;
    }
    
    setSelectedAction(action);
    setTargetedPlayerId(null); // Reset any previous target
    
    // For actions that require a target
    if (['steal', 'assassinate', 'coup'].includes(action.type)) {
      setShowActions(false);
    } else {
      try {
        await performAction(playerIndex, action);
        setSelectedAction(null);
      } catch (error) {
        console.error('Failed to perform action:', error);
      }
    }
  };

  const handlePlayerTarget = async (targetId: number) => {
    if (selectedAction && ['steal', 'assassinate', 'coup', 'investigate'].includes(selectedAction.type)) {
      // First set the targeted player to provide visual feedback
      setTargetedPlayerId(targetId);
      
      try {
        // Create a modified action with target included
        const actionWithTarget = {
          ...selectedAction,
          // Add target to the action object itself
          target: targetId
        };
        
        await performAction(playerIndex, actionWithTarget);
        setSelectedAction(null);
        setTargetedPlayerId(null);
      } catch (error) {
        console.error('Failed to target player:', error);
        // Keep the selected action so they can try again
      }
    }
  };
  
  const cancelTargetSelection = () => {
    setSelectedAction(null);
    setTargetedPlayerId(null);
  };

  const handleResponse = async (response: 'allow' | 'block' | 'challenge', card?: CardType) => {
    if (!actionInProgress || currentPlayer.eliminated) return;
    
    console.log('Sending response:', response, 'with card:', card);
    
    try {
      // Create a clean response object without undefined values
      let responseData: any = { 
        type: response,
        playerId: playerIndex
      };
      
      // Only include card if it's defined and needed (block actions)
      if (card && response === 'block') {
        responseData.card = card;
      }
      
      console.log('Final response data being sent:', responseData);
      console.log('Player index responding:', playerIndex);
      
      await respondToAction(playerIndex, responseData);
      
      // Show confirmation in console
      console.log(`Player ${currentPlayer.name} (index ${playerIndex}) responded with ${response}`);
    } catch (error) {
      console.error('Failed to respond:', error);
    }
  };

  const handleLoseInfluence = async (cardIndex: number) => {
    if (!actionInProgress) return;
    
    try {
      await respondToAction(playerIndex, {
        type: 'lose_influence',
        playerId: playerIndex,
        card: cardIndex
      });
    } catch (error) {
      console.error('Failed to lose influence:', error);
    }
  };
  
  const handleExchangeCards = async (keptCardIndices: number[]) => {
    if (!game || !game.actionInProgress || !game.actionInProgress.exchangeCards) {
      console.error('Exchange/Swap attempted without proper game state');
      return;
    }
    
    // Make sure the action is properly set up for exchange or swap
    if ((game.actionInProgress.type !== 'exchange' && game.actionInProgress.type !== 'swap') || 
        game.actionInProgress.player !== playerIndex) {
      console.error('Exchange/Swap attempted by the wrong player or with wrong action type');
      return;
    }
    
    // Make sure the exchangeCards array is actually populated
    if (!Array.isArray(game.actionInProgress.exchangeCards) || game.actionInProgress.exchangeCards.length === 0) {
      console.error('Exchange/Swap attempted with no cards available');
      return;
    }
    
    // Validate that we have selected the correct number of cards
    const activeCardCount = currentPlayer.influence.filter(card => !card.revealed).length;
    if (keptCardIndices.length !== activeCardCount) {
      console.error(`Wrong number of cards selected: got ${keptCardIndices.length}, expected ${activeCardCount}`);
      return;
    }
    
    try {
      // Process the exchange/swap
      await respondToAction(playerIndex, {
        type: 'exchange_selection',
        playerId: playerIndex,
        selectedIndices: keptCardIndices
      });
    } catch (error) {
      console.error('Failed to exchange/swap cards:', error);
    }
  };
  
  const handleCardSelectForInvestigation = async (card: CardType) => {
    if (!game || !game.actionInProgress || game.actionInProgress.type !== 'investigate') {
      console.error('Investigation card selection attempted without proper game state');
      return;
    }
    
    // Make sure the action is properly set up for investigation
    if (game.actionInProgress.target !== playerIndex) {
      console.error('Investigation card selection attempted by the wrong player');
      return;
    }
    
    try {
      // Process the card selection for investigation
      await respondToAction(playerIndex, {
        type: 'select_card_for_investigation',
        playerId: playerIndex,
        card
      });
    } catch (error) {
      console.error('Failed to select card for investigation:', error);
    }
  };
  
  const handleInvestigateDecision = async (keepCard: boolean) => {
    if (!game || !game.actionInProgress || 
        game.actionInProgress.type !== 'investigate' || 
        !game.actionInProgress.investigateCard) {
      console.error('Investigation decision attempted without proper game state');
      return;
    }
    
    // Make sure the action is properly set up for investigation decision
    if (game.actionInProgress.player !== playerIndex) {
      console.error('Investigation decision attempted by the wrong player');
      return;
    }
    
    try {
      // Process the investigation decision
      await respondToAction(playerIndex, {
        type: 'investigate_decision',
        playerId: playerIndex,
        keepCard
      });
    } catch (error) {
      console.error('Failed to complete investigation decision:', error);
    }
  };

  const isPlayerTargetable = (id: number) => {
    const targetPlayer = game.players[id];
    return selectedAction && 
           ['steal', 'assassinate', 'coup', 'investigate'].includes(selectedAction.type) && 
           id !== playerIndex &&
           !targetPlayer.eliminated;
  };

  const getGameState = (): GameState => {
    // Use the gameStateHelpers to get the game state
    return gameStateHelpers.getGameState(playerIndex);
  };

  const shouldShowResponseButtons = () => {
    // Use the gameStateHelpers to determine if response buttons should be shown
    return gameStateHelpers.shouldShowResponseButtons(playerIndex);
  };

  const getResponseButtons = () => {
    // Use the gameStateHelpers to get the response options
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
    <div className="h-full flex flex-col">
      {/* Return to lobby button */}
      <button 
        className="w-10 h-10 bg-zinc-900/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-zinc-800 transition-colors absolute left-4 top-4 z-20 border border-zinc-800/30"
        onClick={() => {
          // Show a confirmation dialog if a game is in progress and the player is not eliminated
          if (game.status === 'playing' && !currentPlayer.eliminated) {
            setShowLeaveConfirmation(true);
          } else {
            onReturnToLobby?.();
          }
        }}
      >
        <ArrowLeft className="w-5 h-5 text-white/80" />
      </button>
      
      {/* Independent button - right side */}
      <button 
        className="w-10 h-10 bg-zinc-900/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-zinc-800 transition-colors absolute right-4 top-4 z-20 border border-zinc-800/30"
      >
        <Info className="w-5 h-5 text-white/80" />
      </button>

      <div className="flex-1 flex flex-col min-h-0 mt-6">
        <div className="h-72 relative">
          {allPlayerSpots.map(({ player, index }, displayIndex) => (
            <div
              key={index}
              className={`absolute ${getPlayerPosition(displayIndex)}`}
            >
              {player ? (
                <PlayerCard 
                  player={player}
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

        <div className="flex-1 px-4 overflow-y-auto min-h-0">
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
              onBlock={(card) => {
                console.log('Block selected with card:', card);
                handleResponse('block', card);
              }}
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 px-6 pb-6">
            <div className="flex justify-between items-end">
              <div className="z-20">
                <BottomPlayerInfo player={currentPlayer} />
              </div>

              <div className="absolute left-[56%] bottom-6 transform -translate-x-1/2 z-10">
                <InfluenceCards influence={currentPlayer.influence} showFaceUp={true} />
              </div>

              <div className="z-20 relative mr-2">
                {currentPlayer.eliminated ? (
                  // Red skull icon for eliminated players
                  <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center">
                    <Skull className="w-8 h-8 text-red-500" />
                  </div>
                ) : (
                  <button
                    ref={actionButtonRef}
                    onClick={() => {
                      // Cancel any active target selection when opening action menu
                      if (selectedAction) {
                        setSelectedAction(null);
                        setTargetedPlayerId(null);
                      }
                      setShowActions(!showActions);
                    }}
                    className="relative group"
                    disabled={!canTakeAction || gameState === 'waiting_for_influence_loss'}
                  >
                    {/* Amber fire ornament circle for active turn */}
                    {canTakeAction && (
                      <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 fire-pulse" />
                    )}
                    
                    {/* Gray pulse for turn but used action */}
                    {isCurrentTurn && game.actionUsedThisTurn && (
                      <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-gray-500/20 via-gray-400/30 to-gray-500/20" />
                    )}
                    
                    <div className={`
                      absolute -inset-2
                      rounded-full
                      bg-gradient-to-r from-slate-700 via-slate-500 to-slate-700
                      ${showActions ? 'pulse-ring opacity-100' : 'opacity-0'}
                      group-hover:opacity-100
                      transition-opacity duration-300
                    `} />
                    
                    <div className={`
                      relative
                      w-14 h-14
                      rounded-full
                      bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a]
                      flex items-center justify-center
                      shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_20px_rgba(0,0,0,0.5)]
                      border border-slate-700/50
                      overflow-hidden
                      transition-all duration-300
                      ${showActions ? 'ring-2 ring-slate-400/30' : ''}
                      ${canTakeAction ? 'ring-2 ring-amber-500/30' : ''} 
                      ${isCurrentTurn && game.actionUsedThisTurn ? 'ring-2 ring-gray-500/30' : ''}
                      ${!isCurrentTurn || gameState === 'waiting_for_influence_loss' ? 'opacity-50 cursor-not-allowed' : ''}
                      ${isCurrentTurn && game.actionUsedThisTurn ? 'opacity-70 cursor-not-allowed' : ''}
                    `}>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-300/10 to-transparent transform -rotate-45 gem-shine" />
                      
                      <div className="absolute inset-0 bg-gradient-to-tl from-amber-700/20 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-600/10 to-transparent" />
                      
                      <div className={`
                        absolute -inset-1
                        blur-lg
                        transition-opacity duration-300
                        ${canTakeAction ? 'bg-amber-400/20 opacity-100' : ''}
                        ${isCurrentTurn && game.actionUsedThisTurn ? 'bg-gray-400/20 opacity-100' : ''}
                        ${!isCurrentTurn ? 'bg-amber-400/20 opacity-0' : ''}
                      `} />

                      <Menu className={`
                        relative
                        w-6 h-6
                        transition-all duration-300
                        ${showActions ? 'text-amber-300' : ''}
                        ${canTakeAction ? 'text-amber-300' : ''}
                        ${isCurrentTurn && game.actionUsedThisTurn ? 'text-gray-400' : ''}
                        ${!isCurrentTurn ? 'text-slate-400' : ''}
                        ${canTakeAction ? 'group-hover:text-amber-300' : ''}
                        ${canTakeAction ? 'transform group-hover:scale-110' : ''}
                      `} />
                    </div>
                  </button>
                )}

                {showActions && !currentPlayer.eliminated && (
                  <div 
                    ref={menuRef}
                    className="absolute bottom-full right-0 mb-2"
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
          influence={currentPlayer.influence}
          onCardSelect={handleLoseInfluence}
        />
      )}
      
      {gameState === 'waiting_for_exchange' && 
        actionInProgress?.exchangeCards && ( // Fixed: Show dialog to the player in waiting_for_exchange state
        <ExchangeCardsDialog
          playerInfluence={currentPlayer.influence}
          drawnCards={actionInProgress.exchangeCards}
          onExchangeComplete={handleExchangeCards}
        />
      )}
      
      {/* Card selection dialog for investigation */}
      {gameState === 'waiting_for_card_selection' && 
        actionInProgress?.type === 'investigate' && (
        <SelectCardForInvestigationDialog
          playerInfluence={currentPlayer.influence}
          onCardSelect={handleCardSelectForInvestigation}
        />
      )}

      {/* Investigation decision dialog */}
      {gameState === 'waiting_for_investigate_decision' && 
        actionInProgress?.type === 'investigate' && 
        actionInProgress?.investigateCard && (
        <InvestigateDecisionDialog
          card={actionInProgress.investigateCard.card}
          targetName={game.players[actionInProgress.target!].name}
          onDecision={handleInvestigateDecision}
        />
      )}
      
      {/* Target Selection Overlay - positioned within game container */}
      <div className="pointer-events-none relative">
        {selectedAction && ['steal', 'assassinate', 'coup', 'investigate'].includes(selectedAction.type) && (
          <TargetSelectionOverlay 
            actionType={selectedAction.type} 
            onCancel={cancelTargetSelection} 
          />
        )}
      </div>
      
      {/* Game Over Overlay - shows only when game is over */}
      {isGameOver && (
        <div className="absolute inset-0 z-50">
          <GameOverScreen
            game={game}
            currentPlayerId={playerId}
            onVoteNextMatch={() => voteForNextMatch(playerIndex)}
            onLeaveGame={() => {
              leaveGame(playerIndex);
              if (onReturnToLobby) onReturnToLobby();
            }}
          />
        </div>
      )}

      {/* Leave game confirmation dialog */}
      {showLeaveConfirmation && (
        <ConfirmationDialog
          title="Leave Game"
          message="Are you sure you want to leave the game? You will forfeit the match."
          confirmText="Leave Game"
          cancelText="Stay"
          onConfirm={() => {
            // Eliminate the player from the game when they leave
            leaveGame(playerIndex);
            setShowLeaveConfirmation(false);
            onReturnToLobby?.();
          }}
          onCancel={() => setShowLeaveConfirmation(false)}
        />
      )}
    </div>
  );
}