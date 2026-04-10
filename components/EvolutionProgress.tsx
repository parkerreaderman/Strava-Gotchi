'use client';

import { useMemo } from 'react';

export interface EvolutionInfo {
  stage: number;
  name: string;
  badge: string;
  aura: string | null;
  color: string;
  unlocks: string[];
}

export interface EvolutionProgressData {
  currentStage: EvolutionInfo;
  nextStage: EvolutionInfo | null;
  levelProgress: number;
  ctlProgress: number;
  canEvolve: boolean;
  blockedBy: 'level' | 'ctl' | null;
}

interface EvolutionProgressProps {
  progress: EvolutionProgressData;
  currentLevel: number;
  currentCTL: number;
  className?: string;
}

/**
 * Stage badge icons
 */
const STAGE_ICONS: Record<number, string> = {
  1: '🌱', // Rookie
  2: '🥉', // Regular (Bronze)
  3: '🥈', // Athlete (Silver)
  4: '🥇', // Elite (Gold)
  5: '💎', // Champion (Platinum)
};

/**
 * EvolutionProgress - Pixel-styled evolution progress display
 */
export default function EvolutionProgress({
  progress,
  currentLevel,
  currentCTL,
  className = '',
}: EvolutionProgressProps) {
  const { currentStage, nextStage, levelProgress, ctlProgress, canEvolve, blockedBy } = progress;

  // Requirements for next stage
  const nextRequirements = useMemo(() => {
    if (!nextStage) return null;
    const reqs: Record<number, { level: number; ctl: number }> = {
      2: { level: 10, ctl: 20 },
      3: { level: 25, ctl: 40 },
      4: { level: 50, ctl: 70 },
      5: { level: 75, ctl: 100 },
    };
    return reqs[nextStage.stage];
  }, [nextStage]);

  return (
    <div
      className={`bg-slate-800 rounded-xl overflow-hidden ${className}`}
      style={{ fontFamily: 'monospace' }}
    >
      {/* Header with current stage */}
      <div
        className="p-4"
        style={{
          background: `linear-gradient(135deg, ${currentStage.color}40 0%, ${currentStage.color}20 100%)`,
          borderBottom: `3px solid ${currentStage.color}`,
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
              style={{
                backgroundColor: `${currentStage.color}30`,
                border: `2px solid ${currentStage.color}`,
              }}
            >
              {STAGE_ICONS[currentStage.stage]}
            </div>
            <div>
              <div className="text-white font-bold text-lg">{currentStage.name}</div>
              <div className="text-gray-400 text-xs">Stage {currentStage.stage}/5</div>
            </div>
          </div>
          {currentStage.aura && (
            <div
              className="px-3 py-1 rounded-full text-xs font-bold uppercase"
              style={{
                backgroundColor: `${currentStage.color}30`,
                color: currentStage.color,
                border: `1px solid ${currentStage.color}`,
              }}
            >
              {currentStage.aura} aura
            </div>
          )}
        </div>
      </div>

      {/* Progress section */}
      {nextStage ? (
        <div className="p-4">
          {/* Next stage preview */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-gray-400 text-xs uppercase">Next:</span>
            <span className="text-lg">{STAGE_ICONS[nextStage.stage]}</span>
            <span className="text-white font-bold">{nextStage.name}</span>
          </div>

          {/* Progress bars */}
          <div className="space-y-3">
            {/* Level progress */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-400 text-xs flex items-center gap-1">
                  <span>⭐</span> Level
                </span>
                <span className="text-xs">
                  <span className="text-white font-bold">{currentLevel}</span>
                  <span className="text-gray-500">
                    {' / '}
                    {nextRequirements?.level}
                  </span>
                </span>
              </div>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-500 rounded-full"
                  style={{
                    width: `${levelProgress}%`,
                    backgroundColor:
                      levelProgress >= 100 ? '#22C55E' : nextStage.color,
                    boxShadow:
                      levelProgress >= 100
                        ? '0 0 8px rgba(34, 197, 94, 0.5)'
                        : `0 0 8px ${nextStage.color}50`,
                  }}
                />
              </div>
              {blockedBy === 'level' && (
                <p className="text-amber-400 text-xs mt-1">
                  {nextRequirements!.level - currentLevel} levels to go
                </p>
              )}
            </div>

            {/* CTL progress */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-400 text-xs flex items-center gap-1">
                  <span>💪</span> Fitness (CTL)
                </span>
                <span className="text-xs">
                  <span className="text-white font-bold">{Math.round(currentCTL)}</span>
                  <span className="text-gray-500">
                    {' / '}
                    {nextRequirements?.ctl}
                  </span>
                </span>
              </div>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-500 rounded-full"
                  style={{
                    width: `${ctlProgress}%`,
                    backgroundColor:
                      ctlProgress >= 100 ? '#22C55E' : nextStage.color,
                    boxShadow:
                      ctlProgress >= 100
                        ? '0 0 8px rgba(34, 197, 94, 0.5)'
                        : `0 0 8px ${nextStage.color}50`,
                  }}
                />
              </div>
              {blockedBy === 'ctl' && (
                <p className="text-amber-400 text-xs mt-1">
                  {nextRequirements!.ctl - Math.round(currentCTL)} CTL to go
                </p>
              )}
            </div>
          </div>

          {/* Evolution ready banner */}
          {canEvolve && (
            <div className="mt-4 p-3 bg-gradient-to-r from-emerald-600/30 to-teal-600/30 rounded-lg border border-emerald-500/50">
              <div className="flex items-center gap-2">
                <span className="text-2xl animate-bounce">🎉</span>
                <div>
                  <div className="text-emerald-400 font-bold text-sm">
                    Ready to Evolve!
                  </div>
                  <div className="text-gray-300 text-xs">
                    You can now become a {nextStage.name}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Unlocks preview */}
          <div className="mt-4">
            <div className="text-gray-400 text-xs uppercase mb-2">
              Unlocks at {nextStage.name}:
            </div>
            <div className="flex flex-wrap gap-2">
              {nextStage.unlocks.map((unlock, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-slate-700 rounded text-xs text-gray-300"
                >
                  {unlock}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Max stage reached
        <div className="p-4 text-center">
          <div className="text-4xl mb-2">🏆</div>
          <div className="text-white font-bold text-lg">Maximum Evolution!</div>
          <div className="text-gray-400 text-sm mt-1">
            You have reached the pinnacle of evolution
          </div>
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {currentStage.unlocks.map((unlock, i) => (
              <span
                key={i}
                className="px-2 py-1 rounded text-xs font-bold"
                style={{
                  backgroundColor: `${currentStage.color}30`,
                  color: currentStage.color,
                }}
              >
                {unlock}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
