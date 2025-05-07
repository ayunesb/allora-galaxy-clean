
import React from 'react';
import { OnboardingFormData } from '@/hooks/useOnboardingWizard';
import CompanyInfoStep from './steps/CompanyInfoStep';
import AdditionalInfoStep from './steps/AdditionalInfoStep';
import PersonaStep from './steps/PersonaStep';

interface StepContentProps {
  currentStep: number;
  formData: OnboardingFormData;
  updateFormData: (key: keyof OnboardingFormData, value: string) => void;
}

export const stepTitles = [
  'Company',
  'Additional Info',
  'Persona'
];

export const stepDetails = [
  {
    title: 'Company Information',
    description: 'Tell us about your company',
  },
  {
    title: 'Additional Information',
    description: 'Provide more details about your company',
  },
  {
    title: 'Persona Settings',
    description: 'Define your brand persona and goals',
  },
];

const StepContent: React.FC<StepContentProps> = ({ 
  currentStep, 
  formData, 
  updateFormData 
}) => {
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <CompanyInfoStep
            companyName={formData.companyName}
            setCompanyName={(value) => updateFormData('companyName', value)}
            industry={formData.industry}
            setIndustry={(value) => updateFormData('industry', value)}
            teamSize={formData.teamSize}
            setTeamSize={(value) => updateFormData('teamSize', value)}
            revenueRange={formData.revenueRange}
            setRevenueRange={(value) => updateFormData('revenueRange', value)}
          />
        );
      case 1:
        return (
          <AdditionalInfoStep
            website={formData.website}
            setWebsite={(value) => updateFormData('website', value)}
            description={formData.description}
            setDescription={(value) => updateFormData('description', value)}
          />
        );
      case 2:
        return (
          <PersonaStep
            personaName={formData.personaName}
            setPersonaName={(value) => updateFormData('personaName', value)}
            tone={formData.tone}
            setTone={(value) => updateFormData('tone', value)}
            goals={formData.goals}
            setGoals={(value) => updateFormData('goals', value)}
          />
        );
      default:
        return null;
    }
  };

  return renderStep();
};

export default StepContent;
