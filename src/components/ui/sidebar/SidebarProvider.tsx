
import React, { createContext, useContext, useState } from 'react';

// Sidebar width constants
export const SIDEBAR_WIDTH = 260; // Desktop sidebar width in pixels

// Sidebar context type
interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  isHovering: boolean;
  setIsHovering: (isHovering: boolean) => void;
}

// Create context with default values
const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  setCollapsed: () => {},
  isHovering: false,
  setIsHovering: () => {},
});

// Hook for accessing sidebar context
export const useSidebar = () => useContext(SidebarContext);

// Provider component
export const SidebarProvider: React.FC<{
  children: React.ReactNode;
  defaultCollapsed?: boolean;
}> = ({ children, defaultCollapsed = false }) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [isHovering, setIsHovering] = useState(false);

  return (
    <SidebarContext.Provider
      value={{
        collapsed,
        setCollapsed,
        isHovering,
        setIsHovering,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};
