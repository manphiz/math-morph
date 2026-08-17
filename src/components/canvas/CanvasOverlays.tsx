/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ZoomIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ExportConfig, Mode } from '../../types';

interface CanvasOverlaysProps {
  showZoomHint: boolean;
  isExporting: boolean;
  isExportPreview: boolean;
  exportProgress: number;
  exportConfig: ExportConfig;
  isEditingScale: boolean;
  setIsEditingScale: (editing: boolean) => void;
  tempScale: string;
  setTempScale: (val: string) => void;
  scaleVal: number;
  setScaleVal: React.Dispatch<React.SetStateAction<number>>;
  mode: Mode;
  showDerivative: boolean;
}

export function CanvasOverlays({
  showZoomHint,
  isExporting,
  isExportPreview,
  exportProgress,
  exportConfig,
  isEditingScale,
  setIsEditingScale,
  tempScale,
  setTempScale,
  scaleVal,
  setScaleVal,
  mode,
  showDerivative
}: CanvasOverlaysProps) {
  return (
    <>
      {/* Zoom Hint Overlay */}
      <AnimatePresence>
        {showZoomHint && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[10px] text-white/50 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 uppercase tracking-widest font-bold pointer-events-none z-10"
          >
            <ZoomIn className="w-3 h-3" /> Scroll to Zoom
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export Overlay */}
      <AnimatePresence>
        {isExporting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 z-50 flex flex-col items-center justify-center transition-all ${
              isExportPreview ? 'bg-black/20 pointer-events-none' : 'bg-black/80 backdrop-blur-sm'
            }`}
          >
            <div className={`w-64 space-y-6 text-center ${
              isExportPreview ? 'mt-auto mb-12 bg-black/60 p-6 rounded-2xl backdrop-blur-md border border-white/10' : ''
            }`}>
              <div className="space-y-2">
                <h3 className="text-white font-black uppercase tracking-widest text-sm">
                  {isExportPreview ? 'Previewing Animation' : (exportConfig.resScale > 1 ? 'Rendering High-Res' : 'Processing Animation')}
                </h3>
                <div className="flex items-center justify-between text-[10px] font-mono text-[#00d1ff]">
                  <span>{Math.round(exportProgress)}%</span>
                  <span className="uppercase tracking-widest opacity-50">
                    Frame {Math.round((exportProgress / 100) * exportConfig.fps * exportConfig.durationSec)}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-blue-600 to-[#00d1ff] shadow-[0_0_10px_rgba(0,209,255,0.5)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${exportProgress}%` }}
                    transition={{ type: 'spring', bounce: 0, duration: 0.2 }}
                  />
                </div>
              </div>
              {!isExportPreview && (
                <p className="text-white/40 text-[9px] uppercase tracking-[0.2em] animate-pulse">
                  Please keep this tab active
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay UI for the canvas */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
        {isEditingScale ? (
          <div className="flex items-center gap-2 bg-black/80 backdrop-blur-md border border-[#00d1ff]/50 rounded-full px-3 py-1 shadow-[0_0_15px_rgba(0,209,255,0.2)]">
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-tighter">Scale:</span>
            <input
              autoFocus
              type="text"
              value={tempScale}
              onChange={(e) => setTempScale(e.target.value)}
              onBlur={() => {
                const val = parseFloat(tempScale);
                if (!isNaN(val) && val > 0) {
                  setScaleVal(Math.max(5, Math.min(1000, val)));
                }
                setIsEditingScale(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = parseFloat(tempScale);
                  if (!isNaN(val) && val > 0) {
                    setScaleVal(Math.max(5, Math.min(1000, val)));
                  }
                  setIsEditingScale(false);
                } else if (e.key === 'Escape') {
                  setIsEditingScale(false);
                }
              }}
              className="w-12 bg-transparent border-none outline-none text-[10px] font-mono text-[#00d1ff] font-bold text-center"
            />
            <span className="text-[10px] font-mono text-white/40">%</span>
          </div>
        ) : (
          <button 
            onClick={() => {
              setTempScale(scaleVal.toFixed(0));
              setIsEditingScale(true);
            }}
            className="px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-mono text-white/60 hover:text-[#00d1ff] hover:border-[#00d1ff]/30 transition-all cursor-pointer group"
          >
            Scale: <span className="text-white group-hover:text-[#00d1ff] transition-colors">{scaleVal.toFixed(0)}%</span>
          </button>
        )}
        {mode === 'pro' && (
          <div className="flex flex-col gap-1 items-end">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-[#00d1ff]"></div>
              <span className="text-[9px] uppercase text-white/40 font-bold">Function</span>
            </div>
            {showDerivative && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-purple-500"></div>
                <span className="text-[9px] uppercase text-white/40 font-bold">Derivative</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 border-t border-dashed border-orange-500"></div>
              <span className="text-[9px] uppercase text-white/40 font-bold">Imaginary</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
