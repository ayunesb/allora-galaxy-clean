import { screen } from '@testing-library/react';

it('should find regions', () => {
  const regions = screen.getAllByRole('region');
  expect(regions.length).toBeGreaterThan(0);
});

// Mock Supabase with expected data
(supabase.from as unknown as vi.Mock).mockReturnValueOnce({
  select: vi.fn(() => ({
    eq: vi.fn(() => ({
      order: vi.fn(() => ({
        data: [{ id: 'test-id', status: 'success', execution_time: 1.2 }],
        error: null,
      })),
    })),
  })),
});
