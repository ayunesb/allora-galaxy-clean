
import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FormSubmitButtonProps extends Omit<ButtonProps, 'type'> {
  loadingText?: string;
  successText?: string;
  errorText?: string;
  showSuccessState?: boolean;
  successStateDuration?: number;
  isSubmitting?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  errors?: Record<string, any>;
  validateForm?: boolean;
}

/**
 * FormSubmitButton - An enhanced button for form submission with loading/success/error states
 */
export function FormSubmitButton({
  children,
  loadingText = 'Submitting...',
  successText = 'Submitted!',
  errorText = 'Error',
  showSuccessState = true,
  successStateDuration = 2000,
  isSubmitting: externalIsSubmitting,
  isSuccess: externalIsSuccess,
  isError: externalIsError,
  errors: externalErrors,
  validateForm = true,
  disabled,
  ...props
}: FormSubmitButtonProps) {
  const formContext = useFormContext();
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Get form state from context or props
  const isSubmitting = externalIsSubmitting !== undefined 
    ? externalIsSubmitting 
    : formContext?.formState?.isSubmitting;
    
  const isSuccess = externalIsSuccess !== undefined 
    ? externalIsSuccess 
    : formContext?.formState?.isSubmitSuccessful;
    
  const errors = externalErrors || formContext?.formState?.errors;
  const isError = externalIsError !== undefined ? externalIsError : Object.keys(errors || {}).length > 0;
  
  // Show success state briefly
  useEffect(() => {
    if (isSuccess && !isSubmitting && showSuccessState) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), successStateDuration);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, isSubmitting, showSuccessState, successStateDuration]);

  // Get list of errors for tooltip
  const errorList = Object.entries(errors || {}).map(([field, error]) => {
    return `${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: ${error?.message || 'Invalid'}`;
  });
  
  // Determine if form is valid
  const isFormValid = validateForm
    ? (formContext?.formState?.isValid || !formContext) && !isError
    : true;
  
  const buttonDisabled = disabled || (isSubmitting && !showSuccess);
  
  // Show loading state
  if (isSubmitting && !showSuccess) {
    return (
      <Button disabled type="submit" {...props}>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {loadingText}
      </Button>
    );
  }
  
  // Show success state
  if (showSuccess) {
    return (
      <Button variant="outline" type="submit" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100" {...props}>
        <Check className="mr-2 h-4 w-4" />
        {successText}
      </Button>
    );
  }
  
  // Show error state with tooltip
  if (isError && errorList.length > 0) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="destructive" 
              type="submit" 
              disabled={buttonDisabled}
              {...props}
            >
              <AlertCircle className="mr-2 h-4 w-4" />
              {errorText}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="font-medium">Form has errors:</div>
            <ul className="list-disc list-inside text-sm">
              {errorList.slice(0, 3).map((error, i) => (
                <li key={i}>{error}</li>
              ))}
              {errorList.length > 3 && (
                <li>...and {errorList.length - 3} more</li>
              )}
            </ul>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  // Default state
  return (
    <Button 
      type="submit" 
      disabled={buttonDisabled || (validateForm && !isFormValid)} 
      {...props}
    >
      {children}
    </Button>
  );
}
