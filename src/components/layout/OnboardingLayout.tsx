
import React from 'react';
import Footer from './Footer';
import { useTranslation } from 'react-i18next';

interface OnboardingLayoutProps {
  children: React.ReactNode;
}

const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          {t('common.appName')}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('onboarding.welcome')}
        </p>
      </div>
      
      <main className="flex-1">
        {children}
      </main>
      
      <Footer />
    </div>
  );
};

export default OnboardingLayout;
