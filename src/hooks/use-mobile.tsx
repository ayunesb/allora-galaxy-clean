
import { useResponsive } from './use-responsive';

/**
 * Custom hook to detect mobile breakpoint
 * @deprecated Use useResponsive() instead for more granular breakpoints
 */
export function useMobileBreakpoint(): boolean {
  const { isMobile } = useResponsive();
  return isMobile;
}

/**
 * Alias for consistency with other hooks
 * @deprecated Use useResponsive() instead for more granular breakpoints
 */
export function useIsMobile(): boolean {
  return useMobileBreakpoint();
}
