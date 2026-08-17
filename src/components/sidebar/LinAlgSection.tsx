/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Activity, Info } from 'lucide-react';
import { LINALG_PRESETS } from '../../constants/presets';

interface LinAlgSectionProps {
  matrix: number[][];
  setMatrix: (matrix: number[][]) => void;
}

export function LinAlgSection({ matrix, setMatrix }: LinAlgSectionProps) {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <label className="text-[11px] text-white/40 uppercase tracking-wider font-bold flex items-center gap-2">
          <Activity className="w-3 h-3" /> Transformation Matrix
        </label>
        
        <div className="flex items-center justify-center py-8">
          {/* Visual Matrix Input */}
          <div className="relative flex items-center gap-4 px-6">
            {/* Left Bracket */}
            <div className="absolute left-0 top-0 bottom-0 w-3 border-l-2 border-t-2 border-b-2 border-white/30 rounded-l-lg" />
            
            <div className="grid grid-cols-2 gap-4">
              {[0, 1].map(row => (
                <React.Fragment key={row}>
                  {[0, 1].map(col => (
                    <div key={`${row}-${col}`} className="relative group">
                      <input
                        type="number"
                        step="0.1"
                        value={matrix[row][col]}
                        onChange={e => {
                          const newMatrix = [...matrix];
                          newMatrix[row] = [...matrix[row]];
                          newMatrix[row][col] = parseFloat(e.target.value) || 0;
                          setMatrix(newMatrix);
                        }}
                        className="w-20 bg-panel-3 border border-white/5 rounded-lg p-3 text-center text-lg font-mono font-bold text-[#00d1ff] focus:outline-none focus:border-[#00d1ff]/50 transition-all"
                      />
                      <div className="absolute -top-3 left-1 text-[8px] text-white/20 font-mono uppercase">
                        {row === 0 ? (col === 0 ? 'a₁₁' : 'a₁₂') : (col === 0 ? 'a₂₁' : 'a₂₂')}
                      </div>
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>

            {/* Right Bracket */}
            <div className="absolute right-0 top-0 bottom-0 w-3 border-r-2 border-t-2 border-b-2 border-white/30 rounded-r-lg" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold block">
          Transformation Presets
        </label>
        <div className="grid grid-cols-4 gap-2">
          {LINALG_PRESETS.map(preset => (
            <button
              key={preset.label}
              onClick={() => setMatrix(preset.val)}
              className="flex flex-col items-center justify-center p-3 bg-panel-3 hover:bg-panel-2 border border-white/5 rounded-xl transition-all group"
              title={preset.label}
            >
              <span className="text-xl mb-1 group-hover:scale-125 transition-transform">{preset.icon}</span>
              <span className="text-[8px] uppercase tracking-tighter text-white/40 group-hover:text-white/80 text-center leading-tight">
                {preset.label.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl space-y-2">
        <div className="flex items-center gap-2">
          <Info className="w-3 h-3 text-blue-400" />
          <span className="text-[9px] uppercase font-black text-blue-400 tracking-widest">Linear Transformation</span>
        </div>
        <p className="text-[10px] text-blue-100/70 leading-relaxed italic">
          Visualizing how basis vectors <span className="text-red-400 font-bold">î</span> and <span className="text-green-400 font-bold">ĵ</span> are mapped to the columns of the matrix. The grid represents the span of the transformed space.
        </p>
      </div>
    </section>
  );
}
