
import React from 'react';
import MobileNav from './MobileNav';
import Footer from './Footer';
import CookieConsent from '../CookieConsent';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <MobileNav />
      <CookieConsent />
      
      <main className="flex-1">
        {children}
      </main>
      
      <Footer />
    </div>
  );
};

export default MainLayout;
