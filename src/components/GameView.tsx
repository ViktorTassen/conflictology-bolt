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
import { GameLobby } from './GameLobby';
import { useGame } from '../hooks/useGame';
import { useGameState } from '../hooks/useGameState';
import { TargetSelectionOverlay } from './TargetSelectionOverlay';

interface GameViewProps {
  gameId: string;
  playerId: number;
}

export function GameView({ gameId, playerId }: GameViewProps) {
  const [showActions, setShowActions] = useState(false);
  const [selectedAction, setSelectedAction] = useState<GameAction | null>(null);
  const [targetedPlayerId, setTargetedPlayerId] = useState<number | null>(null);
  const actionButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { game, performAction, respondToAction, startGame } = useGame(gameId);
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

  const currentPlayer = game.players[playerId - 1];
  
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
        isHost={playerId === 1}
        onStartGame={startGame}
      />
    );
  }

  const isCurrentTurn = game.currentTurn === (playerId - 1) && !currentPlayer.eliminated;
  const actionInProgress = game.actionInProgress;

  const handleActionSelect = async (action: GameAction) => {
    if (!isCurrentTurn || currentPlayer.eliminated) return;
    
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
        await performAction(playerId - 1, action);
        setSelectedAction(null);
      } catch (error) {
        console.error('Failed to perform action:', error);
      }
    }
  };

  const handlePlayerTarget = async (targetId: number) => {
    if (selectedAction && ['steal', 'assassinate', 'coup'].includes(selectedAction.type)) {
      // First set the targeted player to provide visual feedback
      setTargetedPlayerId(targetId);
      
      try {
        // Create a modified action with target included
        const actionWithTarget = {
          ...selectedAction,
          // Add target to the action object itself
          target: targetId
        };
        
        await performAction(playerId - 1, actionWithTarget);
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
      // Debug the response to see what's happening
      const responseData = { 
        type: response,
        playerId: playerId - 1,
        card: card as CardType
      };
      
      console.log('Response data:', responseData);
      
      await respondToAction(playerId - 1, responseData);
    } catch (error) {
      console.error('Failed to respond:', error);
    }
  };

  const handleLoseInfluence = async (cardIndex: number) => {
    if (!actionInProgress) return;
    
    try {
      await respondToAction(playerId - 1, {
        type: 'lose_influence',
        playerId: playerId - 1,
        card: cardIndex
      });
    } catch (error) {
      console.error('Failed to lose influence:', error);
    }
  };
  
  const handleExchangeCards = async (keptCardIndices: number[]) => {
    if (!game || !game.actionInProgress || !game.actionInProgress.exchangeCards) {
      console.error('Exchange attempted without proper game state');
      return;
    }
    
    // Make sure the action is properly set up for exchange
    if (game.actionInProgress.type !== 'exchange' || game.actionInProgress.player !== (playerId - 1)) {
      console.error('Exchange attempted by the wrong player or with wrong action type');
      return;
    }
    
    // Make sure the exchangeCards array is actually populated
    if (!Array.isArray(game.actionInProgress.exchangeCards) || game.actionInProgress.exchangeCards.length === 0) {
      console.error('Exchange attempted with no cards available');
      return;
    }
    
    // Validate that we have selected the correct number of cards
    const activeCardCount = currentPlayer.influence.filter(card => !card.revealed).length;
    if (keptCardIndices.length !== activeCardCount) {
      console.error(`Wrong number of cards selected: got ${keptCardIndices.length}, expected ${activeCardCount}`);
      return;
    }
    
    try {
      // Process the exchange
      await respondToAction(playerId - 1, {
        type: 'exchange_selection',
        playerId: playerId - 1,
        selectedIndices: keptCardIndices
      });
    } catch (error) {
      console.error('Failed to exchange cards:', error);
    }
  };

  const isPlayerTargetable = (id: number) => {
    const targetPlayer = game.players[id];
    return selectedAction && 
           ['steal', 'assassinate', 'coup'].includes(selectedAction.type) && 
           id !== (playerId - 1) &&
           !targetPlayer.eliminated;
  };

  const getGameState = (): GameState => {
    // Use the gameStateHelpers to get the game state
    return gameStateHelpers.getGameState(playerId - 1);
  };

  const shouldShowResponseButtons = () => {
    // Use the gameStateHelpers to determine if response buttons should be shown
    return gameStateHelpers.shouldShowResponseButtons(playerId - 1);
  };

  const getResponseButtons = () => {
    // Use the gameStateHelpers to get the response options
    return gameStateHelpers.getResponseOptions(playerId - 1);
  };

  const allPlayerSpots = Array(6).fill(null).map((_, index) => {
    const player = game.players[index];
    return {
      index,
      player: player || null
    };
  }).filter(({ index }) => index !== (playerId - 1));

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
      <div className="flex justify-between p-4 z-10">
        <button 
          className="w-10 h-10 bg-[#2a2a2a]/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-[#333333] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white/80" />
        </button>
        <button 
          className="w-10 h-10 bg-[#2a2a2a]/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-[#333333] transition-colors"
        >
          <Info className="w-5 h-5 text-white/80" />
        </button>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
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

        <div className="h-32 relative mt-auto">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 px-6 pb-6">
            <div className="flex justify-between items-end">
              <div className="z-20">
                <BottomPlayerInfo player={currentPlayer} />
              </div>

              <div className="absolute left-1/2 bottom-12 transform -translate-x-1/2 z-10">
                <InfluenceCards influence={currentPlayer.influence} />
              </div>

              <div className="z-20 relative">
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
                    disabled={!isCurrentTurn || gameState === 'waiting_for_influence_loss'}
                  >
                    {/* Amber fire ornament circle */}
                    {isCurrentTurn && (
                      <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 fire-pulse" />
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
                      ${isCurrentTurn ? 'ring-2 ring-amber-500/30' : ''}
                      ${!isCurrentTurn || gameState === 'waiting_for_influence_loss' ? 'opacity-50 cursor-not-allowed' : ''}
                    `}>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-300/10 to-transparent transform -rotate-45 gem-shine" />
                      
                      <div className="absolute inset-0 bg-gradient-to-tl from-amber-700/20 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-600/10 to-transparent" />
                      
                      <div className={`
                        absolute -inset-1
                        bg-amber-400/20
                        blur-lg
                        transition-opacity duration-300
                        ${showActions || isCurrentTurn ? 'opacity-100' : 'opacity-0'}
                      `} />

                      <Menu className={`
                        relative
                        w-6 h-6
                        transition-all duration-300
                        ${showActions || isCurrentTurn ? 'text-amber-300' : 'text-slate-400'}
                        group-hover:text-amber-300
                        transform group-hover:scale-110
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
      
      {/* Target Selection Overlay - positioned within game container */}
      <div className="pointer-events-none relative">
        {selectedAction && ['steal', 'assassinate', 'coup'].includes(selectedAction.type) && (
          <TargetSelectionOverlay 
            actionType={selectedAction.type} 
            onCancel={cancelTargetSelection} 
          />
        )}
      </div>
    </div>
  );
}