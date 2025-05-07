
import React from 'react';
import { Button } from '@/components/ui/button';

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onComplete?: () => void;
  isNextDisabled: boolean;
  isSubmitting: boolean;
}

const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onComplete,
  isNextDisabled,
  isSubmitting,
}) => {
  const isLastStep = currentStep === totalSteps - 1;
  
  return (
    <div className="flex justify-between mt-8">
      <Button
        type="button"
        variant="outline"
        onClick={onPrevious}
        disabled={currentStep === 0 || isSubmitting}
      >
        Previous
      </Button>
      
      {!isLastStep ? (
        <Button
          type="button"
          onClick={onNext}
          disabled={isNextDisabled || isSubmitting}
        >
          Next
        </Button>
      ) : (
        <Button
          type="button"
          onClick={onComplete}
          disabled={isNextDisabled || isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Complete Setup'}
        </Button>
      )}
    </div>
  );
};

export default StepNavigation;
