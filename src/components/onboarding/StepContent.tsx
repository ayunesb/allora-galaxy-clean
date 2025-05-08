
import React from 'react';
import { useTranslation } from 'react-i18next';
import { OnboardingFormData, OnboardingStep } from '@/hooks/useOnboardingWizard';
import CompanyInfoStep from './steps/CompanyInfoStep';
import PersonaStep from './steps/PersonaStep';
import StrategyGenerationStep from './steps/StrategyGenerationStep';

interface StepContentProps {
  step: OnboardingStep;
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  isGeneratingStrategy?: boolean;
  setFieldValue: (key: string, value: any) => void;
}

const StepContent: React.FC<StepContentProps> = ({ 
  step, 
  formData, 
  updateFormData,
  isGeneratingStrategy = false,
  setFieldValue 
}) => {
  const { t } = useTranslation();

  switch (step) {
    case 'company':
      return (
        <CompanyInfoStep 
          formData={formData} 
          updateFormData={updateFormData}
          setFieldValue={setFieldValue}
        />
      );
    case 'goals':
      return (
        <PersonaStep 
          formData={formData} 
          updateFormData={updateFormData}
          setFieldValue={setFieldValue}
        />
      );
    case 'strategy':
      return (
        <StrategyGenerationStep
          formData={formData}
          updateFormData={updateFormData}
          isGenerating={isGeneratingStrategy}
          setFieldValue={setFieldValue}
        />
      );
    case 'complete':
      return (
        <div className="py-6">
          <h2 className="text-2xl font-semibold mb-4">{t('onboarding.complete.title')}</h2>
          <p className="text-muted-foreground mb-6">
            {t('onboarding.complete.description')}
          </p>
          <div className="border rounded-lg p-6 bg-muted/30">
            <h3 className="text-xl font-medium mb-2">{formData.companyName}</h3>
            <p className="text-muted-foreground mb-4">{formData.description}</p>
            
            <h4 className="font-medium mb-2">Goals:</h4>
            <ul className="list-disc list-inside space-y-1 mb-4">
              {formData.goals.map((goal, index) => (
                <li key={index}>{goal}</li>
              ))}
            </ul>
            
            {formData.strategy.title && (
              <>
                <h4 className="font-medium mb-2">Initial Strategy:</h4>
                <div className="border rounded p-3 bg-card">
                  <h5 className="font-medium">{formData.strategy.title}</h5>
                  <p className="text-sm text-muted-foreground">{formData.strategy.description}</p>
                </div>
              </>
            )}
          </div>
        </div>
      );
    default:
      return null;
  }
};

export default StepContent;
