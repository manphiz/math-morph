/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Activity, RotateCcw, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Param } from '../../types';

interface ParameterControlsProps {
  params: Param[];
  activeIdx: number | null;
  onToggleMorph: (idx: number) => void;
  onUpdateParam: (idx: number, val: string) => void;
  onUpdateParamRange: (idx: number, type: 'min' | 'max', val: string) => void;
}

export function ParameterControls({
  params,
  activeIdx,
  onToggleMorph,
  onUpdateParam,
  onUpdateParamRange
}: ParameterControlsProps) {
  const effectiveActiveIdx = activeIdx !== null ? activeIdx : (params.length > 0 ? 0 : null);
  const activeParam = effectiveActiveIdx !== null ? params[effectiveActiveIdx] : null;

  return (
    <AnimatePresence mode="wait">
      {effectiveActiveIdx !== null && activeParam ? (
        <motion.div
          key={effectiveActiveIdx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-[#252525] rounded-xl p-5 border-t-4 shadow-xl mt-4"
          style={{ borderTopColor: activeParam.color }}
        >
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: activeParam.color }}>
              Parameter {effectiveActiveIdx + 1}
            </span>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => onToggleMorph(effectiveActiveIdx)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 ${
                  activeParam.isMorphing 
                    ? 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.5)]' 
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                <Activity className={`w-3 h-3 ${activeParam.isMorphing ? 'animate-pulse' : ''}`} />
                {activeParam.isMorphing ? 'Morphing' : 'Morph'}
              </button>
              <span className="font-code text-lg font-bold">{activeParam.val.toFixed(2)}</span>
            </div>
          </div>

          <div className="relative mt-2">
            {/* Zero Tick Mark */}
            {(() => {
              const minR = activeParam.minRange ?? -5;
              const maxR = activeParam.maxRange ?? 5;
              const range = maxR - minR;
              return minR <= 0 && maxR >= 0 && range > 0 ? (
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-white/20 pointer-events-none z-0"
                  style={{ left: `${((0 - minR) / range) * 100}%` }}
                />
              ) : null;
            })()}
            <input
              type="range"
              min={activeParam.minRange ?? -5}
              max={activeParam.maxRange ?? 5}
              step={activeParam.role === 'exponent' ? 1 : 0.01}
              value={activeParam.val}
              onChange={(e) => onUpdateParam(effectiveActiveIdx, e.target.value)}
              className="w-full h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-[#00d1ff] relative z-10"
              style={{ accentColor: activeParam.color }}
            />
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-white/30 font-mono relative h-4 items-center">
            <input 
              key={`min-${effectiveActiveIdx}-${activeParam.minRange}`}
              type="text"
              className="bg-transparent border-b border-white/20 w-10 text-center focus:outline-none focus:border-white/60 text-white/50"
              defaultValue={activeParam.minRange ?? -5}
              onBlur={(e) => onUpdateParamRange(effectiveActiveIdx, 'min', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onUpdateParamRange(effectiveActiveIdx, 'min', e.currentTarget.value)}
            />
            <div className="absolute left-1/2 -translate-x-1/2 flex gap-1">
              <button 
                onClick={() => onUpdateParam(effectiveActiveIdx, "0")}
                className="px-2 py-0.5 bg-white/5 hover:bg-white/20 rounded border border-white/10 text-[9px] font-bold text-white/60 hover:text-white transition-all active:scale-90"
                title="Set to 0"
              >
                0
              </button>
              <button 
                onClick={() => onUpdateParam(effectiveActiveIdx, activeParam.originalVal.toString())}
                className="px-2 py-0.5 bg-white/5 hover:bg-white/20 rounded border border-white/10 text-[9px] font-bold text-white/60 hover:text-white transition-all active:scale-90"
                title="Reset to Original"
              >
                <RotateCcw className="w-2.5 h-2.5" />
              </button>
            </div>
            <input 
              key={`max-${effectiveActiveIdx}-${activeParam.maxRange}`}
              type="text"
              className="bg-transparent border-b border-white/20 w-10 text-center focus:outline-none focus:border-white/60 text-white/50"
              defaultValue={activeParam.maxRange ?? 5}
              onBlur={(e) => onUpdateParamRange(effectiveActiveIdx, 'max', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onUpdateParamRange(effectiveActiveIdx, 'max', e.currentTarget.value)}
            />
          </div>
        </motion.div>
      ) : (
        <div className="h-full flex flex-col items-center justify-center text-white/20 text-center p-6 border border-dashed border-white/5 rounded-xl mt-4">
          <Info className="w-8 h-8 mb-2 opacity-20" />
          <p className="text-xs">Select a number in the equation to morph its value</p>
        </div>
      )}
    </AnimatePresence>
  );
}
