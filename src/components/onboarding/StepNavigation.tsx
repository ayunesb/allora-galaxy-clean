
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Save, Loader2 } from 'lucide-react';

export interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  isSubmitting: boolean;
  isNextDisabled: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => Promise<void>;
  isGenerating?: boolean;
}

const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  totalSteps,
  isSubmitting,
  isNextDisabled,
  onNext,
  onPrev,
  onSubmit,
  isGenerating = false
}) => {
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="flex justify-between items-center border-t mt-4 pt-4 px-4 md:px-0">
      {currentStep > 0 ? (
        <Button 
          type="button" 
          variant="outline" 
          onClick={onPrev}
          disabled={isSubmitting || isGenerating}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> 
          Back
        </Button>
      ) : (
        <div /> // Empty div to maintain layout when back button is not visible
      )}

      {isLastStep ? (
        <Button 
          type="button" 
          onClick={onSubmit} 
          disabled={isSubmitting || isNextDisabled || isGenerating}
        >
          {isSubmitting || isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isGenerating ? 'Generating...' : 'Saving...'}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> 
              Create Workspace
            </>
          )}
        </Button>
      ) : (
        <Button 
          type="button" 
          onClick={onNext}
          disabled={isNextDisabled || isSubmitting || isGenerating}
        >
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default StepNavigation;
