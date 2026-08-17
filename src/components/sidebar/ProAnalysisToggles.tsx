/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { VisualSettings } from '../../types';

interface ProAnalysisTogglesProps {
  showDerivative: boolean;
  setShowDerivative: (val: boolean) => void;
  showIntegral: boolean;
  setShowIntegral: (val: boolean) => void;
  visualSettings: VisualSettings;
  setVisualSettings: React.Dispatch<React.SetStateAction<VisualSettings>>;
}

export function ProAnalysisToggles({
  showDerivative,
  setShowDerivative,
  showIntegral,
  setShowIntegral,
  visualSettings,
  setVisualSettings
}: ProAnalysisTogglesProps) {
  return (
    <motion.section 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="space-y-3 p-4 bg-white/5 rounded-xl border border-white/5"
    >
      <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-2 block">
        Advanced Analysis
      </label>
      <div className="flex flex-col gap-3">
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={showDerivative} 
              onChange={e => setShowDerivative(e.target.checked)} 
              className="hidden" 
            />
            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
              showDerivative ? 'bg-purple-500 border-purple-400' : 'border-white/20'
            }`}>
              {showDerivative && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
            </div>
            <span className={`text-[10px] uppercase font-bold tracking-tight ${
              showDerivative ? 'text-purple-400' : 'text-white/40 group-hover:text-white/60'
            }`}>
              Derivative
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={showIntegral} 
              onChange={e => setShowIntegral(e.target.checked)} 
              className="hidden" 
            />
            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
              showIntegral ? 'bg-emerald-500 border-emerald-400' : 'border-white/20'
            }`}>
              {showIntegral && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
            </div>
            <span className={`text-[10px] uppercase font-bold tracking-tight ${
              showIntegral ? 'text-emerald-400' : 'text-white/40 group-hover:text-white/60'
            }`}>
              Integral
            </span>
          </label>
        </div>
        
        <label className="flex items-center gap-2 cursor-pointer group">
          <input 
            type="checkbox" 
            checked={visualSettings.show3DComplex} 
            onChange={e => setVisualSettings(v => ({ ...v, show3DComplex: e.target.checked }))} 
            className="hidden" 
          />
          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
            visualSettings.show3DComplex ? 'bg-orange-500 border-orange-400' : 'border-white/20'
          }`}>
            {visualSettings.show3DComplex && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
          </div>
          <span className={`text-[10px] uppercase font-bold tracking-tight ${
            visualSettings.show3DComplex ? 'text-orange-400' : 'text-white/40 group-hover:text-white/60'
          }`}>
            3D Complex Visualization
          </span>
        </label>
      </div>
      <p className="text-[9px] text-white/20 italic mt-2">
        Imaginary parts (e.g. sqrt(-x)) shown as neon pink dashed lines. Use 3D view to see the complex plane. <b>Hold SHIFT + Drag to rotate.</b>
      </p>
    </motion.section>
  );
}
