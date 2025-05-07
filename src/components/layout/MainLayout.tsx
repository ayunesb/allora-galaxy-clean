
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { SidebarNav } from './SidebarNav';
import MobileNav from './MobileNav';
import Footer from './Footer';
import CookieConsent from '../CookieConsent';
import { useWorkspace } from '@/context/WorkspaceContext';
import { NavigationItem as WorkspaceNavigationItem } from '@/context/WorkspaceContext';
import { NavigationItem } from './SidebarNav';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  // Get navigation items based on user role
  const { navigationItems } = useWorkspace();
  
  // Convert WorkspaceNavigationItem to NavigationItem
  const convertedNavigationItems: NavigationItem[] = 
    (navigationItems as WorkspaceNavigationItem[]).map(item => ({
      ...item,
      // This ensures the icon is correctly typed as ReactNode
      icon: item.icon
    }));
  
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex flex-col min-h-screen w-full bg-background">
        <MobileNav />
        <CookieConsent />
        
        <div className="flex flex-1 w-full">
          <SidebarNav items={convertedNavigationItems} />
          
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
