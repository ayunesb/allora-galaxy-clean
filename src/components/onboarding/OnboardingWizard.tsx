
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import ErrorBoundary from '@/components/ErrorBoundary';

// Step components
import CompanyInfoStep from './steps/CompanyInfoStep';
import AdditionalInfoStep from './steps/AdditionalInfoStep';
import PersonaStep from './steps/PersonaStep';

// UI Components
import OnboardingProgress from './OnboardingProgress';
import StepNavigation from './StepNavigation';

const OnboardingWizard: React.FC = () => {
  const { user } = useAuth();
  const { createTenant, tenants } = useWorkspace();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Company profile data
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [revenueRange, setRevenueRange] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');

  // Persona profile data
  const [personaName, setPersonaName] = useState('');
  const [tone, setTone] = useState('');
  const [goals, setGoals] = useState('');

  // Redirect to dashboard if user already has tenants
  if (tenants.length > 0) {
    return <Navigate to="/" replace />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleNextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Create new tenant
      const { data: tenant, error: tenantError } = await supabase.retryOperation(async () => {
        return await createTenant(companyName);
      });

      if (tenantError) throw tenantError;
      if (!tenant) throw new Error("Failed to create tenant: No data returned");

      // Create company profile
      const { error: companyError } = await supabase.retryOperation(async () => {
        return await supabase
          .from('company_profiles')
          .insert({
            tenant_id: tenant.id,
            name: companyName,
            industry,
            size: teamSize,
            revenue_range: revenueRange,
            website,
            description,
          });
      });

      if (companyError) throw companyError;

      // Create persona profile
      const { error: personaError } = await supabase.retryOperation(async () => {
        return await supabase
          .from('persona_profiles')
          .insert({
            tenant_id: tenant.id,
            name: personaName,
            tone,
            goals: goals.split('\n').filter(goal => goal.trim() !== ''),
          });
      });

      if (personaError) throw personaError;

      // Log successful onboarding
      await logSystemEvent(
        tenant.id,
        'onboarding',
        'onboarding_complete',
        {
          user_id: user.id,
          company_name: companyName,
          industry
        }
      );

      toast({
        title: 'Onboarding complete!',
        description: 'Your workspace has been set up successfully.',
      });

      // Redirect to dashboard
      window.location.href = '/';

    } catch (error: any) {
      console.error('Onboarding error:', error);
      setError(error.message || 'An unexpected error occurred during onboarding');
      
      toast({
        title: 'Onboarding failed',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
      
      try {
        await logSystemEvent(
          'system',
          'onboarding',
          'onboarding_failed',
          {
            user_id: user?.id,
            company_name: companyName,
            error: error.message
          }
        );
      } catch (logError) {
        console.error("Failed to log onboarding error:", logError);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Define step validation
  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return companyName && industry && teamSize && revenueRange;
      case 1:
        return true; // Additional info is optional
      case 2:
        return personaName && tone && goals;
      default:
        return false;
    }
  };

  const steps = [
    {
      title: 'Company Information',
      description: 'Tell us about your company',
      component: (
        <CompanyInfoStep
          companyName={companyName}
          setCompanyName={setCompanyName}
          industry={industry}
          setIndustry={setIndustry}
          teamSize={teamSize}
          setTeamSize={setTeamSize}
          revenueRange={revenueRange}
          setRevenueRange={setRevenueRange}
        />
      ),
    },
    {
      title: 'Additional Information',
      description: 'Provide more details about your company',
      component: (
        <AdditionalInfoStep
          website={website}
          setWebsite={setWebsite}
          description={description}
          setDescription={setDescription}
        />
      ),
    },
    {
      title: 'Persona Settings',
      description: 'Define your brand persona and goals',
      component: (
        <PersonaStep
          personaName={personaName}
          setPersonaName={setPersonaName}
          tone={tone}
          setTone={setTone}
          goals={goals}
          setGoals={setGoals}
        />
      ),
    },
  ];

  const currentStepData = steps[currentStep];

  const resetError = () => setError(null);

  return (
    <ErrorBoundary tenant_id="system" supportEmail="support@alloraos.com">
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>{currentStepData.title}</CardTitle>
            <CardDescription>{currentStepData.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <OnboardingProgress currentStep={currentStep} totalSteps={steps.length} />
            
            {currentStepData.component}
            
            <StepNavigation
              currentStep={currentStep}
              totalSteps={steps.length}
              onPrevious={handlePrevStep}
              onNext={handleNextStep}
              onComplete={handleSubmit}
              isNextDisabled={!isStepValid()}
              isSubmitting={isSubmitting}
            />
          </CardContent>
        </Card>

        <AlertDialog open={!!error} onOpenChange={resetError}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Error During Onboarding</AlertDialogTitle>
              <AlertDialogDescription>
                {error}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button variant="default" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ErrorBoundary>
  );
};

export default OnboardingWizard;
