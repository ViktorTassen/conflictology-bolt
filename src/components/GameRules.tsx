import { ArrowLeft } from 'lucide-react';
import capitolBg from '../assets/images/capitol-bg.png';
import dukeImg from '../assets/images/duke.png';
import assassinImg from '../assets/images/assassin.png';
import captainImg from '../assets/images/captain.png';
import ambassadorImg from '../assets/images/ambassador.png';
import contessaImg from '../assets/images/contessa.png';
import inquisitorImg from '../assets/images/inquisitor.png';

interface GameRulesProps {
  onBack: () => void;
}

export function GameRules({ onBack }: GameRulesProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <img 
          src={capitolBg} 
          alt="Capitol Background" 
          className="object-cover w-full h-full opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90 z-10" />
      </div>
      
      {/* Header with back button */}
      <div className="flex items-center mb-6 relative z-20 p-4">
        <button 
          className="w-10 h-10 bg-[#2a2a2a]/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-[#333333] transition-colors"
          onClick={onBack}
        >
          <ArrowLeft className="w-5 h-5 text-white/80" />
        </button>
        <h2 className="text-xl font-bold text-white ml-4">Game Rules</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 relative z-20">
        <div className="space-y-6">
          <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl p-5 border border-zinc-800/30">
            <h3 className="text-zinc-300 font-semibold mb-3">Overview</h3>
            <p className="text-zinc-400 text-sm">
              Conflictology: Capitol is a game of deception and influence. Players take on the roles of powerful court members, each trying to eliminate the influence of others while maintaining their own position.
            </p>
          </div>

          <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl p-5 border border-zinc-800/30">
            <h3 className="text-zinc-300 font-semibold mb-3">Basic Actions</h3>
            <div className="space-y-2 text-sm">
              <div className="text-zinc-400">
                <span className="text-zinc-300 font-medium">Income:</span> Take 1 coin
              </div>
              <div className="text-zinc-400">
                <span className="text-zinc-300 font-medium">Foreign Aid:</span> Take 2 coins (can be blocked by Duke)
              </div>
              <div className="text-zinc-400">
                <span className="text-zinc-300 font-medium">Coup:</span> Pay 7 coins to eliminate one influence (cannot be blocked)
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl p-5 border border-zinc-800/30">
            <h3 className="text-zinc-300 font-semibold mb-4">Character Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Duke */}
              <div className="character-card relative overflow-hidden rounded-lg border border-zinc-800/50 bg-gradient-to-br from-blue-900/20 to-blue-950/20 transition-transform hover:scale-[1.02]">
                <div className="absolute inset-0 bg-blue-500/5" />
                <div className="flex flex-col h-full">
                  <div className="flex justify-center pt-3">
                    <div className="w-20 h-28 rounded-lg overflow-hidden shrink-0 shadow-lg shadow-blue-900/20 border border-blue-900/30">
                      <img 
                        src={dukeImg}
                        alt="Duke"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="p-3 text-center">
                    <h4 className="text-blue-400 font-semibold mb-1 text-lg">Duke</h4>
                    <div className="space-y-1 text-sm text-zinc-400">
                      <p>• Action: Take 3 coins as tax</p>
                      <p>• Block: Can block Foreign Aid</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assassin */}
              <div className="character-card relative overflow-hidden rounded-lg border border-zinc-800/50 bg-gradient-to-br from-red-900/20 to-red-950/20 transition-transform hover:scale-[1.02]">
                <div className="absolute inset-0 bg-red-500/5" />
                <div className="flex flex-col h-full">
                  <div className="flex justify-center pt-3">
                    <div className="w-20 h-28 rounded-lg overflow-hidden shrink-0 shadow-lg shadow-red-900/20 border border-red-900/30">
                      <img 
                        src={assassinImg}
                        alt="Assassin"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="p-3 text-center">
                    <h4 className="text-red-400 font-semibold mb-1 text-lg">Assassin</h4>
                    <div className="space-y-1 text-sm text-zinc-400">
                      <p>• Action: Pay 3 coins to assassinate</p>
                      <p>• Can be blocked by Contessa</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Captain */}
              <div className="character-card relative overflow-hidden rounded-lg border border-zinc-800/50 bg-gradient-to-br from-cyan-900/20 to-cyan-950/20 transition-transform hover:scale-[1.02]">
                <div className="absolute inset-0 bg-cyan-500/5" />
                <div className="flex flex-col h-full">
                  <div className="flex justify-center pt-3">
                    <div className="w-20 h-28 rounded-lg overflow-hidden shrink-0 shadow-lg shadow-cyan-900/20 border border-cyan-900/30">
                      <img 
                        src={captainImg}
                        alt="Captain"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="p-3 text-center">
                    <h4 className="text-cyan-400 font-semibold mb-1 text-lg">Captain</h4>
                    <div className="space-y-1 text-sm text-zinc-400">
                      <p>• Action: Steal 2 coins from a player</p>
                      <p>• Block: Can block stealing attempts</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ambassador */}
              <div className="character-card relative overflow-hidden rounded-lg border border-zinc-800/50 bg-gradient-to-br from-green-900/20 to-green-950/20 transition-transform hover:scale-[1.02]">
                <div className="absolute inset-0 bg-green-500/5" />
                <div className="flex flex-col h-full">
                  <div className="flex justify-center pt-3">
                    <div className="w-20 h-28 rounded-lg overflow-hidden shrink-0 shadow-lg shadow-green-900/20 border border-green-900/30">
                      <img 
                        src={ambassadorImg}
                        alt="Ambassador"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="p-3 text-center">
                    <h4 className="text-green-400 font-semibold mb-1 text-lg">Ambassador</h4>
                    <div className="space-y-1 text-sm text-zinc-400">
                      <p>• Action: Exchange cards with Court</p>
                      <p>• Block: Can block stealing attempts</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contessa */}
              <div className="character-card relative overflow-hidden rounded-lg border border-zinc-800/50 bg-gradient-to-br from-purple-900/20 to-purple-950/20 transition-transform hover:scale-[1.02]">
                <div className="absolute inset-0 bg-purple-500/5" />
                <div className="flex flex-col h-full">
                  <div className="flex justify-center pt-3">
                    <div className="w-20 h-28 rounded-lg overflow-hidden shrink-0 shadow-lg shadow-purple-900/20 border border-purple-900/30">
                      <img 
                        src={contessaImg}
                        alt="Contessa"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="p-3 text-center">
                    <h4 className="text-purple-400 font-semibold mb-1 text-lg">Contessa</h4>
                    <div className="space-y-1 text-sm text-zinc-400">
                      <p>• Block: Can block assassination</p>
                      <p>• Defensive character only</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inquisitor */}
              <div className="character-card relative overflow-hidden rounded-lg border border-zinc-800/50 bg-gradient-to-br from-amber-900/20 to-amber-950/20 transition-transform hover:scale-[1.02]">
                <div className="absolute inset-0 bg-amber-500/5" />
                <div className="flex flex-col h-full">
                  <div className="flex justify-center pt-3">
                    <div className="w-20 h-28 rounded-lg overflow-hidden shrink-0 shadow-lg shadow-amber-900/20 border border-amber-900/30">
                      <img 
                        src={inquisitorImg}
                        alt="Inquisitor"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="p-3 text-center">
                    <h4 className="text-amber-400 font-semibold mb-1 text-lg">Inquisitor</h4>
                    <div className="space-y-1 text-sm text-zinc-400">
                      <p>• Action: Look at another's card</p>
                      <p>• Action: Exchange one card</p>
                      <p>• Block: Can block stealing</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl p-5 border border-zinc-800/30">
            <h3 className="text-zinc-300 font-semibold mb-3">Challenges & Blocking</h3>
            <div className="space-y-3 text-sm text-zinc-400">
              <p>
                When a player claims a character action, others can challenge if they don't believe the claim. If the challenge succeeds, the challenged player loses an influence. If it fails, the challenger loses an influence.
              </p>
              <p>
                Some actions can be blocked by specific characters. When blocked, the action fails unless the original player successfully challenges the block.
              </p>
            </div>
          </div>

          <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl p-5 border border-zinc-800/30">
            <h3 className="text-zinc-300 font-semibold mb-3">Winning the Game</h3>
            <p className="text-sm text-zinc-400">
              The last player with influence (face-down cards) remaining wins the game. Players lose influence by being successfully challenged or assassinated, or by being the target of a coup.
            </p>
          </div>

          <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl p-5 border border-zinc-800/30">
            <h3 className="text-zinc-300 font-semibold mb-3">Important Rules</h3>
            <div className="space-y-2 text-sm text-zinc-400">
              <p>• Players must coup if they have 10 or more coins</p>
              <p>• All actions can be challenged</p>
              <p>• Lost influence cards remain face-up</p>
              <p>• Players with no influence are eliminated</p>
              <p>• Blocking and challenging are optional</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}