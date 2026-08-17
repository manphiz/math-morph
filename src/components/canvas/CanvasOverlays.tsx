/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ZoomIn, Plus, Minus, RotateCcw } from 'lucide-react';
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
  const handleZoomIn = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setScaleVal(prev => Math.min(1000, prev * 1.25));
  };

  const handleZoomOut = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setScaleVal(prev => Math.max(5, prev * 0.8));
  };

  const handleResetZoom = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setScaleVal(50);
  };

  return (
    <>
      {/* Zoom Hint Overlay */}
      <AnimatePresence>
        {showZoomHint && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[10px] text-white/60 bg-black/70 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 uppercase tracking-widest font-bold pointer-events-none z-10 select-none shadow-lg"
          >
            <ZoomIn className="w-3.5 h-3.5 text-[#00d1ff]" /> Pinch or Scroll to Zoom
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

      {/* Overlay UI for the canvas (Scale Pill & Quick Zoom Buttons) */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-20 select-none">
        <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md border border-white/10 rounded-full p-1 shadow-lg">
          {isEditingScale ? (
            <div className="flex items-center gap-1 px-2 py-0.5">
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
                className="w-10 bg-transparent border-none outline-none text-[10px] font-mono text-[#00d1ff] font-bold text-center"
              />
              <span className="text-[10px] font-mono text-white/40">%</span>
            </div>
          ) : (
            <button 
              onClick={() => {
                setTempScale(scaleVal.toFixed(0));
                setIsEditingScale(true);
              }}
              aria-label="Edit Scale Value"
              className="px-2.5 py-1 text-[10px] font-mono text-white/70 hover:text-[#00d1ff] transition-colors cursor-pointer"
            >
              Scale: <span className="text-white font-bold">{scaleVal.toFixed(0)}%</span>
            </button>
          )}

          {/* Quick Zoom In/Out Buttons for Touch / iOS */}
          <div className="flex items-center gap-0.5 border-l border-white/10 pl-1">
            <button
              onClick={handleZoomIn}
              aria-label="Zoom in"
              className="w-6 h-6 flex items-center justify-center rounded-full text-white/70 hover:text-[#00d1ff] hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
              title="Zoom in"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              aria-label="Zoom out"
              className="w-6 h-6 flex items-center justify-center rounded-full text-white/70 hover:text-[#00d1ff] hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
              title="Zoom out"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              aria-label="Reset zoom to 50%"
              className="w-6 h-6 flex items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
              title="Reset Zoom (50%)"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {mode === 'pro' && (
          <div className="flex flex-col gap-1 items-end bg-black/50 backdrop-blur-sm p-2 rounded-lg border border-white/5">
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
