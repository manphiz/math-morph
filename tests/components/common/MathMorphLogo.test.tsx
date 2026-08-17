import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MathMorphLogo } from '../../../src/components/common/MathMorphLogo';

describe('MathMorphLogo component', () => {
  it('renders the MathMorph logo image', () => {
    const { container } = render(<MathMorphLogo />);
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/Mathmorph_logo.png');
    expect(img).toHaveAttribute('alt', 'MathMorph Logo');
  });
});
