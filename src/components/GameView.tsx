import React, { useState, useRef, useEffect } from 'react';
import { Menu, ArrowLeft, Info } from 'lucide-react';
import { Player, GameLogEntry, GameAction, GameState } from '../types';
import { GameLog } from './GameLog';
import { PlayerCard } from './PlayerCard';
import { ActionMenu } from './ActionMenu';
import { BottomPlayerInfo } from './BottomPlayerInfo';
import { InfluenceCards } from './InfluenceCards';
import { ResponseButtons } from './ResponseButtons';
import { LoseInfluenceDialog } from './LoseInfluenceDialog';
import { useGame } from '../hooks/useGame';

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
  const { game, performAction, respondToAction } = useGame(gameId);
  
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

  const isCurrentTurn = game.currentTurn === (playerId - 1);
  const actionInProgress = game.actionInProgress;

  const handleActionSelect = async (action: GameAction) => {
    if (!isCurrentTurn) return;
    
    setSelectedAction(action);
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
      try {
        await performAction(playerId - 1, selectedAction, targetId);
        setSelectedAction(null);
        setTargetedPlayerId(null);
      } catch (error) {
        console.error('Failed to target player:', error);
      }
    }
  };

  const handleResponse = async (response: 'allow' | 'block' | 'challenge', card?: string) => {
    if (!actionInProgress) return;
    
    try {
      await respondToAction(playerId - 1, { 
        type: response,
        playerId: playerId - 1,
        card
      });
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

  const isPlayerTargetable = (id: number) => {
    return selectedAction && 
           ['steal', 'assassinate', 'coup'].includes(selectedAction.type) && 
           id !== (playerId - 1);
  };

  const getGameState = (): GameState => {
    if (actionInProgress) {
      if (actionInProgress.losingPlayer === (playerId - 1)) {
        return 'waiting_for_influence_loss';
      }
      if (actionInProgress.player === (playerId - 1)) {
        if (actionInProgress.blockingPlayer !== undefined) {
          return 'waiting_for_response';
        }
        return 'waiting_for_others';
      }
      return 'waiting_for_response';
    }
    if (selectedAction) {
      return 'waiting_for_target';
    }
    if (isCurrentTurn) {
      return 'waiting_for_action';
    }
    return 'waiting_for_turn';
  };

  const shouldShowResponseButtons = () => {
    if (!actionInProgress) return false;
    
    // Don't show response buttons if player has already responded
    if (actionInProgress.responses[playerId - 1]) return false;

    // Don't show response buttons if player needs to lose influence
    if (actionInProgress.losingPlayer === (playerId - 1)) return false;

    // If there's a blocking player
    if (actionInProgress.blockingPlayer !== undefined) {
      // Original action player can challenge or accept block
      if (actionInProgress.player === (playerId - 1)) {
        return true;
      }
      // Other players (except blocker) can challenge the block
      if (actionInProgress.blockingPlayer !== (playerId - 1)) {
        return true;
      }
      return false;
    }

    // Show initial response buttons (Block/Allow) to other players
    return actionInProgress.player !== (playerId - 1);
  };

  const getResponseButtons = () => {
    if (!actionInProgress) return null;

    // If there's a blocking player
    if (actionInProgress.blockingPlayer !== undefined) {
      // Original action player sees Challenge/Accept block
      if (actionInProgress.player === (playerId - 1)) {
        return {
          showBlock: false,
          showChallenge: true,
          showAllow: true,
          blockText: '',
          challengeText: 'Challenge Duke',
          allowText: 'Accept block'
        };
      }
      // Other players (except blocker) can challenge the block
      if (actionInProgress.blockingPlayer !== (playerId - 1)) {
        return {
          showBlock: false,
          showChallenge: true,
          showAllow: true,
          blockText: '',
          challengeText: 'Challenge Duke',
          allowText: 'Accept block'
        };
      }
    }

    // Initial response buttons for other players
    if (actionInProgress.player !== (playerId - 1)) {
      return {
        showBlock: true,
        showChallenge: false,
        showAllow: true,
        blockText: 'Block with Duke',
        challengeText: '',
        allowText: 'Allow action'
      };
    }

    return null;
  };

  const otherPlayers = game.players
    .map((player, index) => ({ player, index }))
    .filter(({ index }) => index !== (playerId - 1))
    .slice(0, 2);

  const responseButtons = getResponseButtons();
  const gameState = getGameState();

  return (
    <div className="h-full flex flex-col">
      {/* Top navigation */}
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

      {/* Main game area - using flex for better control */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Top players area - fixed height */}
        <div className="h-48 relative">
          {otherPlayers.map(({ player, index }, displayIndex) => (
            <div
              key={index}
              className={`absolute ${
                displayIndex === 0
                  ? "left-1/2 -translate-x-1/2 top-0"
                  : displayIndex === 1
                  ? "left-4 top-16"
                  : "right-4 top-16"
              }`}
            >
              <PlayerCard 
                player={player}
                isActive={game.currentTurn === index}
                isTargetable={isPlayerTargetable(index)}
                isTargeted={targetedPlayerId === index}
                onTargetSelect={() => handlePlayerTarget(index)}
              />
            </div>
          ))}
        </div>

        {/* Game log area - flexible height */}
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
              onBlock={() => handleResponse('block', 'Duke')}
              onChallenge={() => handleResponse('challenge')}
              onAllow={() => handleResponse('allow')}
              visible={true}
              showBlock={responseButtons.showBlock}
              showChallenge={responseButtons.showChallenge}
              showAllow={true}
              blockText={responseButtons.blockText}
              challengeText={responseButtons.challengeText}
              allowText={responseButtons.allowText}
            />
          )}
        </div>

        {/* Bottom player area - fixed height with gradient overlay */}
        <div className="h-32 relative mt-auto">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 px-6 pb-6">
            <div className="flex justify-between items-end">
              <div className="z-20">
                <BottomPlayerInfo player={currentPlayer} />
              </div>

              <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 z-10">
                <InfluenceCards influence={currentPlayer.influence} />
              </div>

              <div className="z-20 relative">
                <button
                  ref={actionButtonRef}
                  onClick={() => setShowActions(!showActions)}
                  className="relative group"
                  disabled={!isCurrentTurn || gameState === 'waiting_for_influence_loss'}
                >
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
                    ${!isCurrentTurn || gameState === 'waiting_for_influence_loss' ? 'opacity-50 cursor-not-allowed' : ''}
                  `}>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-300/10 to-transparent transform -rotate-45 gem-shine" />
                    
                    <div className="absolute inset-0 bg-gradient-to-tl from-slate-700/20 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-600/10 to-transparent" />
                    
                    <div className={`
                      absolute -inset-1
                      bg-slate-400/20
                      blur-lg
                      transition-opacity duration-300
                      ${showActions ? 'opacity-100' : 'opacity-0'}
                    `} />

                    <Menu className={`
                      relative
                      w-6 h-6
                      transition-all duration-300
                      ${showActions ? 'text-slate-300' : 'text-slate-400'}
                      group-hover:text-slate-300
                      transform group-hover:scale-110
                    `} />
                  </div>
                </button>

                {showActions && (
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
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lose influence dialog */}
      {gameState === 'waiting_for_influence_loss' && (
        <LoseInfluenceDialog
          influence={currentPlayer.influence}
          onCardSelect={handleLoseInfluence}
        />
      )}
    </div>
  );
}