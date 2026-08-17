import { describe, it, expect } from 'vitest';
import { easeInOutCubic, lerp, exportWebM } from '../../src/utils/exportRecorder';

describe('exportRecorder utils', () => {
  describe('easeInOutCubic', () => {
    it('should calculate correct boundary and midpoint values', () => {
      expect(easeInOutCubic(0)).toBe(0);
      expect(easeInOutCubic(1)).toBe(1);
      expect(easeInOutCubic(0.5)).toBe(0.5);
    });

    it('should be symmetric and smooth', () => {
      const t1 = 0.25;
      const t2 = 0.75;
      expect(easeInOutCubic(t1) + easeInOutCubic(t2)).toBeCloseTo(1, 5);
    });
  });

  describe('lerp', () => {
    it('should linearly interpolate between numbers', () => {
      expect(lerp(0, 10, 0.5)).toBe(5);
      expect(lerp(-5, 5, 0.5)).toBe(0);
      expect(lerp(10, 20, 0)).toBe(10);
      expect(lerp(10, 20, 1)).toBe(20);
    });
  });

  describe('exportWebM', () => {
    it('should return recorder and stopped promise', async () => {
      const canvas = document.createElement('canvas');
      const res = await exportWebM(canvas, 30);
      expect(res.recorder).toBeDefined();
      expect(res.stopped).toBeInstanceOf(Promise);

      res.recorder.stop();
      const blob = await res.stopped;
      expect(blob).toBeInstanceOf(Blob);
    });
  });
});
