
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';

interface ThemeUiContextType {
  reducedMotion: boolean;
  highContrast: boolean;
  animationsEnabled: boolean;
  setReducedMotion: (value: boolean) => void;
  setHighContrast: (value: boolean) => void;
  setAnimationsEnabled: (value: boolean) => void;
  applySoftTheme: () => void;
  applyBoldTheme: () => void;
}

const ThemeUiContext = createContext<ThemeUiContextType | undefined>(undefined);

export const ThemeUiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, setTheme } = useTheme();
  
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  
  // Check for user preferences
  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setReducedMotion(true);
      setAnimationsEnabled(false);
    }
    
    // Check saved preferences
    const savedReducedMotion = localStorage.getItem('reducedMotion') === 'true';
    const savedHighContrast = localStorage.getItem('highContrast') === 'true';
    const savedAnimations = localStorage.getItem('animationsEnabled');
    
    if (savedReducedMotion !== null) setReducedMotion(savedReducedMotion);
    if (savedHighContrast !== null) setHighContrast(savedHighContrast);
    if (savedAnimations !== null) setAnimationsEnabled(savedAnimations === 'true');
    
    // Apply high contrast if needed
    if (savedHighContrast) {
      document.documentElement.classList.add('high-contrast');
    }
  }, []);
  
  // Save preferences when they change
  useEffect(() => {
    localStorage.setItem('reducedMotion', reducedMotion.toString());
    
    if (reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
      setAnimationsEnabled(false);
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
  }, [reducedMotion]);
  
  useEffect(() => {
    localStorage.setItem('highContrast', highContrast.toString());
    
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);
  
  useEffect(() => {
    localStorage.setItem('animationsEnabled', animationsEnabled.toString());
    
    if (animationsEnabled) {
      document.documentElement.classList.remove('no-animations');
    } else {
      document.documentElement.classList.add('no-animations');
    }
  }, [animationsEnabled]);
  
  const applySoftTheme = () => {
    const currentTheme = theme === 'dark' ? 'dark-soft' : 'light-soft';
    setTheme(currentTheme);
    document.documentElement.classList.add('soft-ui');
  };
  
  const applyBoldTheme = () => {
    const currentTheme = theme?.includes('dark') ? 'dark' : 'light';
    setTheme(currentTheme);
    document.documentElement.classList.remove('soft-ui');
  };
  
  const value = {
    reducedMotion,
    highContrast,
    animationsEnabled,
    setReducedMotion,
    setHighContrast,
    setAnimationsEnabled,
    applySoftTheme,
    applyBoldTheme
  };
  
  return (
    <ThemeUiContext.Provider value={value}>
      {children}
    </ThemeUiContext.Provider>
  );
};

export const useThemeUi = (): ThemeUiContextType => {
  const context = useContext(ThemeUiContext);
  if (!context) {
    throw new Error('useThemeUi must be used within a ThemeUiProvider');
  }
  return context;
};

export default ThemeUiProvider;
