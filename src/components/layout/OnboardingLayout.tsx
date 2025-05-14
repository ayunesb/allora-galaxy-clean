import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTenantContext } from '@/contexts/TenantContext';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { toast } from 'sonner';
import LucideLogo from '@/components/LucideLogo';

const OnboardingLayout: React.FC = () => {
  const { tenant, isLoading } = useTenantContext();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract step information from path
  const getStepInfo = () => {
    const path = location.pathname.replace('/onboarding/', '');
    const step = parseInt(path.split('/')[0]) || 1;
    return { step, path };
  };

  const { step } = getStepInfo();

  // Redirect to main page if tenant is already onboarded
  useEffect(() => {
    if (!isLoading && tenant && tenant.is_onboarded) {
      toast.info('Your organization is already set up');
      navigate('/');
    }
  }, [tenant, isLoading, navigate]);

  // Log onboarding step views
  useEffect(() => {
    if (tenant && !isLoading) {
      logSystemEvent(
        'onboarding',
        'info',
        {
          step: step,
          total_steps: 4, // Update this if you change the number of steps
          context: location.pathname,
          description: `User viewed onboarding step ${step}`
        },
        tenant.id
      ).catch(console.error);
    }
  }, [step, location.pathname, tenant, isLoading]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container flex items-center justify-between p-4 mx-auto">
          <LucideLogo />
          <div className="text-sm">
            <span className="text-muted-foreground">
              Onboarding Step: {step} / 4
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto py-8">
        <Outlet />
      </main>

      <footer className="py-6 border-t">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Allora. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default OnboardingLayout;
