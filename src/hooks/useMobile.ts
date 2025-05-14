
import { useResponsive } from '@/hooks/use-responsive';

/**
 * Hook to detect mobile viewport
 * @deprecated Use useResponsive() instead for more granular breakpoints
 */
export function useMobile() {
  const { isMobile } = useResponsive();
  return { isMobile };
}

export default useMobile;
