import React, { useState, useRef, useEffect } from 'react';
import { Menu, ArrowLeft, Info, Skull } from 'lucide-react';
import { Game, Player, GameLogEntry, GameAction, GameState, CardType } from '../types';
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
import { getPlayerCards } from '../utils/cardUtils';

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
        isHost={currentPlayer.id === game.players[0]?.id}
        currentPlayerId={playerId}
        onStartGame={startGame}
        onReturnToMainMenu={onReturnToLobby || (() => {})}
      />
    );
  }

  const playerIndex = game.players.findIndex(player => player.id === playerId);
  const isCurrentTurn = game.currentTurn === playerIndex && !currentPlayer.eliminated;
  const canTakeAction = isCurrentTurn && !game.actionUsedThisTurn;
  const actionInProgress = game.actionInProgress;

  const handleActionSelect = async (action: GameAction) => {
    if (!canTakeAction || currentPlayer.eliminated) return;
    
    if (action.cost && currentPlayer.coins < action.cost) {
      console.error(`Not enough coins for ${action.type}. Need ${action.cost}, have ${currentPlayer.coins}`);
      return;
    }
    
    setSelectedAction(action);
    setTargetedPlayerId(null);
    
    if (['steal', 'assassinate', 'coup', 'investigate'].includes(action.type)) {
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
      setTargetedPlayerId(targetId);
      
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
      }
    }
  };
  
  const cancelTargetSelection = () => {
    setSelectedAction(null);
    setTargetedPlayerId(null);
  };

  const handleResponse = async (response: 'allow' | 'block' | 'challenge', card?: CardType) => {
    if (!actionInProgress || currentPlayer.eliminated) return;
    
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
    
    if ((game.actionInProgress.type !== 'exchange' && game.actionInProgress.type !== 'swap') || 
        game.actionInProgress.player !== playerIndex) {
      console.error('Exchange/Swap attempted by the wrong player or with wrong action type');
      return;
    }
    
    if (!Array.isArray(game.actionInProgress.exchangeCards) || game.actionInProgress.exchangeCards.length === 0) {
      console.error('Exchange/Swap attempted with no cards available');
      return;
    }
    
    // Get active card count from current cards
    const activeCardCount = getPlayerCards(game.cards, playerId).length;
    
    if (keptCardIndices.length !== activeCardCount) {
      console.error(`Wrong number of cards selected: got ${keptCardIndices.length}, expected ${activeCardCount}`);
      return;
    }
    
    try {
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
    
    if (game.actionInProgress.target !== playerIndex) {
      console.error('Investigation card selection attempted by the wrong player');
      return;
    }
    
    try {
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
    
    if (game.actionInProgress.player !== playerIndex) {
      console.error('Investigation decision attempted by the wrong player');
      return;
    }
    
    try {
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
    <div className="h-full flex flex-col">
      <button 
        className="w-10 h-10 bg-zinc-900/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-zinc-800 transition-colors absolute left-4 top-4 z-20 border border-zinc-800/30"
        onClick={() => {
          if (game.status === 'playing' && !currentPlayer.eliminated) {
            setShowLeaveConfirmation(true);
          } else {
            onReturnToLobby?.();
          }
        }}
      >
        <ArrowLeft className="w-5 h-5 text-white/80" />
      </button>
      
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 px-6 pb-6">
            <div className="flex justify-between items-end">
              <div className="z-20">
                <BottomPlayerInfo player={currentPlayer} />
              </div>

              <div className="absolute left-[56%] bottom-6 transform -translate-x-1/2 z-10">
                <InfluenceCards 
                  playerId={playerId} 
                  cards={game.cards} 
                  showFaceUp={true} 
                />
              </div>

              <div className="z-20 relative mr-2">
                {currentPlayer.eliminated ? (
                  <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center">
                    <Skull className="w-8 h-8 text-red-500" />
                  </div>
                ) : (
                  <button
                    ref={actionButtonRef}
                    onClick={() => {
                      if (selectedAction) {
                        setSelectedAction(null);
                        setTargetedPlayerId(null);
                      }
                      setShowActions(!showActions);
                    }}
                    className="relative group"
                    disabled={!canTakeAction || gameState === 'waiting_for_influence_loss'}
                  >
                    {canTakeAction && (
                      <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 fire-pulse" />
                    )}
                    
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
        actionInProgress?.exchangeCards && (
        <ExchangeCardsDialog
          cards={game.cards}
          playerId={playerId}
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
        {selectedAction && ['steal', 'assassinate', 'coup', 'investigate'].includes(selectedAction.type) && (
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
            onVoteNextMatch={() => voteForNextMatch(playerIndex)}
            onLeaveGame={() => {
              leaveGame(playerIndex);
              if (onReturnToLobby) onReturnToLobby();
            }}
          />
        </div>
      )}

      {showLeaveConfirmation && (
        <ConfirmationDialog
          title="Leave Game"
          message="Are you sure you want to leave the game? You will forfeit the match."
          confirmText="Leave Game"
          cancelText="Stay"
          onConfirm={() => {
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