/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { Param } from '../../types';

interface LiveEquationDisplayProps {
  normalizedInput: string;
  params: Param[];
  activeIdx: number | null;
  onTokenClick: (index: number) => void;
  onResetGhost: () => void;
}

export function LiveEquationDisplay({
  normalizedInput,
  params,
  activeIdx,
  onTokenClick,
  onResetGhost
}: LiveEquationDisplayProps) {
  const interactiveDisplay = useMemo(() => {
    const numRegex = /\d+(\.\d+)?|\bPI\b|\bE\b|\b(?![xy])[a-z]\b/gi;
    let match: RegExpExecArray | null;
    let lastIndex = 0;
    const elements: React.ReactNode[] = [];
    let idx = 0;

    const effectiveActiveIdx = activeIdx !== null ? activeIdx : (params.length > 0 ? 0 : null);
    const tempInput = normalizedInput;

    while ((match = numRegex.exec(tempInput)) !== null) {
      let prefix = tempInput.substring(lastIndex, match.index);
      const currentIdx = idx;
      const param = params[idx];
      const matchStr = match[0].toUpperCase();
      const isPI = matchStr === 'PI';
      const isE = matchStr === 'E';
      const isLetter = /^[a-z]$/i.test(match[0]) && !['X', 'Y'].includes(matchStr);
      let displayVal = param ? param.val : (isPI ? Math.PI : (isE ? Math.E : (isLetter ? 1.0 : parseFloat(match[0]))));
      
      // Smart sign handling for display (e.g., x - -7 becomes x + 7)
      if (param && param.val < 0) {
        if (prefix.trim().endsWith('-')) {
          const lastMinusIdx = prefix.lastIndexOf('-');
          prefix = prefix.substring(0, lastMinusIdx) + '+';
          displayVal = Math.abs(param.val);
        } else if (prefix.trim().endsWith('+')) {
          const lastPlusIdx = prefix.lastIndexOf('+');
          prefix = prefix.substring(0, lastPlusIdx) + '-';
          displayVal = Math.abs(param.val);
        }
      }

      // Publication style: handle superscripts for powers
      let isSuperscript = false;
      if (prefix.endsWith('^')) {
        prefix = prefix.slice(0, -1);
        isSuperscript = true;
      }
      
      elements.push(<span key={`pre-${idx}`}>{prefix}</span>);
      
      const isOriginalConstant = param && (
        (isPI && Math.abs(param.originalVal - Math.PI) < 0.001) ||
        (isE && Math.abs(param.originalVal - Math.E) < 0.001) ||
        (isLetter && Math.abs(param.originalVal - 1.0) < 0.001)
      );

      const token = (
        <motion.span
          key={idx}
          layout
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.9 }}
          className={`cursor-pointer rounded-full transition-all border-2 inline-flex items-center justify-center not-italic font-mono font-bold shadow-lg ${
            effectiveActiveIdx === currentIdx ? 'border-white ring-4 ring-white/10' : 'border-white/10 hover:border-white/30'
          } ${isSuperscript ? 'text-[0.6em] -translate-y-2 px-2 py-0.5' : 'px-3 py-1 mx-1'}`}
          style={{ 
            color: param?.color || '#fff',
            backgroundColor: effectiveActiveIdx === currentIdx ? `${param?.color}33` : `${param?.color}11`,
            boxShadow: param?.isMorphing ? `0 0 20px ${param?.color}66` : 'none',
            borderColor: param?.isMorphing ? param?.color : (effectiveActiveIdx === currentIdx ? '#fff' : 'rgba(255,255,255,0.1)')
          }}
          onClick={() => onTokenClick(currentIdx)}
        >
          {isOriginalConstant && Math.abs(param.val - param.originalVal) < 0.01 
            ? (isPI ? 'π' : (isE ? 'e' : match[0])) 
            : displayVal.toFixed(param?.role === 'exponent' ? 0 : 1)}
          {param?.isMorphing && (
            <motion.span 
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="ml-1.5 w-1.5 h-1.5 rounded-full bg-current"
            />
          )}
        </motion.span>
      );

      elements.push(isSuperscript ? <sup key={`sup-${idx}`}>{token}</sup> : token);
      
      lastIndex = numRegex.lastIndex;
      idx++;
    }
    elements.push(<span key="final">{tempInput.substring(lastIndex).replace(/\^/g, '')}</span>);
    return elements;
  }, [normalizedInput, params, activeIdx, onTokenClick]);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-[11px] text-white/40 uppercase tracking-wider font-bold">
          2. Live Equation
        </label>
        <button 
          onClick={onResetGhost}
          className="text-[9px] text-[#00d1ff] hover:text-white flex items-center gap-1 transition-colors uppercase tracking-widest font-bold bg-[#00d1ff]/10 hover:bg-[#00d1ff]/20 px-2 py-1 rounded border border-[#00d1ff]/30"
          title="Reset Reference Equation"
        >
          <RotateCcw className="w-2.5 h-2.5" /> Reset Ref
        </button>
      </div>
      <div className="bg-panel-2 border border-white/10 rounded-lg p-4 font-serif text-2xl min-h-[80px] leading-relaxed break-all italic">
        {interactiveDisplay}
      </div>
    </div>
  );
}
