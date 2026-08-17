import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CanvasOverlays } from '../../../src/components/canvas/CanvasOverlays';
import { ExportConfig } from '../../../src/types';

describe('CanvasOverlays component', () => {
  const exportConfig: ExportConfig = {
    fps: 60,
    durationSec: 3,
    resScale: 1,
    easing: 'easeInOut',
    loop: 'none',
    from: -5,
    to: 5
  };

  it('renders zoom hint and scale display button', () => {
    render(
      <CanvasOverlays
        showZoomHint={true}
        isExporting={false}
        isExportPreview={false}
        exportProgress={0}
        exportConfig={exportConfig}
        isEditingScale={false}
        setIsEditingScale={() => {}}
        tempScale="50"
        setTempScale={() => {}}
        scaleVal={50}
        setScaleVal={() => {}}
        mode="muse"
        showDerivative={false}
      />
    );

    expect(screen.getByText(/Scroll to Zoom/i)).toBeInTheDocument();
    expect(screen.getByText(/50%/i)).toBeInTheDocument();
  });

  it('switches to input on scale button click', () => {
    const setIsEditingScale = vi.fn();
    render(
      <CanvasOverlays
        showZoomHint={false}
        isExporting={false}
        isExportPreview={false}
        exportProgress={0}
        exportConfig={exportConfig}
        isEditingScale={false}
        setIsEditingScale={setIsEditingScale}
        tempScale="50"
        setTempScale={() => {}}
        scaleVal={50}
        setScaleVal={() => {}}
        mode="muse"
        showDerivative={false}
      />
    );

    const scaleBtn = screen.getByText(/Scale:/i);
    fireEvent.click(scaleBtn);
    expect(setIsEditingScale).toHaveBeenCalledWith(true);
  });

  it('renders export progress bar when isExporting is true', () => {
    render(
      <CanvasOverlays
        showZoomHint={false}
        isExporting={true}
        isExportPreview={false}
        exportProgress={45}
        exportConfig={exportConfig}
        isEditingScale={false}
        setIsEditingScale={() => {}}
        tempScale="50"
        setTempScale={() => {}}
        scaleVal={50}
        setScaleVal={() => {}}
        mode="muse"
        showDerivative={false}
      />
    );

    expect(screen.getByText(/Processing Animation/i)).toBeInTheDocument();
    expect(screen.getByText(/45%/i)).toBeInTheDocument();
    expect(screen.getByText(/Frame 81/i)).toBeInTheDocument();
  });
});
