/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Circle, Spline, Waves, TrendingUp, Bell, Heart, MoveHorizontal, Orbit, 
  Zap, Triangle, Wind, CircleOff, ArrowRightLeft, Flame, Box, RefreshCw, 
  Repeat, Flower2, AudioLines, Dna, Square, RotateCw, Scaling, ArrowDown, 
  FlipHorizontal, Minimize2, Hash
} from 'lucide-react';

export const COLORS = ['#FF5555', '#55FF55', '#55ACFF', '#FFAC55', '#FF55FF', '#FFFF55'];

// Feature Flag for Release
// Set to true to re-enable Pro mode features (Calculus, Lin-Alg, 3D, etc.)
export const ENABLE_PRO_MODE = false;

export interface PresetItem {
  label: string;
  val: string;
  icon: React.ReactNode;
}

export interface LinAlgPresetItem {
  label: string;
  val: number[][];
  icon: React.ReactNode;
}

export const PRESETS: PresetItem[] = [
  { label: 'Circle', val: 'x^2 + y^2 = 25', icon: <Circle className="w-4 h-4" /> },
  { label: 'Parabola', val: 'x^2', icon: <Spline className="w-4 h-4" /> },
  { label: 'Sine', val: 'sin(x)', icon: <Waves className="w-4 h-4" /> },
  { label: 'Exponential', val: 'exp(x)', icon: <TrendingUp className="w-4 h-4" /> },
  { label: 'Logistic', val: '1 / (1 + exp(-x))', icon: <ActivityIcon className="w-4 h-4" /> },
  { label: 'Gaussian', val: 'exp(-x^2)', icon: <Bell className="w-4 h-4" /> },
  { label: 'Heart', val: '(x^2 + y^2 - 1)^3 - x^2 * y^3 = 0', icon: <Heart className="w-4 h-4" /> },
  { label: 'Hyperbola', val: 'x^2 - y^2 = 1', icon: <MoveHorizontal className="w-4 h-4" /> },
  { label: 'Spiral', val: 'x*cos(x) - y*sin(x) = 0', icon: <Orbit className="w-4 h-4" /> },
  { label: 'Pair Creation', val: 'x^2 - 1', icon: <Zap className="w-4 h-4" /> },
  { label: 'Cusp Formation', val: 'y^2 = x^3 + 1x', icon: <Triangle className="w-4 h-4" /> },
  { label: 'Shock Formation', val: 'tanh(1x)', icon: <Wind className="w-4 h-4" /> },
  { label: 'Hole Appears', val: '(x^2 - 1^2) / (x - 1)', icon: <CircleOff className="w-4 h-4" /> },
  { label: 'Asymptote Collision', val: '1 / (x - 1)', icon: <ArrowRightLeft className="w-4 h-4" /> },
  { label: 'Blow-Up', val: 'tan(1x)', icon: <Flame className="w-4 h-4" /> },
  { label: 'Symmetry Breaking', val: 'x^4 + 1x', icon: <Box className="w-4 h-4" /> },
  { label: 'Twist', val: 'x^2 + 1xy + y^2 = 1', icon: <RefreshCw className="w-4 h-4" /> },
  { label: 'Loop Birth', val: 'x^2 = y(y - 1)^2', icon: <Repeat className="w-4 h-4" /> },
  { label: 'Polar Rose', val: 'sqrt(x^2 + y^2) = cos(3 * atan2(y, x))', icon: <Flower2 className="w-4 h-4" /> },
  { label: 'Wave Packet', val: 'exp(-1x^2) * sin(x)', icon: <AudioLines className="w-4 h-4" /> },
  { label: 'Double Well', val: 'x^4 - 1x^2', icon: <Dna className="w-4 h-4" /> }
];

function ActivityIcon(props: React.ComponentProps<typeof Circle>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={props.className}
    >
      <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.48 12H2" />
    </svg>
  );
}

export const VALIDATION_POINTS: Record<string, { x: number; y: number }[]> = {
  'Circle': [{ x: 5, y: 0 }, { x: 0, y: 5 }, { x: 3, y: 4 }],
  'Parabola': [{ x: 0, y: 0 }, { x: 2, y: 4 }, { x: -3, y: 9 }],
  'Heart': [{ x: 0, y: 1 }, { x: 1, y: 0 }, { x: -1, y: 0 }]
};

export const LINALG_PRESETS: LinAlgPresetItem[] = [
  { label: 'Identity', val: [[1, 0], [0, 1]], icon: <Square className="w-4 h-4" /> },
  { label: 'Rotation 45°', val: [[0.707, -0.707], [0.707, 0.707]], icon: <RotateCw className="w-4 h-4" /> },
  { label: 'Shear', val: [[1, 1], [0, 1]], icon: <Scaling className="rotate-45 w-4 h-4" /> },
  { label: 'Scaling', val: [[2, 0], [0, 0.5]], icon: <Scaling className="w-4 h-4" /> },
  { label: 'Projection (X)', val: [[1, 0], [0, 0]], icon: <ArrowDown className="w-4 h-4" /> },
  { label: 'Reflection (Y=X)', val: [[0, 1], [1, 0]], icon: <FlipHorizontal className="w-4 h-4" /> },
  { label: 'Determinant 0', val: [[1, 1], [1, 1]], icon: <Minimize2 className="w-4 h-4" /> },
  { label: 'Eigenvectors', val: [[2, 1], [1, 2]], icon: <Hash className="w-4 h-4" /> }
];
