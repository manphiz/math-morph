/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import p5 from 'p5';
import * as math from 'mathjs';
import { Mode, Param, ProTab, VisualSettings, ExportConfig } from '../../types';
import { translateMath } from '../../utils/mathParser';
import { CanvasOverlays } from './CanvasOverlays';

interface MathCanvasProps {
  scaleVal: number;
  setScaleVal: React.Dispatch<React.SetStateAction<number>>;
  ghostEq: string;
  normalizedInput: string;
  params: Param[];
  mode: Mode;
  showDerivative: boolean;
  showIntegral: boolean;
  isValid: boolean;
  offset: { x: number; y: number };
  setOffset: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  rotation3D: { x: number; y: number };
  setRotation3D: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  visualSettings: VisualSettings;
  pulse: number;
  setPulse: React.Dispatch<React.SetStateAction<number>>;
  transitionProgress: number;
  matrix: number[][];
  proTab: ProTab;
  isExporting: boolean;
  isExportPreview: boolean;
  exportProgress: number;
  exportConfig: ExportConfig;
  showZoomHint: boolean;
  setShowZoomHint: (show: boolean) => void;
  isEditingScale: boolean;
  setIsEditingScale: (editing: boolean) => void;
  tempScale: string;
  setTempScale: (val: string) => void;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  canvasElementRef: React.MutableRefObject<HTMLCanvasElement | null>;
  p5Instance: React.MutableRefObject<p5 | null>;
}

