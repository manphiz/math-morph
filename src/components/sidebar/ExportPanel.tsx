/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Download, Settings2, Loader2, Eye, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ExportConfig, VisualSettings } from '../../types';

interface ExportPanelProps {
  isExporting: boolean;
  exportProgress: number;
  showExportSettings: boolean;
  setShowExportSettings: (show: boolean | ((prev: boolean) => boolean)) => void;
  visualSettings: VisualSettings;
  setVisualSettings: React.Dispatch<React.SetStateAction<VisualSettings>>;
  exportConfig: ExportConfig;
  setExportConfig: React.Dispatch<React.SetStateAction<ExportConfig>>;
  isExportUnlocked: boolean;
  onExport: (isPreview: boolean) => void;
  onUnlockExport: () => void;
}

export function ExportPanel({
  isExporting,
  exportProgress,
  showExportSettings,
  setShowExportSettings,
  visualSettings,
  setVisualSettings,
  exportConfig,
  setExportConfig,
  isExportUnlocked,
  onExport,
  onUnlockExport
}: ExportPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl space-y-4 relative overflow-hidden mt-4"
    >
      <div className="flex items-center justify-between">
        <label className="text-[11px] text-blue-400 uppercase tracking-wider font-black flex items-center gap-2">
          <Download className="w-3 h-3" /> Export & Preview
        </label>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowExportSettings(prev => !prev)}
            className={`p-1.5 rounded-md transition-all ${
              showExportSettings ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/40 hover:text-white'
            }`}
            title="Export Settings"
          >
            <Settings2 className="w-3 h-3" />
          </button>
          {isExporting && (
            <div className="flex items-center gap-2 text-[10px] text-blue-400 font-bold animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              {Math.round(exportProgress)}%
            </div>
          )}
        </div>
      </div>

      {/* Visual Enhancements inside Export */}
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => setVisualSettings(v => ({ ...v, trails: !v.trails }))}
          className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
            visualSettings.trails 
              ? 'bg-[#00d1ff]/10 border-[#00d1ff]/30 text-[#00d1ff]' 
              : 'bg-panel-3 border-white/10 text-white/40'
          }`}
        >
          <span className="text-[9px] uppercase font-bold">Trails</span>
          <div className={`w-2 h-2 rounded-full ${
            visualSettings.trails ? 'bg-[#00d1ff] shadow-[0_0_8px_#00d1ff]' : 'bg-white/20'
          }`} />
        </button>
        <button 
          onClick={() => setVisualSettings(v => ({ ...v, glow: !v.glow }))}
          className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
            visualSettings.glow 
              ? 'bg-[#00d1ff]/10 border-[#00d1ff]/30 text-[#00d1ff]' 
              : 'bg-panel-3 border-white/10 text-white/40'
          }`}
        >
          <span className="text-[9px] uppercase font-bold">Glow</span>
          <div className={`w-2 h-2 rounded-full ${
            visualSettings.glow ? 'bg-[#00d1ff] shadow-[0_0_8px_#00d1ff]' : 'bg-white/20'
          }`} />
        </button>
      </div>

      <AnimatePresence>
        {showExportSettings && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden grid grid-cols-2 gap-3 border-b border-white/5 pb-4"
          >
            <div className="space-y-1">
              <span className="text-[9px] text-white/40 uppercase font-bold">Duration</span>
              <select 
                value={exportConfig.durationSec}
                onChange={(e) => setExportConfig(prev => ({ ...prev, durationSec: parseInt(e.target.value) }))}
                className="w-full bg-black border border-white/10 rounded p-1 text-[10px] text-white/70"
              >
                {[2, 3, 5, 8, 10].map(s => <option key={s} value={s}>{s}s</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] text-white/40 uppercase font-bold">FPS</span>
              <select 
                value={exportConfig.fps}
                onChange={(e) => setExportConfig(prev => ({ ...prev, fps: parseInt(e.target.value) as 30 | 60 }))}
                className="w-full bg-black border border-white/10 rounded p-1 text-[10px] text-white/70"
              >
                {[30, 60].map(f => <option key={f} value={f}>{f} FPS</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] text-white/40 uppercase font-bold">Resolution</span>
              <select 
                value={exportConfig.resScale}
                onChange={(e) => setExportConfig(prev => ({ ...prev, resScale: parseInt(e.target.value) as 1 | 2 }))}
                className="w-full bg-black border border-white/10 rounded p-1 text-[10px] text-white/70"
              >
                <option value={1}>1x (Standard)</option>
                <option value={2}>2x (Retina)</option>
              </select>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] text-white/40 uppercase font-bold">Easing</span>
              <select 
                value={exportConfig.easing}
                onChange={(e) => setExportConfig(prev => ({ ...prev, easing: e.target.value as 'linear' | 'easeInOut' }))}
                className="w-full bg-black border border-white/10 rounded p-1 text-[10px] text-white/70"
              >
                <option value="linear">Linear</option>
                <option value="easeInOut">Ease In/Out</option>
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-4">
        <div className="space-y-1">
          <div className="flex justify-between text-[9px] text-white/40 uppercase font-bold">
            <span>Sweep Range</span>
            <span>{exportConfig.from} to {exportConfig.to}</span>
          </div>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={exportConfig.from}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '-' || val === '' || !isNaN(parseFloat(val))) {
                  setExportConfig(prev => ({ ...prev, from: val as any }));
                }
              }}
              onBlur={(e) => {
                const val = parseFloat(e.target.value);
                if (isNaN(val)) setExportConfig(prev => ({ ...prev, from: 0 }));
              }}
              className="w-1/2 bg-black border border-white/10 rounded p-1 text-[10px] text-white/70"
            />
            <input 
              type="text" 
              value={exportConfig.to}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '-' || val === '' || !isNaN(parseFloat(val))) {
                  setExportConfig(prev => ({ ...prev, to: val as any }));
                }
              }}
              onBlur={(e) => {
                const val = parseFloat(e.target.value);
                if (isNaN(val)) setExportConfig(prev => ({ ...prev, to: 0 }));
              }}
              className="w-1/2 bg-black border border-white/10 rounded p-1 text-[10px] text-white/70"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onExport(true)}
            disabled={isExporting}
            className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
          >
            <Eye className="w-3 h-3" /> Preview
          </button>
          <button
            onClick={isExportUnlocked ? () => onExport(false) : onUnlockExport}
            disabled={isExporting}
            className={`px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(37,99,235,0.3)] ${
              isExportUnlocked ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30'
            }`}
          >
            {isExportUnlocked ? (
              <>
                {isExporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                {isExporting ? 'Exporting' : 'Export'}
              </>
            ) : (
              <>
                <Lock className="w-3 h-3" /> Unlock Export
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
