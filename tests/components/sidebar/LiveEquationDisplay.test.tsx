import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LiveEquationDisplay } from '../../../src/components/sidebar/LiveEquationDisplay';
import { Param } from '../../../src/types';

describe('LiveEquationDisplay component', () => {
  const mockParams: Param[] = [
    {
      val: 5,
      originalVal: 5,
      color: '#00D1FF',
      role: 'coefficient',
      isMorphing: false
    },
    {
      val: 2,
      originalVal: 2,
      color: '#FFD166',
      role: 'exponent',
      isMorphing: false
    }
  ];

  it('renders interactive parameter tokens', () => {
    render(
      <LiveEquationDisplay
        normalizedInput="5x^2"
        params={mockParams}
        activeIdx={0}
        onTokenClick={() => {}}
        onResetGhost={() => {}}
      />
    );

    expect(screen.getByText('5.0')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('calls onTokenClick with index when clicking token badge', () => {
    const onTokenClick = vi.fn();
    render(
      <LiveEquationDisplay
        normalizedInput="5x^2"
        params={mockParams}
        activeIdx={0}
        onTokenClick={onTokenClick}
        onResetGhost={() => {}}
      />
    );

    const token = screen.getByText('5.0');
    fireEvent.click(token);
    expect(onTokenClick).toHaveBeenCalledWith(0);
  });

  it('calls onResetGhost on Reset Ref button click', () => {
    const onReset = vi.fn();
    render(
      <LiveEquationDisplay
        normalizedInput="5x^2"
        params={mockParams}
        activeIdx={0}
        onTokenClick={() => {}}
        onResetGhost={onReset}
      />
    );

    const resetBtn = screen.getByText('Reset Ref');
    fireEvent.click(resetBtn);
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
