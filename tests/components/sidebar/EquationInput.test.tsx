import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EquationInput } from '../../../src/components/sidebar/EquationInput';

describe('EquationInput component', () => {
  it('renders input with provided rawInput value', () => {
    render(
      <EquationInput
        rawInput="x^2 - 1"
        setRawInput={() => {}}
        isValid={true}
        errorMsg=""
        onApplyEquation={() => {}}
      />
    );
    const input = screen.getByPlaceholderText('e.g. 5x^3 + 6x') as HTMLInputElement;
    expect(input.value).toBe('x^2 - 1');
  });

  it('calls setRawInput when user types', async () => {
    const setRawInput = vi.fn();
    render(
      <EquationInput
        rawInput=""
        setRawInput={setRawInput}
        isValid={true}
        errorMsg=""
        onApplyEquation={() => {}}
      />
    );
    const input = screen.getByPlaceholderText('e.g. 5x^3 + 6x');
    await userEvent.type(input, 'sin(x)');
    expect(setRawInput).toHaveBeenCalled();
  });

  it('calls onApplyEquation when Apply button is clicked', () => {
    const onApply = vi.fn();
    render(
      <EquationInput
        rawInput="x^2"
        setRawInput={() => {}}
        isValid={true}
        errorMsg=""
        onApplyEquation={onApply}
      />
    );
    const button = screen.getByTitle('Apply Equation (Enter)');
    fireEvent.click(button);
    expect(onApply).toHaveBeenCalledTimes(1);
  });

  it('calls onApplyEquation on Enter key press', () => {
    const onApply = vi.fn();
    render(
      <EquationInput
        rawInput="x^2"
        setRawInput={() => {}}
        isValid={true}
        errorMsg=""
        onApplyEquation={onApply}
      />
    );
    const input = screen.getByPlaceholderText('e.g. 5x^3 + 6x');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onApply).toHaveBeenCalledTimes(1);
  });

  it('displays error message when equation is invalid', () => {
    render(
      <EquationInput
        rawInput="x++"
        setRawInput={() => {}}
        isValid={false}
        errorMsg="Syntax Error in expression"
        onApplyEquation={() => {}}
      />
    );
    expect(screen.getByText('Syntax Error in expression')).toBeInTheDocument();
  });
});
