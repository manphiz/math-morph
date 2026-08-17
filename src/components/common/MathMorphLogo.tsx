/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface MathMorphLogoProps {
  className?: string;
  size?: number;
}

export function MathMorphLogo({ className = "w-8 h-8", size = 32 }: MathMorphLogoProps) {
  return (
    <img
      src="/Mathmorph_logo.png"
      alt="MathMorph Logo"
      width={size}
      height={size}
      className={`rounded-lg object-contain drop-shadow-[0_0_12px_rgba(0,209,255,0.5)] ${className}`}
      referrerPolicy="no-referrer"
    />
  );
}

