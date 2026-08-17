/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PanelLeft, PanelRight } from 'lucide-react';
import { Mode } from '../../types';
import { ENABLE_PRO_MODE } from '../../constants/presets';
import { MathMorphLogo } from './MathMorphLogo';

export interface AppBannerProps {
  mode?: Mode;
  setMode?: (mode: Mode) => void;
  sidebarPosition?: 'left' | 'right';
  onToggleSidebarPosition?: () => void;
  className?: string;
}

export function AppBanner({ 
  mode, 
  setMode, 
  sidebarPosition = 'left',
  onToggleSidebarPosition,
  className = '' 
}: AppBannerProps) {
  return (
    <div className={`flex items-center justify-between w-full ${className}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 flex items-center justify-center overflow-hidden flex-shrink-0">
          <MathMorphLogo className="w-10 h-10" size={40} />
        </div>
        <div>
          <h1 className="text-xl font-light tracking-tight leading-tight">
            Math <span className="text-[#00d1ff] font-medium">Morph</span>
          </h1>
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold leading-tight">
            {ENABLE_PRO_MODE ? 'Pro Visualization' : 'Interactive Visualizer'}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Mode Switch when Pro Mode is enabled */}
        {ENABLE_PRO_MODE && setMode && (
          <div className="flex bg-panel-2 p-1 rounded-lg border border-white/5">
            <button 
              onClick={() => setMode('muse')}
              className={`px-3 py-1 text-[10px] uppercase tracking-tighter rounded-md transition-all ${
                mode === 'muse' ? 'bg-[#00d1ff] text-black font-bold' : 'text-white/40 hover:text-white'
              }`}
            >
              Math Muse
            </button>
            <button 
              onClick={() => setMode('pro')}
              className={`px-3 py-1 text-[10px] uppercase tracking-tighter rounded-md transition-all ${
                mode === 'pro' ? 'bg-[#00d1ff] text-black font-bold' : 'text-white/40 hover:text-white'
              }`}
            >
              Pro
            </button>
          </div>
        )}

        {/* Minimal Side Switch button (right side of banner row in landscape, hidden in portrait) */}
        {onToggleSidebarPosition && (
          <button
            type="button"
            onClick={onToggleSidebarPosition}
            className="p-2 rounded-lg bg-white/5 hover:bg-[#00d1ff]/15 text-white/60 hover:text-[#00d1ff] border border-white/10 hover:border-[#00d1ff]/30 transition-all flex items-center justify-center group"
            title={sidebarPosition === 'left' ? 'Move panel to right' : 'Move panel to left'}
            aria-label={sidebarPosition === 'left' ? 'Move panel to right' : 'Move panel to left'}
          >
            {sidebarPosition === 'left' ? (
              <PanelRight className="w-4 h-4 transition-transform group-hover:scale-110" />
            ) : (
              <PanelLeft className="w-4 h-4 transition-transform group-hover:scale-110" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
