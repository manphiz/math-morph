/**
 * @file ResponsiveLayout.test.tsx
 * Tests verifying portrait & landscape adaptive layout structure
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';

vi.mock('p5', () => {
  return {
    default: class MockP5 {
      remove = vi.fn();
      resizeCanvas = vi.fn();
      constructor(sketch?: any, node?: any) {}
    }
  };
});

import App from '../../../src/App';

describe('Responsive Layout tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  it('renders top-level container with portrait flex-col and landscape/desktop flex-row classes', () => {
    const { container } = render(<App />);
    const rootContainer = container.firstElementChild as HTMLElement;
    expect(rootContainer).toBeInTheDocument();
    expect(rootContainer).toHaveClass('flex');
    expect(rootContainer).toHaveClass('flex-col');
    expect(rootContainer).toHaveClass('landscape:flex-row');
    expect(rootContainer).toHaveClass('lg:flex-row');
  });

  it('renders a top portrait banner above the canvas (order-0) and hides it in landscape', () => {
    const { container } = render(<App />);
    const topBanner = container.querySelector('.order-0') as HTMLElement;
    expect(topBanner).toBeInTheDocument();
    expect(topBanner).toHaveClass('order-0');
    expect(topBanner).toHaveClass('landscape:hidden');
    expect(topBanner).toHaveClass('lg:hidden');
    expect(topBanner).toHaveTextContent('Math Morph');
    expect(topBanner).toHaveTextContent(/interactive visualizer/i);
  });

  it('pins the canvas wrapper below the banner in portrait mode (order-1) and full height in landscape', () => {
    const { container } = render(<App />);
    const canvasWrapper = container.querySelector('.order-1') as HTMLElement;
    expect(canvasWrapper).toBeInTheDocument();
    expect(canvasWrapper).toHaveClass('order-1');
    expect(canvasWrapper).toHaveClass('landscape:order-2');
    expect(canvasWrapper).toHaveClass('lg:order-2');
    expect(canvasWrapper).toHaveClass('landscape:h-full');
  });

  it('places sidebar panel at the bottom in portrait mode (order-2) with scrollable overflow and header in landscape', () => {
    const { container } = render(<App />);
    const sidebarWrapper = container.querySelector('.order-2') as HTMLElement;
    expect(sidebarWrapper).toBeInTheDocument();
    expect(sidebarWrapper).toHaveClass('order-2');
    expect(sidebarWrapper).toHaveClass('landscape:order-1');
    expect(sidebarWrapper).toHaveClass('lg:order-1');
    
    const asideElement = container.querySelector('aside') as HTMLElement;
    expect(asideElement).toBeInTheDocument();
    expect(asideElement).toHaveClass('overflow-y-auto');
    expect(asideElement).toHaveClass('w-full');
    expect(asideElement).toHaveClass('landscape:w-[260px]');
    expect(asideElement).toHaveClass('lg:w-[400px]');

    const sidebarHeader = asideElement.querySelector('header') as HTMLElement;
    expect(sidebarHeader).toBeInTheDocument();
    expect(sidebarHeader).toHaveClass('hidden');
    expect(sidebarHeader).toHaveClass('landscape:flex');
    expect(sidebarHeader).toHaveClass('lg:flex');
  });

  it('switches sidebar between left and right position when clicking the side switch button in banner row', () => {
    const { container } = render(<App />);
    const switchButton = container.querySelector('button[title="Move panel to right"]') as HTMLButtonElement;
    expect(switchButton).toBeInTheDocument();

    // Click to move to right
    fireEvent.click(switchButton);

    // Now button should have title 'Move panel to left'
    const updatedSwitchButton = container.querySelector('button[title="Move panel to left"]') as HTMLButtonElement;
    expect(updatedSwitchButton).toBeInTheDocument();
    
    // Canvas should now be order-1 and Sidebar order-2 in landscape/desktop
    const canvasWrapper = container.querySelector('.order-1') as HTMLElement;
    expect(canvasWrapper).toHaveClass('landscape:order-1');
    expect(canvasWrapper).toHaveClass('lg:order-1');

    const sidebarWrapper = container.querySelector('.order-2') as HTMLElement;
    expect(sidebarWrapper).toHaveClass('landscape:order-2');
    expect(sidebarWrapper).toHaveClass('lg:order-2');
  });
});