export function MathCanvas({
  scaleVal,
  setScaleVal,
  ghostEq,
  normalizedInput,
  params,
  mode,
  showDerivative,
  showIntegral,
  isValid,
  offset,
  setOffset,
  rotation3D,
  setRotation3D,
  visualSettings,
  pulse,
  setPulse,
  transitionProgress,
  matrix,
  proTab,
  isExporting,
  isExportPreview,
  exportProgress,
  exportConfig,
  showZoomHint,
  setShowZoomHint,
  isEditingScale,
  setIsEditingScale,
  tempScale,
  setTempScale,
  canvasRef,
  canvasElementRef,
  p5Instance
}: MathCanvasProps) {
  const lastNumRootsRef = useRef<number>(-1);

  const stateRef = useRef({
    scaleVal,
    ghostEq,
    rawInput: normalizedInput,
    params,
    mode,
    showDerivative,
    showIntegral,
    isValid,
    offset,
    rotation3D,
    isExporting,
    visualSettings,
    pulse,
    transitionProgress,
    matrix,
    proTab
  });

  useEffect(() => {
    stateRef.current = {
      scaleVal,
      ghostEq,
      rawInput: normalizedInput,
      params,
      mode,
      showDerivative,
      showIntegral,
      isValid,
      offset,
      rotation3D,
      isExporting,
      visualSettings,
      pulse,
      transitionProgress,
      matrix,
      proTab
    };
  }, [scaleVal, ghostEq, normalizedInput, params, mode, showDerivative, showIntegral, isValid, offset, rotation3D, isExporting, visualSettings, pulse, transitionProgress, matrix, proTab]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const sketch = (p: p5) => {
      const compiledCache = new Map<string, any>();

      const project = (x: number, y: number, z: number, scale: number, t: number) => {
        const { x: rotX, y: rotY } = stateRef.current.rotation3D;
        const currentRotX = rotX * t;
        const currentRotY = rotY * t;
        const currentZ = z * t;
        
        let x1 = x * Math.cos(currentRotY) + currentZ * Math.sin(currentRotY);
        let z1 = -x * Math.sin(currentRotY) + currentZ * Math.cos(currentRotY);
        let y2 = y * Math.cos(currentRotX) - z1 * Math.sin(currentRotX);
        
        return {
          x: x1 * scale,
          y: -y2 * scale
        };
      };

      p.setup = () => {
        const container = canvasRef.current!;
        const c = p.createCanvas(container.offsetWidth, container.offsetHeight);
        canvasElementRef.current = c.elt as HTMLCanvasElement;
      };

      p.draw = () => {
        const {
          scaleVal: currentScale,
          ghostEq: currentGhost,
          rawInput: currentRaw,
          params: currentParams,
          mode: currentMode,
          showDerivative: currentDeriv,
          showIntegral: currentInteg,
          isValid: currentValid,
          offset: currentOffset,
          visualSettings: currentVisuals,
          pulse: currentPulse,
          transitionProgress
        } = stateRef.current;
        
        // Reset drawing context state at the start of every frame to prevent leakage
        // @ts-ignore
        p.drawingContext.setLineDash([]);
        // @ts-ignore
        p.drawingContext.shadowBlur = 0;

        if (currentVisuals.trails) {
          p.push();
          p.resetMatrix();
          p.fill(10, 10, 10, 30);
          p.noStroke();
          p.rect(0, 0, p.width, p.height);
          p.pop();
        } else {
          p.background(10);
        }

        p.push();
        p.translate(p.width / 2 + currentOffset.x, p.height / 2 + currentOffset.y);

        // Adaptive Grid
        if (transitionProgress < 1) {
          const gridAlpha = 255 * (1 - transitionProgress);
          
          const targetSpacing = 80;
          const rawStep = targetSpacing / currentScale;
          const exponent = Math.floor(Math.log10(rawStep));
          const fraction = rawStep / Math.pow(10, exponent);
          
          let niceFraction;
          if (fraction < 1.5) niceFraction = 1;
          else if (fraction < 3.5) niceFraction = 2;
          else if (fraction < 7.5) niceFraction = 5;
          else niceFraction = 10;
          
          const logicalStep = niceFraction * Math.pow(10, exponent);
          const pixelStep = logicalStep * currentScale;
          
          const minorLogicalStep = logicalStep / 5;
          const minorPixelStep = minorLogicalStep * currentScale;

          const leftLogical = (-p.width / 2 - currentOffset.x) / currentScale;
          const rightLogical = (p.width / 2 - currentOffset.x) / currentScale;
          const topLogical = (-p.height / 2 - currentOffset.y) / currentScale;
          const bottomLogical = (p.height / 2 - currentOffset.y) / currentScale;

          const startX = Math.floor(leftLogical / minorLogicalStep);
          const endX = Math.ceil(rightLogical / minorLogicalStep);
          const startY = Math.floor(topLogical / minorLogicalStep);
          const endY = Math.ceil(bottomLogical / minorLogicalStep);

          // Minor grid lines
          p.strokeWeight(1);
          p.stroke(40, 40, 40, gridAlpha * 0.15);
          for (let i = startX; i <= endX; i++) {
            if (i % 5 === 0) continue;
            const x = i * minorPixelStep;
            p.line(x, topLogical * currentScale, x, bottomLogical * currentScale);
          }
          for (let i = startY; i <= endY; i++) {
            if (i % 5 === 0) continue;
            const y = i * minorPixelStep;
            p.line(leftLogical * currentScale, y, rightLogical * currentScale, y);
          }

          // Major grid lines
          p.strokeWeight(1);
          p.stroke(60, 60, 60, gridAlpha * 0.4);
          
          const majorStartX = Math.floor(leftLogical / logicalStep);
          const majorEndX = Math.ceil(rightLogical / logicalStep);
          const majorStartY = Math.floor(topLogical / logicalStep);
          const majorEndY = Math.ceil(bottomLogical / logicalStep);

          for (let i = majorStartX; i <= majorEndX; i++) {
            const x = i * pixelStep;
            p.line(x, topLogical * currentScale, x, bottomLogical * currentScale);
            
            // X Axis Numbers
            if (i !== 0) {
              p.fill(120, 120, 120, gridAlpha * 0.5);
              p.noStroke();
              p.textSize(10);
              p.textAlign(p.CENTER, p.TOP);
              const numStr = parseFloat((i * logicalStep).toPrecision(12)).toString();
              p.text(numStr, x, 8);
              p.strokeWeight(1);
              p.stroke(60, 60, 60, gridAlpha * 0.4);
            }
          }

          for (let i = majorStartY; i <= majorEndY; i++) {
            const y = i * pixelStep;
            p.line(leftLogical * currentScale, y, rightLogical * currentScale, y);
            
            // Y Axis Numbers
            if (i !== 0) {
              p.fill(120, 120, 120, gridAlpha * 0.5);
              p.noStroke();
              p.textSize(10);
              p.textAlign(p.RIGHT, p.CENTER);
              const numStr = parseFloat((-i * logicalStep).toPrecision(12)).toString();
              p.text(numStr, -8, y);
              p.strokeWeight(1);
              p.stroke(60, 60, 60, gridAlpha * 0.4);
            }
          }

          // Main 2D Axes
          p.strokeWeight(1.5);
          p.stroke(150, 150, 150, gridAlpha * 0.7);
          p.line(leftLogical * currentScale, 0, rightLogical * currentScale, 0);
          p.line(0, topLogical * currentScale, 0, bottomLogical * currentScale);
        }

        // Symmetry Pulse Effect (Subtle)
        if (currentPulse > 0) {
          p.push();
          p.noFill();
          p.stroke(0, 209, 255, currentPulse * 50);
          p.strokeWeight(currentPulse * 4);
          p.rect(-p.width, -p.height, p.width * 2, p.height * 2);
          p.pop();
          setPulse(prev => Math.max(0, prev - 0.02));
        }

        // 3D Axes
        if (transitionProgress > 0) {
          p.push();
          p.stroke(255, 255, 255, 60 * transitionProgress);
          p.strokeWeight(1);
          
          // X-axis (Real Input)
          p.beginShape();
          const xStart = project(-10, 0, 0, currentScale, transitionProgress);
          const xEnd = project(10, 0, 0, currentScale, transitionProgress);
          p.vertex(xStart.x, xStart.y);
          p.vertex(xEnd.x, xEnd.y);
          p.endShape();
          
          // Y-axis (Real Output)
          p.beginShape();
          const yStart = project(0, -10, 0, currentScale, transitionProgress);
          const yEnd = project(0, 10, 0, currentScale, transitionProgress);
          p.vertex(yStart.x, yStart.y);
          p.vertex(yEnd.x, yEnd.y);
          p.endShape();

          // Z-axis (Imaginary)
          p.beginShape();
          const zStart = project(0, 0, -10, currentScale, transitionProgress);
          const zEnd = project(0, 0, 10, currentScale, transitionProgress);
          p.vertex(zStart.x, zStart.y);
          p.vertex(zEnd.x, zEnd.y);
          p.endShape();

          // Origin marker
          const origin = project(0, 0, 0, currentScale, transitionProgress);
          p.fill(255, 255, 255, 80 * transitionProgress);
          p.noStroke();
          p.circle(origin.x, origin.y, 3);
          
          // Labels
          p.fill(255, 255, 255, 80 * transitionProgress);
          p.noStroke();
          p.textSize(10);
          const xLabel = project(11, 0, 0, currentScale, transitionProgress);
          p.text("Re(x)", xLabel.x, xLabel.y);
          const yLabel = project(0, 11, 0, currentScale, transitionProgress);
          p.text("Re(y)", yLabel.x, yLabel.y);
          const zLabel = project(0, 0, 11, currentScale, transitionProgress);
          p.text("Im(y)", zLabel.x, zLabel.y);
          p.pop();
        }

        // Linear Algebra Visualization
        if (stateRef.current.proTab === 'linalg' && currentMode === 'pro') {
          const m = stateRef.current.matrix;
          const gridAlpha = 255 * (1 - transitionProgress);
          
          p.push();
          p.strokeWeight(1);
          p.stroke(0, 209, 255, gridAlpha * 0.3);
          
          const range = 10;
          for (let i = -range; i <= range; i++) {
            const p1 = { x: i, y: -range };
            const p2 = { x: i, y: range };
            const tp1 = { x: (p1.x * m[0][0] + p1.y * m[0][1]) * currentScale, y: -(p1.x * m[1][0] + p1.y * m[1][1]) * currentScale };
            const tp2 = { x: (p2.x * m[0][0] + p2.y * m[0][1]) * currentScale, y: -(p2.x * m[1][0] + p2.y * m[1][1]) * currentScale };
            p.line(tp1.x, tp1.y, tp2.x, tp2.y);
            
            const p3 = { x: -range, y: i };
            const p4 = { x: range, y: i };
            const tp3 = { x: (p3.x * m[0][0] + p3.y * m[0][1]) * currentScale, y: -(p3.x * m[1][0] + p3.y * m[1][1]) * currentScale };
            const tp4 = { x: (p4.x * m[0][0] + p4.y * m[0][1]) * currentScale, y: -(p4.x * m[1][0] + p4.y * m[1][1]) * currentScale };
            p.line(tp3.x, tp3.y, tp4.x, tp4.y);
          }
          
          // i-hat basis vector
          p.strokeWeight(3);
          p.stroke(255, 100, 100, gridAlpha);
          const ihat = { x: m[0][0] * currentScale, y: -m[1][0] * currentScale };
          p.line(0, 0, ihat.x, ihat.y);
          p.push();
          p.translate(ihat.x, ihat.y);
          p.rotate(Math.atan2(ihat.y, ihat.x));
          p.fill(255, 100, 100, gridAlpha);
          p.triangle(0, 0, -8, -4, -8, 4);
          p.pop();
          
          // j-hat basis vector
          p.stroke(100, 255, 100, gridAlpha);
          const jhat = { x: m[0][1] * currentScale, y: -m[1][1] * currentScale };
          p.line(0, 0, jhat.x, jhat.y);
          p.push();
          p.translate(jhat.x, jhat.y);
          p.rotate(Math.atan2(jhat.y, jhat.x));
          p.fill(100, 255, 100, gridAlpha);
          p.triangle(0, 0, -8, -4, -8, 4);
          p.pop();
          
          p.pop();
        }

        if (currentValid && (currentMode === 'muse' || stateRef.current.proTab === 'calculus')) {
          if (currentGhost) {
            renderCurve(p, translateMath(currentGhost), p.color(255, 200, 100, 35), 1.2, [10, 5], currentScale);
          }
          
          const getActiveMathLocal = () => {
            const numRegex = /\d+(\.\d+)?|\bPI\b|\bE\b|\b(?![xy])[a-z]\b/gi;
            let i = 0;
            return translateMath(currentRaw.replace(numRegex, () => {
              const val = currentParams[i]?.val ?? 0;
              i++;
              return val.toString();
            }));
          };

          const eq = getActiveMathLocal();
          renderCurve(p, eq, p.color(0, 209, 255), 3, [], currentScale);
          
          // Render Live Equation Text (Publication Style)
          p.push();
          p.resetMatrix();
          
          p.fill(0, 0, 0, 100);
          p.noStroke();
          p.rect(15, p.height - 45, p.width - 30, 30, 10);

          p.fill(255, 255, 255, 220);
          p.textSize(15);
          p.textFont('Georgia, serif');
          p.textAlign(p.LEFT, p.CENTER);
          
          let xPos = 30;
          let yPos = p.height - 30;

          const numRegex = /\d+(\.\d+)?|\bPI\b|\bE\b|\b(?![xy])[a-z]\b/gi;
          let match: RegExpExecArray | null;
          let lastIndex = 0;
          let pIdx = 0;
          let nextIsSuperscript = false;

          const formatForPublication = (text: string) => {
            let formatted = text;
            formatted = formatted.replace(/\b1\.0([a-z])/gi, '$1');
            formatted = formatted.replace(/\b1([a-z])/gi, '$1');
            formatted = formatted.replace(/\+\s*-/g, '- ');
            formatted = formatted.replace(/-\s*-/g, '+ ');
            formatted = formatted.replace(/(\d+)\.0\b/g, '$1');
            return formatted;
          };

          const renderToken = (text: string, isItalic: boolean, isSup: boolean) => {
            const pubText = formatForPublication(text);
            if (isSup) {
              p.textSize(10);
              p.textStyle(p.NORMAL);
              p.text(pubText, xPos, yPos - 7);
              xPos += p.textWidth(pubText) + 1;
              p.textSize(15);
            } else {
              p.textStyle(isItalic ? p.ITALIC : p.NORMAL);
              p.text(pubText, xPos, yPos);
              xPos += p.textWidth(pubText);
            }
          };

          while ((match = numRegex.exec(currentRaw)) !== null) {
            let prefix = currentRaw.substring(lastIndex, match.index);
            const prefixTokens = prefix.split(/(\^|\*|\/|\+|\-|\(|\)|\s|=)/g).filter(t => t !== undefined && t !== '');
            for (let pt of prefixTokens) {
              if (pt === '^') {
                nextIsSuperscript = true;
                continue;
              }
              let displayPt = pt === '*' ? '·' : pt;
              renderToken(displayPt, pt === 'x' || pt === 'y', nextIsSuperscript);
              nextIsSuperscript = false;
            }

            const param = currentParams[pIdx];
            const matchStr = match[0].toUpperCase();
            const isPI = matchStr === 'PI';
            const isE = matchStr === 'E';
            let displayVal = param ? param.val.toFixed(1) : (isPI ? 'π' : (isE ? 'e' : match[0]));
            
            renderToken(displayVal, false, nextIsSuperscript);
            nextIsSuperscript = false;
            pIdx++;
            lastIndex = numRegex.lastIndex;
          }

          let suffix = currentRaw.substring(lastIndex);
          const suffixTokens = suffix.split(/(\^|\*|\/|\+|\-|\(|\)|\s|=)/g).filter(t => t !== undefined && t !== '');
          for (let st of suffixTokens) {
            if (st === '^') {
              nextIsSuperscript = true;
              continue;
            }
            let displaySt = st === '*' ? '·' : st;
            renderToken(displaySt, st === 'x' || st === 'y', nextIsSuperscript);
            nextIsSuperscript = false;
          }

          p.pop();

          // Pro Features: Complex, Derivative, Integral
          if (currentMode === 'pro') {
            if (currentDeriv) {
              renderDerivative(p, eq, p.color(255, 100, 255, 150), 2, currentScale);
            }
            if (currentInteg) {
              renderIntegral(p, eq, p.color(0, 255, 100, 50), currentScale);
            }
            renderCurve(p, eq, p.color(255, 50, 255, 180), 2, [2, 4], currentScale, true);
          }
        }

        p.pop();
      };

      const renderCurve = (p: p5, eq: string, col: p5.Color, weight: number, dash: number[], scale: number, imaginary = false) => {
        const currentVisuals = stateRef.current.visualSettings;
        const currentMode = stateRef.current.mode;
        const transitionProgress = stateRef.current.transitionProgress;
        const is3D = transitionProgress > 0 && currentMode === 'pro';

        if (imaginary && !is3D) return;

        let isImplicit = eq.includes('=');
        let finalEq = eq;
        
        if (isImplicit) {
          const parts = eq.split('=');
          const lhs = parts[0].trim();
          const rhs = (parts[1] || '0').trim();
          const isOnlyY = (s: string) => {
            const clean = s.replace(/\s/g, '');
            return clean === 'y' || clean === '1*y' || clean === 'y*1' || clean === '1y';
          };
          const hasY = (s: string) => /\by\b/.test(s);
          if (isOnlyY(lhs) && !hasY(rhs)) {
            isImplicit = false;
            finalEq = rhs;
          } else if (isOnlyY(rhs) && !hasY(lhs)) {
            isImplicit = false;
            finalEq = lhs;
          } else {
            finalEq = `(${lhs}) - (${rhs})`;
          }
        }

        let compiled: any = null;
        let f: Function | null = null;

        if (!isImplicit) {
          let cached = compiledCache.get(finalEq);
          if (!cached) {
            if (compiledCache.size > 100) compiledCache.clear();
            try {
              const mathExpr = finalEq.replace(/Math\./g, '').replace(/\*\*/g, '^');
              const mathjs = math.compile(mathExpr);
              const native = new Function('x', `try { return ${finalEq}; } catch(e) { return NaN; }`);
              cached = { mathjs, native };
              compiledCache.set(finalEq, cached);
            } catch (e) { return; }
          }
          compiled = cached;
        } else {
          let cached = compiledCache.get('implicit:' + finalEq);
          if (cached) {
            f = cached;
          } else {
            if (compiledCache.size > 100) compiledCache.clear();
            try { 
              f = new Function('x', 'y', `try { return ${finalEq}; } catch(e) { return NaN; }`); 
              compiledCache.set('implicit:' + finalEq, f);
            } catch (e) { return; }
          }
        }

        const explicitPoints: {x: number, y: number}[][] = [];
        const implicitSegments: {p1: {x: number, y: number}, p2: {x: number, y: number}}[] = [];
        const rootPositions: {x: number, y: number}[] = [];
        let currentRoots = 0;

        if (!isImplicit && compiled) {
          const { mathjs, native } = compiled;
          const step = 0.01;
          let currentSegment: {x: number, y: number}[] = [];
          let prevRe: number | null = null;
          let prevIm: number | null = null;
          let prevValid = false;
          let prevX = (-p.width / scale) - step;

          const evalAt = (x_val: number) => {
            try {
              const nRes = native(x_val);
              if (typeof nRes === 'number' && !isNaN(nRes)) {
                return { valid: isFinite(nRes), re: nRes, im: 0 };
              }
              const result = mathjs.evaluate({ x: x_val });
              let re = 0, im = 0;
              if (typeof result === 'number') re = result;
              else if (result && result.isComplex) { re = result.re; im = result.im; }
              else if (typeof result === 'object' && result !== null) { re = Number(result.re) || 0; im = Number(result.im) || 0; }
              const hasSignificantImaginary = Math.abs(im) > 0.001;
              const valid = isFinite(re) && (!hasSignificantImaginary || transitionProgress > 0.01);
              return { valid, re, im };
            } catch (e) {
              return { valid: false, re: 0, im: 0 };
            }
          };

          const findBoundary = (xLeft: number, xRight: number, leftValid: boolean) => {
            let low = xLeft;
            let high = xRight;
            let bestValidX = leftValid ? xLeft : xRight;
            let bestValidRe = 0;
            let bestValidIm = 0;

            for (let i = 0; i < 8; i++) {
              const mid = (low + high) / 2;
              const res = evalAt(mid);
              if (res.valid) {
                bestValidX = mid;
                bestValidRe = res.re;
                bestValidIm = res.im;
                if (leftValid) low = mid;
                else high = mid;
              } else {
                if (leftValid) high = mid;
                else low = mid;
              }
            }
            return { x: bestValidX, re: bestValidRe, im: bestValidIm };
          };

          for (let x = -p.width / scale; x <= p.width / scale; x += step) {
            const curr = evalAt(x);
            const jumpThreshold = 300 / scale;

            if (!imaginary && currentVisuals.showRoots && curr.valid && prevValid && prevRe !== null && prevRe * curr.re <= 0 && Math.abs(curr.im) < 0.01) {
              currentRoots++;
              rootPositions.push(project(x, 0, 0, scale, transitionProgress));
            }

            if (imaginary) {
              if (Math.abs(curr.im) > 0.0001 && isFinite(curr.im)) {
                if (prevIm !== null && Math.abs(curr.im - prevIm) > jumpThreshold) {
                  if (currentSegment.length > 0) explicitPoints.push(currentSegment);
                  currentSegment = [];
                }
                const pos = project(x, 0, curr.im, scale, transitionProgress);
                currentSegment.push(pos);
                prevIm = curr.im;
              } else {
                if (currentSegment.length > 0) explicitPoints.push(currentSegment);
                currentSegment = [];
                prevIm = null;
              }
            } else {
              if (curr.valid) {
                if (!prevValid && prevX >= -p.width / scale) {
                  const bound = findBoundary(prevX, x, false);
                  const pos = project(bound.x, bound.re, is3D ? bound.im : 0, scale, transitionProgress);
                  currentSegment.push(pos);
                  prevRe = bound.re;
                }
                if (prevRe !== null && Math.abs(curr.re - prevRe) > jumpThreshold) {
                  if (currentSegment.length > 0) explicitPoints.push(currentSegment);
                  currentSegment = [];
                }
                const pos = project(x, curr.re, is3D ? curr.im : 0, scale, transitionProgress);
                currentSegment.push(pos);
                prevRe = curr.re;
              } else {
                if (prevValid) {
                  const bound = findBoundary(prevX, x, true);
                  if (prevRe !== null && Math.abs(bound.re - prevRe) <= jumpThreshold) {
                    const pos = project(bound.x, bound.re, is3D ? bound.im : 0, scale, transitionProgress);
                    currentSegment.push(pos);
                  }
                }
                if (currentSegment.length > 0) explicitPoints.push(currentSegment);
                currentSegment = [];
                prevRe = null;
              }
            }
            prevValid = curr.valid;
            prevX = x;
          }
          if (currentSegment.length > 0) explicitPoints.push(currentSegment);

          if (!imaginary && currentVisuals.showRoots) {
            if (currentRoots !== lastNumRootsRef.current) {
              setPulse(1.0);
              lastNumRootsRef.current = currentRoots;
            }
          }
        } else if (isImplicit && f) {
          const res = 2;
          const w_half = p.width / 2;
          const h_half = p.height / 2;
          for (let i = -w_half; i <= w_half; i += res) {
            for (let j = -h_half; j <= h_half; j += res) {
              try {
                const x1 = i / scale, y1 = -j / scale, x2 = (i + res) / scale, y2 = -(j + res) / scale;
                const v1 = f(x1, y1), v2 = f(x2, y1), v3 = f(x1, y2), v4 = f(x2, y2);
                const points: {x: number, y: number}[] = [];
                if (v1 * v2 <= 0 && v1 !== v2) points.push({ x: i + (Math.abs(v1) / (Math.abs(v1) + Math.abs(v2))) * res, y: j });
                if (v1 * v3 <= 0 && v1 !== v3) points.push({ x: i, y: j + (Math.abs(v1) / (Math.abs(v1) + Math.abs(v3))) * res });
                if (v2 * v4 <= 0 && v2 !== v4) points.push({ x: i + res, y: j + (Math.abs(v2) / (Math.abs(v2) + Math.abs(v4))) * res });
                if (v3 * v4 <= 0 && v3 !== v4) points.push({ x: i + (Math.abs(v3) / (Math.abs(v3) + Math.abs(v4))) * res, y: j + res });
                if (points.length >= 2) {
                  const p1 = project(points[0].x / scale, -points[0].y / scale, 0, scale, transitionProgress);
                  const p2 = project(points[1].x / scale, -points[1].y / scale, 0, scale, transitionProgress);
                  implicitSegments.push({ p1, p2 });
                }
              } catch (e) {}
            }
          }
        }

        const drawPass = (w: number, blur: number, alphaMult: number) => {
          // @ts-ignore
          p.drawingContext.setLineDash(dash || []);
          p.noFill();
          const alpha = p.alpha(col) * alphaMult * (imaginary ? transitionProgress : 1);
          p.stroke(p.red(col), p.green(col), p.blue(col), alpha);
          p.strokeWeight(w);
          
          if (currentVisuals.glow && blur > 0) {
            // @ts-ignore
            p.drawingContext.shadowBlur = blur;
            // @ts-ignore
            p.drawingContext.shadowColor = col.toString();
          } else {
            // @ts-ignore
            p.drawingContext.shadowBlur = 0;
          }

          if (!isImplicit) {
            explicitPoints.forEach(segment => {
              p.beginShape();
              segment.forEach(pt => p.vertex(pt.x, pt.y));
              p.endShape();
            });
          } else {
            implicitSegments.forEach(seg => {
              p.line(seg.p1.x, seg.p1.y, seg.p2.x, seg.p2.y);
            });
          }
        };

        drawPass(weight + 2, 12, 0.3);
        drawPass(weight * 0.4, 0, 1.0);

        if (!imaginary && !isImplicit && currentVisuals.showRoots) {
          rootPositions.forEach(pos => {
            p.push();
            p.fill(col);
            p.noStroke();
            // @ts-ignore
            if (currentVisuals.glow) p.drawingContext.shadowBlur = 15;
            p.circle(pos.x, pos.y, 5);
            p.pop();
          });
        }

        // @ts-ignore
        p.drawingContext.setLineDash([]);
        // @ts-ignore
        p.drawingContext.shadowBlur = 0;
      };

      const renderDerivative = (p: p5, eq: string, col: p5.Color, weight: number, scale: number) => {
        const currentMode = stateRef.current.mode;
        const transitionProgress = stateRef.current.transitionProgress;
        const is3D = transitionProgress > 0 && currentMode === 'pro';

        p.noFill();
        p.stroke(col);
        p.strokeWeight(weight);
        
        let finalEq = eq;
        if (eq.includes('=')) {
          const parts = eq.split('=');
          const lhs = parts[0].trim();
          const rhs = (parts[1] || '0').trim();
          if (lhs === 'y' || lhs === 'f(x)') finalEq = rhs;
          else finalEq = `(${lhs}) - (${rhs})`;
        }

        let cached = compiledCache.get('mathjs:' + finalEq);
        if (!cached) {
          if (compiledCache.size > 100) compiledCache.clear();
          try {
            const mathExpr = finalEq.replace(/Math\./g, '').replace(/\*\*/g, '^');
            cached = math.compile(mathExpr);
            compiledCache.set('mathjs:' + finalEq, cached);
          } catch (e) { return; }
        }
        const compiled = cached;

        const h = 0.001;
        const step = 0.05;
        const jumpThreshold = 300 / scale;

        p.beginShape();
        let prevRe: number | null = null;
        for (let x = -p.width / scale; x <= p.width / scale; x += step) {
          try {
            const v1 = compiled.evaluate({ x });
            const v2 = compiled.evaluate({ x: x + h });
            const diff = math.divide(math.subtract(v2, v1), h);
            
            let re = 0;
            let im = 0;
            if (typeof diff === 'number') {
              re = diff;
            } else if (diff && (diff as any).isComplex) {
              re = (diff as any).re;
              im = (diff as any).im;
            }

            const hasSignificantIm = Math.abs(im) > 0.001;
            if (isFinite(re) && (!hasSignificantIm || transitionProgress > 0.01)) {
              if (prevRe !== null && Math.abs(re - prevRe) > jumpThreshold) {
                p.endShape();
                p.beginShape();
              }
              const pos = project(x, re, is3D ? im : 0, scale, transitionProgress);
              p.vertex(pos.x, pos.y);
              prevRe = re;
            } else {
              p.endShape();
              p.beginShape();
              prevRe = null;
            }
          } catch (e) {
            prevRe = null;
          }
        }
        p.endShape();

        if (is3D) {
          p.push();
          p.stroke(p.red(col), p.green(col), p.blue(col), p.alpha(col) * 0.4 * transitionProgress);
          // @ts-ignore
          p.drawingContext.setLineDash([2, 4]);
          p.beginShape();
          let prevIm: number | null = null;
          for (let x = -p.width / scale; x <= p.width / scale; x += step) {
            try {
              const v1 = compiled.evaluate({ x });
              const v2 = compiled.evaluate({ x: x + h });
              const diff = math.divide(math.subtract(v2, v1), h);
              
              let im = 0;
              if (diff && (diff as any).isComplex) {
                im = (diff as any).im;
              }

              if (isFinite(im) && Math.abs(im) > 0.001) {
                if (prevIm !== null && Math.abs(im - prevIm) > jumpThreshold) {
                  p.endShape();
                  p.beginShape();
                }
                const pos = project(x, 0, im, scale, transitionProgress);
                p.vertex(pos.x, pos.y);
                prevIm = im;
              } else {
                p.endShape();
                p.beginShape();
                prevIm = null;
              }
            } catch (e) {
              prevIm = null;
            }
          }
          p.endShape();
          p.pop();
        }
      };

      const renderIntegral = (p: p5, eq: string, col: p5.Color, scale: number) => {
        const transitionProgress = stateRef.current.transitionProgress;
        
        p.fill(col);
        p.noStroke();
        
        let finalEq = eq;
        if (eq.includes('=')) {
          const parts = eq.split('=');
          const lhs = parts[0].trim();
          const rhs = (parts[1] || '0').trim();
          if (lhs === 'y' || lhs === 'f(x)') finalEq = rhs;
          else finalEq = `(${lhs}) - (${rhs})`;
        }

        let cached = compiledCache.get('mathjs:' + finalEq);
        if (!cached) {
          if (compiledCache.size > 100) compiledCache.clear();
          try {
            const mathExpr = finalEq.replace(/Math\./g, '').replace(/\*\*/g, '^');
            cached = math.compile(mathExpr);
            compiledCache.set('mathjs:' + finalEq, cached);
          } catch (e) { return; }
        }
        const compiled = cached;
        
        p.beginShape();
        const origin = project(0, 0, 0, scale, transitionProgress);
        p.vertex(origin.x, origin.y);
        
        for (let x = 0; x <= p.width / scale; x += 0.1) {
          try {
            const result = compiled.evaluate({ x });
            let y = 0;
            if (typeof result === 'number') {
              y = result;
            } else if (result && (result as any).isComplex) {
              y = (result as any).re;
            }
            
            if (!isNaN(y) && isFinite(y)) {
              const pos = project(x, y, 0, scale, transitionProgress);
              p.vertex(pos.x, pos.y);
            }
          } catch (e) {}
        }
        const endX = p.width / scale;
        const endPoint = project(endX, 0, 0, scale, transitionProgress);
        p.vertex(endPoint.x, endPoint.y);
        p.endShape(p.CLOSE);
      };

      p.mouseWheel = (event: any) => {
        const { isExporting: exporting } = stateRef.current;
        if (exporting) return false;
        
        if (p.mouseX > 0 && p.mouseX < p.width && p.mouseY > 0 && p.mouseY < p.height) {
          const zoomFactor = event.delta > 0 ? 0.92 : 1.08;
          setScaleVal(prev => {
            const next = prev * zoomFactor;
            return Math.max(5, Math.min(1000, next));
          });
          return false;
        }
      };

      p.mouseDragged = () => {
        const { isExporting: exporting, visualSettings: currentVisuals, mode: currentMode } = stateRef.current;
        if (exporting) return;

        // Skip single-finger mouseDragged pan if currently doing a two-finger pinch gesture on touch devices
        // @ts-ignore
        if (p.touches && p.touches.length > 1) return;

        const is3D = currentVisuals.show3DComplex && currentMode === 'pro';

        if (p.mouseX > 0 && p.mouseX < p.width && p.mouseY > 0 && p.mouseY < p.height) {
          if (is3D && p.keyIsDown(p.SHIFT)) {
            setRotation3D(prev => ({
              x: prev.x + (p.mouseY - p.pmouseY) * 0.01,
              y: prev.y + (p.mouseX - p.pmouseX) * 0.01
            }));
          } else {
            setOffset(prev => ({
              x: prev.x + (p.mouseX - p.pmouseX),
              y: prev.y + (p.mouseY - p.pmouseY)
            }));
          }
        }
      };

      // Native multi-touch pinch-to-zoom & pan handling for iOS & mobile devices
      let initialPinchDistance: number | null = null;
      let initialScaleOnPinch = 50;
      let initialMidpoint: { x: number; y: number } | null = null;
      let initialOffsetOnPinch = { x: 0, y: 0 };

      const getTouchDistance = (t1: Touch, t2: Touch) => {
        const dx = t1.clientX - t2.clientX;
        const dy = t1.clientY - t2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
      };

      const getTouchMidpoint = (t1: Touch, t2: Touch) => ({
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
      });

      const handleCanvasTouchStart = (e: TouchEvent) => {
        const { isExporting: exporting } = stateRef.current;
        if (exporting) return;

        if (e.touches.length === 2) {
          e.preventDefault();
          setShowZoomHint(false);
          const t1 = e.touches[0];
          const t2 = e.touches[1];
          initialPinchDistance = getTouchDistance(t1, t2);
          initialScaleOnPinch = scaleValRef.current;
          initialMidpoint = getTouchMidpoint(t1, t2);
          initialOffsetOnPinch = { ...offsetRef.current };
        } else if (e.touches.length === 1) {
          initialPinchDistance = null;
          initialMidpoint = null;
        }
      };

      const handleCanvasTouchMove = (e: TouchEvent) => {
        const { isExporting: exporting } = stateRef.current;
        if (exporting) return;

        if (e.touches.length === 2 && initialPinchDistance !== null && initialMidpoint !== null) {
          e.preventDefault();
          const t1 = e.touches[0];
          const t2 = e.touches[1];
          const currentDistance = getTouchDistance(t1, t2);
          
          if (initialPinchDistance > 0) {
            const pinchRatio = currentDistance / initialPinchDistance;
            const nextScale = Math.max(5, Math.min(1000, initialScaleOnPinch * pinchRatio));
            setScaleVal(nextScale);
          }

          // Two-finger smooth pan translation
          const currentMidpoint = getTouchMidpoint(t1, t2);
          const dx = currentMidpoint.x - initialMidpoint.x;
          const dy = currentMidpoint.y - initialMidpoint.y;
          setOffset({
            x: initialOffsetOnPinch.x + dx,
            y: initialOffsetOnPinch.y + dy,
          });
        }
      };

      const handleCanvasTouchEnd = (e: TouchEvent) => {
        if (e.touches.length < 2) {
          initialPinchDistance = null;
          initialMidpoint = null;
        }
      };

      const canvasHolder = canvasRef.current;
      let cleanupTouchListeners: (() => void) | null = null;
      if (canvasHolder) {
        canvasHolder.addEventListener('touchstart', handleCanvasTouchStart, { passive: false });
        canvasHolder.addEventListener('touchmove', handleCanvasTouchMove, { passive: false });
        canvasHolder.addEventListener('touchend', handleCanvasTouchEnd, { passive: false });
        canvasHolder.addEventListener('touchcancel', handleCanvasTouchEnd, { passive: false });

        cleanupTouchListeners = () => {
          canvasHolder.removeEventListener('touchstart', handleCanvasTouchStart);
          canvasHolder.removeEventListener('touchmove', handleCanvasTouchMove);
          canvasHolder.removeEventListener('touchend', handleCanvasTouchEnd);
          canvasHolder.removeEventListener('touchcancel', handleCanvasTouchEnd);
        };
      }

      p.windowResized = () => {
        if (canvasRef.current) {
          p.resizeCanvas(canvasRef.current.offsetWidth, canvasRef.current.offsetHeight);
        }
      };

      // Expose cleanup
      (sketch as any).cleanupTouch = cleanupTouchListeners;
    };

    let ro: ResizeObserver | null = null;
    let rafId: number | null = null;
    let lastW = 0;
    let lastH = 0;

    if (typeof ResizeObserver !== 'undefined' && canvasRef.current) {
      ro = new ResizeObserver((entries) => {
        if (!entries || entries.length === 0) return;
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
        }
        rafId = requestAnimationFrame(() => {
          if (canvasRef.current && p5Instance.current) {
            const newW = canvasRef.current.offsetWidth;
            const newH = canvasRef.current.offsetHeight;
            if (newW > 0 && newH > 0 && (newW !== lastW || newH !== lastH)) {
              lastW = newW;
              lastH = newH;
              p5Instance.current.resizeCanvas(newW, newH);
            }
          }
        });
      });
      ro.observe(canvasRef.current);
    }

    p5Instance.current = new p5(sketch, canvasRef.current);

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      ro?.disconnect();
      if ((sketch as any).cleanupTouch) {
        (sketch as any).cleanupTouch();
      }
      p5Instance.current?.remove();
    };
  }, []);

  return (
    <main className="w-full h-full bg-[#050505] relative flex items-center justify-center p-2 sm:p-4 landscape:p-6 lg:p-10">
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />
      
      <div 
        id="canvas-holder" 
        ref={canvasRef}
        className="w-full h-full max-w-full max-h-full bg-black border border-white/10 rounded-lg shadow-2xl relative overflow-hidden [&>canvas]:max-w-full [&>canvas]:max-h-full [&>canvas]:block"
        onWheel={() => setShowZoomHint(false)}
        onMouseDown={() => setShowZoomHint(false)}
      >
        <CanvasOverlays 
          showZoomHint={showZoomHint}
          isExporting={isExporting}
          isExportPreview={isExportPreview}
          exportProgress={exportProgress}
          exportConfig={exportConfig}
          isEditingScale={isEditingScale}
          setIsEditingScale={setIsEditingScale}
          tempScale={tempScale}
          setTempScale={setTempScale}
          scaleVal={scaleVal}
          setScaleVal={setScaleVal}
          mode={mode}
          showDerivative={showDerivative}
        />
      </div>
    </main>
  );
}
