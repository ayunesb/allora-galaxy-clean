
import { useEffect, useState } from 'react';
import { useMediaQuery } from './use-media-query';

/**
 * Custom hook to detect mobile breakpoint
 */
export function useMobileBreakpoint(): boolean {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Return false during SSR to avoid hydration mismatches
  return isClient ? isMobile : false;
}

/**
 * Alias for consistency with other hooks
 */
export function useIsMobile(): boolean {
  return useMobileBreakpoint();
}
