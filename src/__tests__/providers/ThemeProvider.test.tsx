
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme } from '@/providers/ThemeProvider';

// Component that uses the ThemeProvider hook for testing
function ThemeConsumer() {
  const { theme, setTheme } = useTheme();
  
  return (
    <div>
      <div data-testid="current-theme">{theme}</div>
      <button onClick={() => setTheme('dark')} data-testid="set-dark">Dark</button>
      <button onClick={() => setTheme('light')} data-testid="set-light">Light</button>
    </div>
  );
}

describe('ThemeProvider', () => {
  afterEach(() => {
    // Reset document class after each test
    document.documentElement.className = '';
  });

  it('should provide a default theme', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <ThemeConsumer />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('current-theme').textContent).toBe('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
  });
  
  it('should allow changing the theme', async () => {
    const user = userEvent.setup();
    
    render(
      <ThemeProvider defaultTheme="light">
        <ThemeConsumer />
      </ThemeProvider>
    );
    
    await user.click(screen.getByTestId('set-dark'));
    
    expect(screen.getByTestId('current-theme').textContent).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('light')).toBe(false);
    
    await user.click(screen.getByTestId('set-light'));
    
    expect(screen.getByTestId('current-theme').textContent).toBe('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
  
  it('should throw an error when useTheme is used outside ThemeProvider', () => {
    // Mock console.error to prevent the error from displaying in test output
    const consoleErrorMock = vi.spyOn(console, 'error');
    consoleErrorMock.mockImplementation(() => {});
    
    expect(() => {
      render(<ThemeConsumer />);
    }).toThrow('useTheme must be used within a ThemeProvider');
    
    consoleErrorMock.mockRestore();
  });
});
