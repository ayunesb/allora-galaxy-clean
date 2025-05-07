
import React from 'react';
import LanguageSelector from '@/components/settings/LanguageSelector';
import { useTranslation } from 'react-i18next';
import Footer from './Footer';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex-1">
        <div className="container mx-auto px-4 py-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            {t('common.appName')}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            AI-native business management platform
          </p>
          <div className="mt-4 flex justify-center">
            <LanguageSelector />
          </div>
        </div>
        
        <main className="flex-1">
          {children}
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default AuthLayout;
