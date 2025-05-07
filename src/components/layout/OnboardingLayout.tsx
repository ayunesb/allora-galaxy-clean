
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
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="mb-6">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            {t('common.appName')}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {t('onboarding.welcome')}
          </p>
        </div>
        
        <div className="max-w-md mx-auto mb-8 hidden sm:block">
          <div className="h-1 w-full bg-primary/20 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full w-0 animate-[progress_1s_ease-in-out_forwards]" 
                 style={{animationDelay: '0.5s'}}></div>
          </div>
        </div>
      </div>
      
      <main className="flex-1">
        {children}
      </main>
      
      <Footer />
      
      <style jsx>{`
        @keyframes progress {
          from { width: 0; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default OnboardingLayout;
