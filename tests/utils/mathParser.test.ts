import { describe, it, expect } from 'vitest';
import { 
  normalizeEquationInput, 
  translateMath, 
  extractParamsFromEquation, 
  validateAndComputeScale,
  validateAllPresetEquations 
} from '../../src/utils/mathParser';

describe('mathParser utils', () => {
  describe('normalizeEquationInput', () => {
    it('should normalize naked variables with implicit coefficient 1', () => {
      expect(normalizeEquationInput('x^2 - 1')).toBe('1x^2 - 1');
      expect(normalizeEquationInput('y^2 + x')).toBe('1y^2 + 1x');
    });

    it('should normalize constants like PI and E with multiplication', () => {
      expect(normalizeEquationInput('5PI')).toBe('5*PI');
      expect(normalizeEquationInput('PIx')).toBe('PI*x');
      expect(normalizeEquationInput('5E')).toBe('5*E');
    });

    it('should keep already coefficiented variables intact', () => {
      expect(normalizeEquationInput('5x^3 + 6x')).toBe('5x^3 + 6x');
    });
  });

  describe('translateMath', () => {
    it('should convert power operators to JavaScript exponentiation', () => {
      const translated = translateMath('x^2 + 2x');
      expect(translated).toContain('**2');
    });

    it('should prefix standard mathematical functions with Math.', () => {
      expect(translateMath('sin(x)')).toContain('Math.sin(x)');
      expect(translateMath('cos(x)')).toContain('Math.cos(x)');
      expect(translateMath('sqrt(x)')).toContain('Math.sqrt(x)');
    });

    it('should replace PI and E with Math.PI and Math.E', () => {
      expect(translateMath('PI')).toContain('Math.PI');
      expect(translateMath('E')).toContain('Math.E');
    });

    it('should handle implicit multiplications', () => {
      expect(translateMath('5(x)')).toContain('5 * (x)');
      expect(translateMath('5Math.sin(x)')).toContain('5 * Math.sin(x)');
    });
  });

  describe('extractParamsFromEquation', () => {
    it('should extract numbers and their roles from equation strings', () => {
      const params = extractParamsFromEquation('5x^3 + 6x', []);
      expect(params.length).toBe(3);
      expect(params[0].val).toBe(5);
      expect(params[0].role).toBe('coefficient');
      expect(params[1].val).toBe(3);
      expect(params[1].role).toBe('exponent');
      expect(params[2].val).toBe(6);
      expect(params[2].role).toBe('coefficient');
    });

    it('should recognize constants like PI and E as parameters', () => {
      const params = extractParamsFromEquation('PI*x + E', []);
      expect(params.length).toBe(2);
      expect(params[0].originalVal).toBeCloseTo(Math.PI);
      expect(params[1].originalVal).toBeCloseTo(Math.E);
    });

    it('should preserve previous state if structure matches', () => {
      const initial = extractParamsFromEquation('5x^2', []);
      initial[0].val = 99;
      initial[0].isMorphing = true;

      const updated = extractParamsFromEquation('5x^2', initial);
      expect(updated[0].val).toBe(99);
      expect(updated[0].isMorphing).toBe(true);
    });
  });

  describe('validateAndComputeScale', () => {
    it('should validate valid explicit formulas', () => {
      const res = validateAndComputeScale('x^2', '1x^2');
      expect(res.isValid).toBe(true);
      expect(res.errorMsg).toBe('');
      expect(res.suggestedScale).toBeGreaterThan(0);
    });

    it('should validate valid implicit formulas', () => {
      const res = validateAndComputeScale('x^2 + y^2 = 25', '1x^2 + 1y^2 = 25');
      expect(res.isValid).toBe(true);
      expect(res.errorMsg).toBe('');
    });

    it('should reject invalid syntax', () => {
      const res = validateAndComputeScale('x + + *', '1x + + *');
      expect(res.isValid).toBe(false);
      expect(res.errorMsg).not.toBe('');
    });

    it('should reject non-math characters', () => {
      const res = validateAndComputeScale('alert(1)', 'alert(1)');
      expect(res.isValid).toBe(false);
      expect(res.errorMsg).toBe('Invalid mathematical expression');
    });
  });

  describe('validateAllPresetEquations', () => {
    it('should validate all presets without throwing', () => {
      expect(() => validateAllPresetEquations()).not.toThrow();
    });
  });
});
