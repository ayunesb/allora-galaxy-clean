
import { useState, useEffect } from 'react';
import { useMediaQuery } from './useMediaQuery';

// Define breakpoints based on Tailwind CSS defaults
// These can be overridden by changing these values
export const breakpoints = {
  sm: '640px',   // Small devices (smartphones)
  md: '768px',   // Medium devices (tablets)
  lg: '1024px',  // Large devices (desktops)
  xl: '1280px',  // Extra large devices (large desktops)
  '2xl': '1536px' // Extra extra large devices
};

/**
 * A responsive hook that returns boolean values for different screen sizes
 * based on Tailwind CSS breakpoint conventions
 * 
 * @returns Object with boolean values for each breakpoint and screen size
 */
export const useResponsive = () => {
  // Check if window is available (client-side)
  const isClient = typeof window === 'object';
  
  // Track responsive states
  const isMobile = useMediaQuery(`(max-width: ${breakpoints.sm})`);
  const isTablet = useMediaQuery(`(max-width: ${breakpoints.md})`);
  const isDesktop = useMediaQuery(`(min-width: ${breakpoints.lg})`);
  
  // Specific breakpoints
  const isSm = useMediaQuery(`(max-width: ${breakpoints.sm})`);
  const isMd = useMediaQuery(`(max-width: ${breakpoints.md})`);
  const isLg = useMediaQuery(`(max-width: ${breakpoints.lg})`);
  const isXl = useMediaQuery(`(max-width: ${breakpoints.xl})`);
  const is2xl = useMediaQuery(`(max-width: ${breakpoints['2xl']})`);
  
  // Prevent hydration mismatch
  if (!isClient) {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isSm: false,
      isMd: false,
      isLg: false,
      isXl: false,
      is2xl: false,
      screenWidth: 1024,
      screenHeight: 768
    };
  }
  
  // Get actual screen dimensions
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    isSm,
    isMd,
    isLg,
    isXl,
    is2xl,
    screenWidth: dimensions.width,
    screenHeight: dimensions.height
  };
};
