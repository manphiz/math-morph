import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExportPanel } from '../../../src/components/sidebar/ExportPanel';
import { ExportConfig, VisualSettings } from '../../../src/types';

describe('ExportPanel component', () => {
  const exportConfig: ExportConfig = {
    fps: 60,
    durationSec: 3,
    resScale: 1,
    easing: 'easeInOut',
    loop: 'none',
    from: -5,
    to: 5
  };

  const visualSettings: VisualSettings = {
    trails: false,
    glow: true,
    adaptiveTime: true,
    showRoots: true,
    show3DComplex: false
  };

  it('renders export configurations, sweep ranges, and export trigger button', () => {
    render(
      <ExportPanel
        exportConfig={exportConfig}
        setExportConfig={() => {}}
        visualSettings={visualSettings}
        setVisualSettings={() => {}}
        showExportSettings={false}
        setShowExportSettings={() => {}}
        isExporting={false}
        exportProgress={0}
        isExportUnlocked={true}
        onExport={() => {}}
        onUnlockExport={() => {}}
      />
    );

    expect(screen.getByText('Export & Preview')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
  });

  it('calls onExport when clicking Export button', () => {
    const onExport = vi.fn();
    render(
      <ExportPanel
        exportConfig={exportConfig}
        setExportConfig={() => {}}
        visualSettings={visualSettings}
        setVisualSettings={() => {}}
        showExportSettings={false}
        setShowExportSettings={() => {}}
        isExporting={false}
        exportProgress={0}
        isExportUnlocked={true}
        onExport={onExport}
        onUnlockExport={() => {}}
      />
    );

    const exportBtn = screen.getByText('Export');
    fireEvent.click(exportBtn);
    expect(onExport).toHaveBeenCalledWith(false);
  });

  it('shows unlock button when export is locked', () => {
    const onUnlock = vi.fn();
    render(
      <ExportPanel
        exportConfig={exportConfig}
        setExportConfig={() => {}}
        visualSettings={visualSettings}
        setVisualSettings={() => {}}
        showExportSettings={false}
        setShowExportSettings={() => {}}
        isExporting={false}
        exportProgress={0}
        isExportUnlocked={false}
        onExport={() => {}}
        onUnlockExport={onUnlock}
      />
    );

    const unlockBtn = screen.getByText(/Unlock Export/i);
    expect(unlockBtn).toBeInTheDocument();
    fireEvent.click(unlockBtn);
    expect(onUnlock).toHaveBeenCalledTimes(1);
  });
});
