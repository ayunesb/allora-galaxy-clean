
import React from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface OnboardingProgressProps {
  currentStep: number;
  progress: number;
  onStepClick: (stepIndex: number) => void;
}

const OnboardingProgress: React.FC<OnboardingProgressProps> = ({ 
  currentStep,
  progress,
  onStepClick
}) => {
  const steps = [
    'Company Information',
    'Additional Details',
    'AI Persona Setup',
    'Strategy Generation',
    'Complete'
  ];

  return (
    <div className="mb-8">
      <div className="relative">
        {/* Progress bar */}
        <div className="overflow-hidden h-2 flex rounded-full bg-muted">
          <div
            className="bg-primary transition-all duration-300 ease-in-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Steps */}
        <div className="flex justify-between mt-2">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <button
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
                  index < currentStep
                    ? "bg-primary border-primary text-white"
                    : index === currentStep
                    ? "border-primary bg-white text-primary"
                    : "border-muted bg-white text-muted-foreground"
                )}
                onClick={() => onStepClick(index)}
                disabled={index > currentStep}
              >
                {index < currentStep ? (
                  <Check className="h-4 w-4" />
                ) : index === currentStep ? (
                  <ArrowRight className="h-4 w-4" />
                ) : (
                  <span className="text-sm">{index + 1}</span>
                )}
              </button>
              <span className={cn(
                "text-xs mt-1 hidden sm:block",
                index === currentStep ? "font-medium text-primary" : "text-muted-foreground"
              )}>
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OnboardingProgress;
