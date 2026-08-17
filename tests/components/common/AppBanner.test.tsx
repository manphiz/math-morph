import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppBanner } from '../../../src/components/common/AppBanner';

describe('AppBanner component', () => {
  it('renders the branding logo and text', () => {
    render(<AppBanner />);
    expect(screen.getByText('Math')).toBeInTheDocument();
    expect(screen.getByText('Morph')).toBeInTheDocument();
    expect(screen.getByText('Interactive Visualizer')).toBeInTheDocument();
  });

  it('renders logo image inside banner', () => {
    const { container } = render(<AppBanner />);
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/Mathmorph_logo.png');
  });

  it('renders minimal side switch button when onToggleSidebarPosition is provided', () => {
    const onToggle = vi.fn();
    const { container } = render(
      <AppBanner 
        sidebarPosition="left" 
        onToggleSidebarPosition={onToggle} 
      />
    );
    const btn = container.querySelector('button[title="Move panel to right"]');
    expect(btn).toBeInTheDocument();
  });
});
