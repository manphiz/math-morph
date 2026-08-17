/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Library, Calculator, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PRESETS } from '../../constants/presets';

interface KeypadProps {
  showPresets: boolean;
  setShowPresets: (show: boolean | ((prev: boolean) => boolean)) => void;
  insertAtCursor: (text: string) => void;
  onClear: () => void;
  onSelectPreset: (presetVal: string) => void;
  defaultExpanded?: boolean;
}

const KEYPAD_BUTTONS = [
  { label: 'sin', val: 'sin(' },
  { label: 'cos', val: 'cos(' },
  { label: 'tan', val: 'tan(' },
  { label: 'sqrt', val: 'sqrt(' },
  { label: '^', val: '^' },
  { label: '(', val: '(' },
  { label: ')', val: ')' },
  { label: 'x', val: 'x' },
  { label: '+', val: '+' },
  { label: '-', val: '-' },
  { label: '*', val: '*' },
  { label: '/', val: '/' },
  { label: 'π', val: 'PI' },
  { label: 'exp', val: 'E' },
  { label: 'abs', val: 'abs(' }
];

export function Keypad({
  showPresets,
  setShowPresets,
  insertAtCursor,
  onClear,
  onSelectPreset,
  defaultExpanded = false
}: KeypadProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="space-y-1.5">
      {/* Foldable Header Toggle Button */}
      <button 
        type="button"
        onClick={() => setIsExpanded(prev => !prev)}
        className="w-full flex items-center justify-between py-1.5 px-2.5 text-[10px] font-semibold text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-all group"
        aria-expanded={isExpanded}
        title={isExpanded ? 'Fold function input panel' : 'Unfold function input panel'}
      >
        <div className="flex items-center gap-1.5">
          <Calculator className="w-3 h-3 text-[#00d1ff]/80 group-hover:text-[#00d1ff] transition-colors" />
          <span className="uppercase tracking-wider font-semibold">Function Keypad</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-white/40 group-hover:text-white/70 font-medium">
            {isExpanded ? 'Hide' : 'Show'}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-white/40 group-hover:text-white transition-transform duration-200 ${isExpanded ? 'rotate-180 text-[#00d1ff]' : ''}`} />
        </div>
      </button>

      {/* Foldable Content Panel */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden space-y-1 pt-0.5"
          >
            <div className="grid grid-cols-5 gap-1">
              {KEYPAD_BUTTONS.map(btn => (
                <button
                  key={btn.val}
                  onClick={() => insertAtCursor(btn.val)}
                  className="bg-panel-3 hover:bg-panel-2 border border-white/5 py-2 rounded text-[10px] font-code transition-colors"
                >
                  {btn.label}
                </button>
              ))}
              <button 
                onClick={() => setShowPresets(prev => !prev)} 
                className={`col-span-4 flex items-center justify-center gap-2 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-all relative overflow-hidden ${
                  showPresets 
                    ? 'bg-[#00d1ff] text-black shadow-[0_0_15px_rgba(0,209,255,0.4)]' 
                    : 'bg-panel-3 text-[#00d1ff] hover:bg-[#00d1ff]/10 border border-[#00d1ff]/30 hover:border-[#00d1ff]/60 hover:shadow-[0_0_10px_rgba(0,209,255,0.2)]'
                }`}
                title="Preset Library"
              >
                <Library className="w-3 h-3" />
                <span>Presets</span>
                {!showPresets && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00d1ff] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00d1ff]"></span>
                  </span>
                )}
              </button>
              <button 
                onClick={onClear} 
                className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 py-2 rounded text-[10px] font-bold text-red-400"
              >
                CLR
              </button>
            </div>

            <AnimatePresence>
              {showPresets && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-3 gap-1 pt-1">
                    {PRESETS.map(preset => (
                      <button
                        key={preset.label}
                        onClick={() => onSelectPreset(preset.val)}
                        className="flex flex-col items-center justify-center p-2 bg-panel-3 hover:bg-panel-2 border border-white/5 rounded transition-all group"
                      >
                        <span className="text-lg mb-1 group-hover:scale-125 transition-transform">{preset.icon}</span>
                        <span className="text-[8px] uppercase tracking-tighter text-white/40 group-hover:text-white/80">{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
