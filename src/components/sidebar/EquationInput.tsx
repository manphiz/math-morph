/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Settings2, CornerDownLeft, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EquationInputProps {
  rawInput: string;
  setRawInput: (val: string) => void;
  isValid: boolean;
  errorMsg: string;
  onApplyEquation: () => void;
}

export function EquationInput({
  rawInput,
  setRawInput,
  isValid,
  errorMsg,
  onApplyEquation
}: EquationInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] text-white/40 uppercase tracking-wider font-bold flex items-center gap-2">
        <Settings2 className="w-3 h-3" /> 1. Define Equation
      </label>
      <div className="relative group">
        <input
          id="eq-input"
          type="text"
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onApplyEquation();
            }
          }}
          className={`w-full bg-black border rounded-lg pl-4 pr-12 py-3 text-white/70 focus:outline-none transition-colors font-code ${
            isValid ? 'border-white/10 focus:border-[#00d1ff]/50' : 'border-red-500/50 focus:border-red-500'
          }`}
          placeholder="e.g. 5x^3 + 6x"
        />
        <button
          onClick={onApplyEquation}
          disabled={!isValid}
          className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md transition-all ${
            isValid 
              ? 'text-[#00d1ff] hover:bg-[#00d1ff]/10' 
              : 'text-white/10 cursor-not-allowed'
          }`}
          title="Apply Equation (Enter)"
        >
          <CornerDownLeft className="w-4 h-4" />
        </button>
      </div>
      <AnimatePresence>
        {!isValid && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-red-400 text-[10px] font-bold uppercase tracking-wider mt-1"
          >
            <AlertCircle className="w-3 h-3" />
            {errorMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
