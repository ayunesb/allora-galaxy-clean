
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { SidebarNav } from './SidebarNav';
import MobileNav from './MobileNav';
import Footer from './Footer';
import CookieConsent from '../CookieConsent';
import { useWorkspace } from '@/context/WorkspaceContext';

// Import the NavigationItem type directly from the context
import type { NavigationItem } from '@/context/WorkspaceContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  // Get navigation items based on user role
  const { navigationItems } = useWorkspace();
  
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex flex-col min-h-screen w-full bg-background">
        <MobileNav />
        <CookieConsent />
        
        <div className="flex flex-1 w-full">
          <SidebarNav items={navigationItems as unknown as NavigationItem[]} />
          
          <main className="flex-1 p-4 md:p-6">
            {children}
          </main>
        </div>
        
        <Footer />
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
