import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProAnalysisToggles } from '../../../src/components/sidebar/ProAnalysisToggles';
import { VisualSettings } from '../../../src/types';

describe('ProAnalysisToggles component', () => {
  const defaultVisuals: VisualSettings = {
    trails: false,
    glow: true,
    adaptiveTime: true,
    showRoots: true,
    show3DComplex: false
  };

  it('renders analysis toggles for derivative, integral, and 3D complex plane', () => {
    render(
      <ProAnalysisToggles
        showDerivative={false}
        setShowDerivative={() => {}}
        showIntegral={false}
        setShowIntegral={() => {}}
        visualSettings={defaultVisuals}
        setVisualSettings={() => {}}
      />
    );

    expect(screen.getByText(/Derivative/i)).toBeInTheDocument();
    expect(screen.getByText(/Integral/i)).toBeInTheDocument();
    expect(screen.getByText(/3D Complex Visualization/i)).toBeInTheDocument();
  });

  it('triggers setShowDerivative on toggle', () => {
    const setShowDerivative = vi.fn();
    render(
      <ProAnalysisToggles
        showDerivative={false}
        setShowDerivative={setShowDerivative}
        showIntegral={false}
        setShowIntegral={() => {}}
        visualSettings={defaultVisuals}
        setVisualSettings={() => {}}
      />
    );

    const toggle = screen.getByText(/Derivative/i).closest('label')?.querySelector('input');
    if (toggle) fireEvent.click(toggle);
    expect(setShowDerivative).toHaveBeenCalled();
  });
});
