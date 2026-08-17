import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ParameterControls } from '../../../src/components/sidebar/ParameterControls';
import { Param } from '../../../src/types';

describe('ParameterControls component', () => {
  const mockParams: Param[] = [
    {
      val: 5,
      originalVal: 5,
      color: '#00D1FF',
      role: 'coefficient',
      isMorphing: false,
      minRange: -10,
      maxRange: 10
    }
  ];

  it('renders active parameter details, slider, and controls', () => {
    render(
      <ParameterControls
        params={mockParams}
        activeIdx={0}
        onToggleMorph={() => {}}
        onUpdateParam={() => {}}
        onUpdateParamRange={() => {}}
      />
    );

    expect(screen.getByText(/Parameter 1/i)).toBeInTheDocument();
    expect(screen.getByText('5.00')).toBeInTheDocument();
  });

  it('handles slider changes', () => {
    const onUpdateParam = vi.fn();
    render(
      <ParameterControls
        params={mockParams}
        activeIdx={0}
        onToggleMorph={() => {}}
        onUpdateParam={onUpdateParam}
        onUpdateParamRange={() => {}}
      />
    );

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '7' } });
    expect(onUpdateParam).toHaveBeenCalledWith(0, '7');
  });

  it('handles min and max range updates on blur', () => {
    const onUpdateRange = vi.fn();
    render(
      <ParameterControls
        params={mockParams}
        activeIdx={0}
        onToggleMorph={() => {}}
        onUpdateParam={() => {}}
        onUpdateParamRange={onUpdateRange}
      />
    );

    const minInput = screen.getByDisplayValue('-10');
    fireEvent.change(minInput, { target: { value: '-20' } });
    fireEvent.blur(minInput);
    expect(onUpdateRange).toHaveBeenCalledWith(0, 'min', '-20');
  });

  it('triggers onToggleMorph when morph button is clicked', () => {
    const onToggleMorph = vi.fn();
    render(
      <ParameterControls
        params={mockParams}
        activeIdx={0}
        onToggleMorph={onToggleMorph}
        onUpdateParam={() => {}}
        onUpdateParamRange={() => {}}
      />
    );

    const morphBtn = screen.getByText('Morph');
    fireEvent.click(morphBtn);
    expect(onToggleMorph).toHaveBeenCalledWith(0);
  });
});
