
import React, { useEffect, useState } from 'react';
import Footer from './Footer';
import { useTranslation } from 'react-i18next';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { useTenantId } from '@/hooks/useTenantId';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentStep?: number;
  totalSteps?: number;
}

const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({ 
  children, 
  currentStep = 0, 
  totalSteps = 4
}) => {
  const { t } = useTranslation();
  const tenantId = useTenantId();
  const [progressWidth, setProgressWidth] = useState(0);
  const [hasRendered, setHasRendered] = useState(false);
  
  // Calculate and animate progress bar
  useEffect(() => {
    if (totalSteps <= 0) return;
    
    const progressPercentage = Math.min(((currentStep + 1) / totalSteps) * 100, 100);
    
    // Don't animate on first render
    if (!hasRendered) {
      setProgressWidth(progressPercentage);
      setHasRendered(true);
      return;
    }
    
    // Animate progress change
    setProgressWidth(progressPercentage);
    
    // Log step change when tenant ID is available
    if (tenantId) {
      logSystemEvent(
        tenantId,
        'onboarding',
        'onboarding_step_change',
        { step: currentStep, total_steps: totalSteps }
      ).catch(err => console.error('Failed to log step change:', err));
    }
  }, [currentStep, totalSteps, hasRendered, tenantId]);
  
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
            <div 
              className="h-full bg-primary rounded-full transition-all duration-700 ease-in-out" 
              style={{ width: `${progressWidth}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <main className="flex-1">
        {children}
      </main>
      
      <Footer />
    </div>
  );
};

export default OnboardingLayout;
