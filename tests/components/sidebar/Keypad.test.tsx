import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Keypad } from '../../../src/components/sidebar/Keypad';

describe('Keypad component', () => {
  it('is folded by default and unfolds when toggle button is clicked', () => {
    render(
      <Keypad
        showPresets={false}
        setShowPresets={() => {}}
        insertAtCursor={() => {}}
        onClear={() => {}}
        onSelectPreset={() => {}}
      />
    );

    // Folded by default
    expect(screen.queryByText('sin')).not.toBeInTheDocument();
    const toggleBtn = screen.getByTitle('Unfold function input panel');
    expect(toggleBtn).toBeInTheDocument();

    // Click to unfold
    fireEvent.click(toggleBtn);
    expect(screen.getByText('sin')).toBeInTheDocument();
  });

  it('renders math key buttons and triggers insertAtCursor when expanded', () => {
    const insertAtCursor = vi.fn();
    render(
      <Keypad
        showPresets={false}
        setShowPresets={() => {}}
        insertAtCursor={insertAtCursor}
        onClear={() => {}}
        onSelectPreset={() => {}}
        defaultExpanded={true}
      />
    );

    const sinBtn = screen.getByText('sin');
    fireEvent.click(sinBtn);
    expect(insertAtCursor).toHaveBeenCalledWith('sin(');

    const piBtn = screen.getByText('π');
    fireEvent.click(piBtn);
    expect(insertAtCursor).toHaveBeenCalledWith('PI');
  });

  it('clears rawInput on CLR click when expanded', () => {
    const onClear = vi.fn();
    render(
      <Keypad
        showPresets={false}
        setShowPresets={() => {}}
        insertAtCursor={() => {}}
        onClear={onClear}
        onSelectPreset={() => {}}
        defaultExpanded={true}
      />
    );

    const clearBtn = screen.getByText('CLR');
    fireEvent.click(clearBtn);
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('toggles preset drawer and allows selecting preset when expanded', () => {
    const setShowPresets = vi.fn();
    const onSelectPreset = vi.fn();
    
    render(
      <Keypad
        showPresets={true}
        setShowPresets={setShowPresets}
        insertAtCursor={() => {}}
        onClear={() => {}}
        onSelectPreset={onSelectPreset}
        defaultExpanded={true}
      />
    );

    const presetItem = screen.getByText('Circle');
    fireEvent.click(presetItem);
    expect(onSelectPreset).toHaveBeenCalledWith('x^2 + y^2 = 25');
  });
});

