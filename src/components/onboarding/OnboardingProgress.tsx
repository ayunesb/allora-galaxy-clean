
import React from 'react';
import { OnboardingStep } from '@/types/onboarding';
import { cn } from '@/lib/utils';
import { CheckCircle } from 'lucide-react';

export interface OnboardingProgressProps {
  currentStep: number;
  onStepClick: (step: number) => void;
  steps: { id: OnboardingStep; label: string; }[];
}

const OnboardingProgress: React.FC<OnboardingProgressProps> = ({ 
  currentStep, 
  onStepClick,
  steps 
}) => {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center">
        {steps.map((step, idx) => (
          <React.Fragment key={step.id}>
            {/* Step button */}
            <button
              className={cn(
                'relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors',
                idx < currentStep
                  ? 'border-primary bg-primary text-primary-foreground'
                  : idx === currentStep
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-muted bg-muted/40 text-muted-foreground cursor-default'
              )}
              onClick={() => idx <= currentStep + 1 && onStepClick(idx)}
              disabled={idx > currentStep + 1}
              aria-current={idx === currentStep ? 'step' : undefined}
            >
              {idx < currentStep ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <span>{idx + 1}</span>
              )}
              
              {/* Step label */}
              <span className="absolute top-10 -translate-x-1/2 text-xs font-medium whitespace-nowrap">
                {step.label}
              </span>
            </button>
            
            {/* Connecting line */}
            {idx < steps.length - 1 && (
              <div 
                className={cn(
                  'flex-1 h-0.5 mx-1',
                  idx < currentStep 
                    ? 'bg-primary' 
                    : 'bg-muted'
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default OnboardingProgress;
