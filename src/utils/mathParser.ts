/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as math from 'mathjs';
import { Param } from '../types';
import { COLORS, PRESETS, VALIDATION_POINTS } from '../constants/presets';

export function normalizeEquationInput(rawInput: string): string {
  let res = rawInput;
  // Replace x with 1x if not preceded by a digit, dot, or letter
  res = res.replace(/(^|[^a-z0-9\.])x(?![a-z])/gi, (match, p1) => p1 + '1x');
  // Replace y with 1y if not preceded by a digit, dot, or letter
  res = res.replace(/(^|[^a-z0-9\.])y(?![a-z])/gi, (match, p1) => p1 + '1y');
  // Separate numbers from constants: 5PI -> 5*PI, 5E -> 5*E
  res = res.replace(/(\d+(?:\.\d+)?)(PI|E)\b/gi, '$1*$2');
  // Separate constants from variables/parentheses: PIx -> PI*x, PI( -> PI*(
  res = res.replace(/\bPI([a-z\(])/gi, 'PI*$1');
  res = res.replace(/\bE(?!xp)([a-z\(])/gi, 'E*$1');
  // Separate variables/parentheses from constants: xPI -> x*PI, )PI -> )*PI
  res = res.replace(/([a-z\)])(PI|E)\b/gi, '$1*$2');
  return res;
}

export function translateMath(s: string): string {
  const funcs = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2', 'sinh', 'cosh', 'tanh', 'log', 'exp', 'sqrt', 'abs', 'floor', 'ceil', 'round', 'PI', 'E'];
  
  let res = s
    .replace(/(\d+)(PI|E)\b/gi, '$1 * $2')
    .replace(/\b(PI|E)(\d+)/gi, '$1 * $2')
    .replace(/\bPI([a-z\(])/gi, 'PI * $1')
    .replace(/\bE(?!xp)([a-z\(])/gi, 'E * $1')
    .replace(/([a-z\)])(PI|E)\b/gi, '$1 * $2')
    .replace(/(\d)([a-z])/gi, '$1 * $2') // 5x -> 5*x, 5a -> 5*a
    .replace(/([a-z])(\d)/gi, '$1 * $2') // x5 -> x*5
    .replace(/([a-z])([a-z]+)/gi, (match) => {
      // If the match is a known function, don't touch it
      const m = match.toLowerCase();
      if (funcs.some(f => f.toLowerCase() === m)) return match;
      // If it's something like 'ax', split it
      if (match.length === 2) return `${match[0]} * ${match[1]}`;
      return match;
    })
    .replace(/(\d)(\()/g, '$1 * $2') // 5(x) -> 5*(x)
    .replace(/(\))([a-z\d])/gi, '$1 * $2') // (x)x -> (x)*x, (x)5 -> (x)*5
    .replace(/(\))(\()/g, '$1 * $2') // (x)(x) -> (x)*(x)
    .replace(/\^/g, '**'); // Use JS exponentiation
  
  // Simplify signs (e.g., x--7 -> x+7)
  res = res.replace(/\+\+/g, '+')
           .replace(/\+-/g, '-')
           .replace(/-\+/g, '-')
           .replace(/--/g, '+');

  // Prefix math functions and constants with Math.
  funcs.forEach(f => {
    const reg = new RegExp(`\\b${f}\\b`, 'g');
    res = res.replace(reg, (match, offset, string) => {
      // Don't prefix if already prefixed with Math.
      if (offset >= 5 && string.substring(offset - 5, offset) === 'Math.') return match;
      return `Math.${match}`;
    });
  });
  
  return res;
}

export function extractParamsFromEquation(normalizedInput: string, prevParams: Param[]): Param[] {
  const freshParams: Param[] = [];
  let match: RegExpExecArray | null;
  const regex = /\d+(\.\d+)?|\bPI\b|\bE\b|\b(?![xy])[a-z]\b/gi;
  let idx = 0;
  while ((match = regex.exec(normalizedInput)) !== null) {
    const matchStr = match[0].toUpperCase();
    const isPI = matchStr === 'PI';
    const isE = matchStr === 'E';
    const isLetter = /^[a-z]$/i.test(match[0]) && !['X', 'Y'].includes(matchStr);
    const num = isPI ? Math.PI : (isE ? Math.E : (isLetter ? 1.0 : parseFloat(match[0])));
    const pos = match.index;
    const before = normalizedInput.substring(0, pos).trim();
    const after = normalizedInput.substring(pos + match[0].length).trim();

    let role: Param['role'] = 'constant';
    if (before.match(/(sin|cos|tan|asin|acos|atan|log|exp|sqrt|abs)\($/)) {
      role = 'frequency';
    } else if (before.endsWith('^')) {
      role = 'exponent';
    } else if (after.startsWith('x')) {
      role = 'coefficient';
    } else if (before.match(/\([x\s]*[\+\-]$/) || before.match(/\([x\s]*$/)) {
      role = 'shift';
    }

    if (prevParams[idx] && prevParams[idx].originalVal === num) {
      freshParams.push({ ...prevParams[idx], role });
    } else {
      const finalVal = role === 'exponent' ? Math.round(num) : num;
      freshParams.push({
        val: finalVal,
        color: COLORS[idx % COLORS.length],
        originalVal: num,
        isMorphing: false,
        role,
        minRange: -5,
        maxRange: 5
      });
    }
    idx++;
  }
  return freshParams;
}

export function validateAndComputeScale(rawInput: string, normalizedInput: string): {
  isValid: boolean;
  errorMsg: string;
  suggestedScale?: number;
} {
  if (!rawInput.trim()) {
    return { isValid: true, errorMsg: '' };
  }

  const allowedChars = /^[0-9xy\s\+\-\*\/\^\(\)\.\,a-z\=]+$/i;
  if (!allowedChars.test(rawInput)) {
    return { isValid: false, errorMsg: 'Invalid characters in equation' };
  }

  const allowedIdentifiers = new Set([
    'x', 'y', 'pi', 'e', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2',
    'sinh', 'cosh', 'tanh', 'log', 'exp', 'sqrt', 'abs', 'floor', 'ceil', 'round'
  ]);
  const words = rawInput.match(/[a-zA-Z]+/g) || [];
  for (const word of words) {
    if (!allowedIdentifiers.has(word.toLowerCase())) {
      return { isValid: false, errorMsg: 'Invalid mathematical expression' };
    }
  }

  try {
    const translated = translateMath(normalizedInput);
    if (translated.includes('=')) {
      const parts = translated.split('=');
      const lhs = parts[0];
      const rhs = parts[1] || '0';
      const f = new Function('x', 'y', `return (${lhs}) - (${rhs});`);
      f(1, 1);
    } else {
      const f = new Function('x', `return ${translated};`);
      f(1);
    }

    let suggestedScale: number | undefined;
    if (translated && !translated.includes('=')) {
      try {
        const f = new Function('x', `return ${translated};`);
        const samples = [-5, -2, 0, 2, 5];
        let maxAbsY = 0;
        let validSamples = 0;
        samples.forEach(sx => {
          const sy = f(sx);
          if (typeof sy === 'number' && !isNaN(sy) && isFinite(sy)) {
            maxAbsY = Math.max(maxAbsY, Math.abs(sy));
            validSamples++;
          }
        });

        if (validSamples > 0) {
          if (maxAbsY > 0.1) {
            suggestedScale = Math.min(200, Math.max(10, 250 / maxAbsY));
          } else {
            suggestedScale = 200;
          }
        }
      } catch (e) {
        // ignore auto-scale errors
      }
    } else if (translated && translated.includes('=')) {
      const numRegex = /\d+(\.\d+)?/g;
      const nums = normalizedInput.match(numRegex);
      if (nums) {
        const maxNum = Math.max(...nums.map(Number));
        if (maxNum > 0) {
          suggestedScale = Math.min(200, Math.max(10, 250 / Math.sqrt(maxNum)));
        }
      }
    }

    return { isValid: true, errorMsg: '', suggestedScale };
  } catch (e: any) {
    return { isValid: false, errorMsg: e.message || 'Invalid mathematical expression' };
  }
}

export function validateAllPresetEquations(): void {
  PRESETS.forEach(preset => {
    const points = VALIDATION_POINTS[preset.label];
    if (!points) return;

    const translated = translateMath(preset.val.replace(/\s+/g, '').toLowerCase());
    let finalEq = translated;
    const isImplicit = translated.includes('=');
    
    if (isImplicit) {
      const parts = translated.split('=');
      const lhs = parts[0].trim();
      const rhs = (parts[1] || '0').trim();
      finalEq = `(${lhs}) - (${rhs})`;
    }

    try {
      let evaluator: (x: number, y: number) => number;
      if (isImplicit) {
        evaluator = new Function('x', 'y', `return ${finalEq};`) as any;
      } else {
        const mathExpr = finalEq.replace(/Math\./g, '').replace(/\*\*/g, '^');
        const compiled = math.compile(mathExpr);
        evaluator = (x: number, y: number) => {
          const res = compiled.evaluate({ x });
          return y - res;
        };
      }

      points.forEach(pt => {
        const result = evaluator(pt.x, pt.y);
        if (Math.abs(result) > 0.001) {
          console.error(`Validation Failed for ${preset.label} at (${pt.x}, ${pt.y}). Expected ~0, got ${result}`);
        } else {
          console.log(`Validation Passed for ${preset.label} at (${pt.x}, ${pt.y})`);
        }
      });
    } catch (e) {
      console.error(`Validation Error for ${preset.label}:`, e);
    }
  });
}
