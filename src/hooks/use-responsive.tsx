
import { useEffect, useState } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';

/**
 * Responsive breakpoint configuration
 */
export const breakpoints = {
  xs: '480px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

/**
 * Hook to detect various responsive breakpoints
 */
export function useResponsive() {
  const [isClient, setIsClient] = useState(false);
  
  // Initialize on client side only to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Media queries
  const isXs = useMediaQuery(`(max-width: ${breakpoints.xs})`);
  const isSm = useMediaQuery(`(max-width: ${breakpoints.sm})`);
  const isMd = useMediaQuery(`(max-width: ${breakpoints.md})`);
  const isLg = useMediaQuery(`(max-width: ${breakpoints.lg})`);
  const isXl = useMediaQuery(`(max-width: ${breakpoints.xl})`);
  const is2xl = useMediaQuery(`(max-width: ${breakpoints.["2xl"]})`);
  
  // Prevent hydration mismatch
  if (!isClient) {
    return {
      isXs: false,
      isSm: false,
      isMd: false,
      isLg: false,
      isXl: false,
      is2xl: false,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      breakpoint: 'lg',
    };
  }
  
  // Get current breakpoint name
  const getCurrentBreakpoint = () => {
    if (isXs) return 'xs';
    if (isSm) return 'sm';
    if (isMd) return 'md';
    if (isLg) return 'lg';
    if (isXl) return 'xl';
    if (is2xl) return '2xl';
    return 'lg'; // Default
  };
  
  return {
    // Individual breakpoints
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    is2xl,
    
    // Device categories
    isMobile: isMd, // <= 768px
    isTablet: !isMd && isLg, // > 768px && <= 1024px
    isDesktop: !isLg, // > 1024px
    
    // Current breakpoint name
    breakpoint: getCurrentBreakpoint(),
  };
}

/**
 * Hook to get screen dimensions
 */
export function useScreenSize() {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Set initial dimensions
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return dimensions;
}
