
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ChartLoadingState from '@/components/admin/errors/charts/ChartLoadingState';

describe('ChartLoadingState', () => {
  it('renders the loading skeletons', () => {
    render(<ChartLoadingState />);
    
    expect(document.querySelector('.chart-loading-skeleton')).toBeInTheDocument();
  });
  
  it('adjusts height based on props', () => {
    render(<ChartLoadingState height={400} />);
    
    const skeleton = document.querySelector('.chart-loading-container');
    expect(skeleton).toHaveStyle({ height: '400px' });
  });
});
