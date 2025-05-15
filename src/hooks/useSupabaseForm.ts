
import { useState, useCallback } from 'react';
import { UseFormReturn, FieldValues, SubmitHandler } from 'react-hook-form';
import { notifySuccess, notifyError } from '@/lib/notifications/toast';
import { handleSupabaseError } from '@/lib/errors/ErrorHandler';
import { supabase } from '@/lib/supabase/supabaseClient';

export interface UseSupabaseFormOptions<TFieldValues extends FieldValues = FieldValues> {
  table?: string;
  successMessage?: string;
  errorMessage?: string;
  resetOnSuccess?: boolean;
  redirectOnSuccess?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  formMethods: UseFormReturn<TFieldValues>;
  transformData?: (data: TFieldValues) => any;
  operation?: 'insert' | 'update' | 'upsert' | 'delete';
  matchField?: string;
  matchValue?: any;
}

/**
 * A hook for handling form submission to Supabase with error handling and notifications
 */
export function useSupabaseForm<TFieldValues extends FieldValues = FieldValues>({
  table,
  successMessage = 'Successfully saved',
  errorMessage = 'Failed to save',
  resetOnSuccess = false,
  redirectOnSuccess,
  onSuccess,
  onError,
  formMethods,
  transformData,
  operation = 'insert',
  matchField = 'id',
  matchValue,
}: UseSupabaseFormOptions<TFieldValues>) {
  const { handleSubmit, reset, setError, formState } = formMethods;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<Error | null>(null);
  const [submitResult, setSubmitResult] = useState<any>(null);

  const onSubmit: SubmitHandler<TFieldValues> = useCallback(async (data) => {
    if (!table) {
      throw new Error('Table name is required for Supabase form submission');
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Transform the data if needed
      const finalData = transformData ? transformData(data) : data;
      
      let result;
      
      switch (operation) {
        case 'update':
          if (!matchValue) {
            throw new Error('matchValue is required for update operations');
          }
          result = await supabase
            .from(table)
            .update(finalData)
            .eq(matchField, matchValue)
            .select();
          break;
          
        case 'upsert':
          result = await supabase
            .from(table)
            .upsert(finalData)
            .select();
          break;
          
        case 'delete':
          if (!matchValue) {
            throw new Error('matchValue is required for delete operations');
          }
          result = await supabase
            .from(table)
            .delete()
            .eq(matchField, matchValue)
            .select();
          break;
          
        case 'insert':
        default:
          result = await supabase
            .from(table)
            .insert(finalData)
            .select();
          break;
      }
      
      if (result.error) {
        throw result.error;
      }
      
      setSubmitResult(result.data);
      
      // Show success message
      if (successMessage) {
        notifySuccess(successMessage);
      }
      
      // Reset form if needed
      if (resetOnSuccess) {
        reset();
      }
      
      // Redirect if needed
      if (redirectOnSuccess) {
        window.location.href = redirectOnSuccess;
      }
      
      // Call onSuccess callback
      if (onSuccess) {
        onSuccess(result.data);
      }
      
      return result.data;
    } catch (error: any) {
      // Format and set error
      setSubmitError(error);
      
      // Show error message with description using object format
      notifyError({
        title: errorMessage,
        description: error.message || 'An unexpected error occurred'
      });
      
      // Handle specific error types
      if (error?.code === '23505') {
        // Handle unique constraint violation
        const detail = error?.details || '';
        const match = detail.match(/\(([^)]+)\)=/);
        const field = match ? match[1] : null;
        
        if (field && formMethods.getValues(field as any) !== undefined) {
          setError(field as any, {
            type: 'unique',
            message: `This ${field} already exists`
          });
        }
      }
      
      // Log error to system
      handleSupabaseError(error, {
        context: {
          table,
          operation,
          submitData: finalData
        }
      });
      
      // Call onError callback
      if (onError) {
        onError(error);
      }
      
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [table, operation, matchField, matchValue, successMessage, errorMessage,
      resetOnSuccess, redirectOnSuccess, onSuccess, onError, reset, transformData, setError, formMethods]);

  const wrappedHandleSubmit = handleSubmit(onSubmit);
  
  const submitForm = useCallback(async (event?: React.FormEvent) => {
    if (event) {
      event.preventDefault();
    }
    return wrappedHandleSubmit(event as any);
  }, [wrappedHandleSubmit]);

  return {
    submitForm,
    isSubmitting,
    isSubmitSuccessful: !!submitResult && !submitError,
    submitError,
    submitResult,
    reset: () => {
      reset();
      setSubmitError(null);
      setSubmitResult(null);
    },
    formState
  };
}
