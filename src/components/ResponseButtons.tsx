import React from 'react';
import { ShieldAlert, Swords, Check } from 'lucide-react';

interface ResponseButtonsProps {
  onBlock?: () => void;
  onChallenge?: () => void;
  onAllow?: () => void;
  visible?: boolean;
  showBlock?: boolean;
  showChallenge?: boolean;
  showAllow?: boolean;
  blockText?: string;
  challengeText?: string;
  allowText?: string;
}

export function ResponseButtons({ 
  onBlock, 
  onChallenge, 
  onAllow, 
  visible = true,
  showBlock = true,
  showChallenge = false,
  showAllow = true,
  blockText = "Block with Duke",
  challengeText = "Challenge Duke",
  allowText = "Allow action"
}: ResponseButtonsProps) {
  if (!visible) return null;

  return (
    <div className="bg-[#2a2a2a]/80 backdrop-blur-sm rounded-lg shadow-lg w-full overflow-hidden mt-2 animate-in fade-in slide-in-from-bottom-2">
      <div className="p-2 flex justify-center gap-2">
        {showBlock && (
          <button
            onClick={onBlock}
            className="flex items-center gap-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1.5 rounded-lg transition-colors"
          >
            <ShieldAlert className="w-4 h-4" />
            <span className="text-sm font-medium">{blockText}</span>
          </button>
        )}
        
        {showChallenge && (
          <button
            onClick={onChallenge}
            className="flex items-center gap-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Swords className="w-4 h-4" />
            <span className="text-sm font-medium">{challengeText}</span>
          </button>
        )}
        
        {showAllow && (
          <button
            onClick={onAllow}
            className="flex items-center gap-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">{allowText}</span>
          </button>
        )}
      </div>
    </div>
  );
}