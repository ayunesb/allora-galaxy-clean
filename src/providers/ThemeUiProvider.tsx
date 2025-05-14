
import React, { useEffect } from 'react';
import { useTheme as useNextTheme } from 'next-themes';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface ThemeUiProviderProps {
  children: React.ReactNode;
}

const ThemeUiProvider: React.FC<ThemeUiProviderProps> = ({ children }) => {
  const { theme, setTheme } = useNextTheme();
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');

  useEffect(() => {
    // Set initial theme based on system preference if not already set
    if (!theme) {
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, [prefersDark, theme, setTheme]);

  return <>{children}</>;
};

export default ThemeUiProvider;
