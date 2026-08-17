import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LinAlgSection } from '../../../src/components/sidebar/LinAlgSection';

describe('LinAlgSection component', () => {
  const initialMatrix = [[1, 0], [0, 1]];

  it('renders matrix transformation inputs and preset triggers', () => {
    render(
      <LinAlgSection
        matrix={initialMatrix}
        setMatrix={() => {}}
      />
    );

    expect(screen.getByText('Transformation Matrix')).toBeInTheDocument();
    expect(screen.getByTitle('Identity')).toBeInTheDocument();
    expect(screen.getByTitle('Shear')).toBeInTheDocument();
  });

  it('updates matrix cells on change', () => {
    const setMatrix = vi.fn();
    render(
      <LinAlgSection
        matrix={initialMatrix}
        setMatrix={setMatrix}
      />
    );

    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[0], { target: { value: '2' } });
    expect(setMatrix).toHaveBeenCalled();
  });

  it('applies linear algebra transformation preset on click', () => {
    const setMatrix = vi.fn();
    render(
      <LinAlgSection
        matrix={initialMatrix}
        setMatrix={setMatrix}
      />
    );

    const shearBtn = screen.getByTitle('Shear');
    fireEvent.click(shearBtn);
    expect(setMatrix).toHaveBeenCalledWith([[1, 1], [0, 1]]);
  });
});
