/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Param {
  val: number;
  color: string;
  originalVal: number;
  isMorphing: boolean;
  targetVal?: number;
  role?: 'coefficient' | 'exponent' | 'constant' | 'frequency' | 'shift';
  minRange?: number;
  maxRange?: number;
}

export interface ExportConfig {
  fps: 30 | 60;
  durationSec: number;
  resScale: 1 | 2;
  easing: 'linear' | 'easeInOut';
  loop: 'none' | 'ping-pong';
  from: number;
  to: number;
}

export interface VisualSettings {
  trails: boolean;
  glow: boolean;
  adaptiveTime: boolean;
  showRoots: boolean;
  show3DComplex: boolean;
}

export type Mode = 'muse' | 'pro';
export type ProTab = 'calculus' | 'linalg';

export interface EquationPreset {
  label: string;
  val: string;
  iconName: string;
}

export interface LinAlgPreset {
  label: string;
  val: number[][];
  iconName: string;
}
