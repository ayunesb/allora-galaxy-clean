
import React, { useEffect } from 'react';
import { useRoutes, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import routes from '@/routes';
import { useThemeStore, setupThemeWatcher, applyTheme } from '@/lib/theme';

function App() {
  const { loading } = useAuth();
  const { theme } = useThemeStore();
  
  // Apply theme on initial load
  useEffect(() => {
    applyTheme(theme);
    
    // Setup theme watcher to respond to system preference changes
    const cleanupWatcher = setupThemeWatcher();
    return cleanupWatcher;
  }, [theme]);

  // Show loading state if auth is still initializing
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }
  
  // Render the appropriate routes
  const routing = useRoutes(routes);
  return <>{routing}</>;
}

export default App;
