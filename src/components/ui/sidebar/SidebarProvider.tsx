
import React, { createContext, useContext, useState } from 'react';
import { useMobileBreakpoint } from '@/hooks/use-mobile';

// Constants
export const SIDEBAR_WIDTH = 240;
export const SIDEBAR_WIDTH_COLLAPSED = 64;

// Context interface
export interface SidebarContextType {
  collapsed: boolean;
  toggleCollapsed: () => void;
  isHovering: boolean;
  setIsHovering: (isHovering: boolean) => void;
  isMobile: boolean;
}

// Default context state
const initialState: SidebarContextType = {
  collapsed: false,
  toggleCollapsed: () => {},
  isHovering: false,
  setIsHovering: () => {},
  isMobile: false
};

// Create context
const SidebarContext = createContext<SidebarContextType>(initialState);

// Provider component
export function SidebarProvider({
  children,
  defaultCollapsed = false
}: {
  children: React.ReactNode;
  defaultCollapsed?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [isHovering, setIsHovering] = useState(false);
  const isMobile = useMobileBreakpoint();
  
  // Toggle collapsed state
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };
  
  return (
    <SidebarContext.Provider
      value={{
        collapsed: isMobile ? false : collapsed,
        toggleCollapsed,
        isHovering,
        setIsHovering,
        isMobile
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

// Hook for using the sidebar context
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  
  return context;
};
