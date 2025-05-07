
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import SidebarNav from './SidebarNav';
import MobileNav from './MobileNav';
import Footer from './Footer';
import CookieConsent from '../CookieConsent';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex flex-col min-h-screen w-full bg-background">
        <MobileNav />
        <CookieConsent />
        
        <div className="flex flex-1 w-full">
          <SidebarNav />
          
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
