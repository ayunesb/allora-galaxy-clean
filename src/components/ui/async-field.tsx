
import React, { useState, useEffect } from 'react';
import { FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';

interface AsyncFieldProps {
  name: string;
  label?: string;
  description?: string;
  loading?: boolean;
  validating?: boolean;
  asyncMessage?: string;
  children: React.ReactNode;
}

/**
 * AsyncField - Form field component with support for async validation states
 */
export const AsyncField = React.forwardRef<HTMLDivElement, AsyncFieldProps>(
  ({ name, label, description, loading, validating, asyncMessage, children }, ref) => {
    const [showAsyncIndicator, setShowAsyncIndicator] = useState(false);
    
    // Add a slight delay before showing the async indicator to prevent flickering
    useEffect(() => {
      let timer: NodeJS.Timeout;
      if (validating) {
        timer = setTimeout(() => setShowAsyncIndicator(true), 300);
      } else {
        setShowAsyncIndicator(false);
      }
      
      return () => {
        clearTimeout(timer);
      };
    }, [validating]);
    
    return (
      <FormItem ref={ref}>
        {label && (
          <div className="flex justify-between">
            <FormLabel htmlFor={name}>{label}</FormLabel>
            {showAsyncIndicator && (
              <span className="text-xs flex items-center text-muted-foreground">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Validating...
              </span>
            )}
          </div>
        )}
        <FormControl>
          {React.isValidElement(children)
            ? React.cloneElement(children, { 
                id: name, 
                disabled: loading || validating,
                "aria-busy": validating 
              })
            : children}
        </FormControl>
        {description && <FormDescription>{description}</FormDescription>}
        <FormMessage />
        {asyncMessage && !validating && (
          <p className="text-xs text-muted-foreground mt-1">{asyncMessage}</p>
        )}
      </FormItem>
    );
  }
);

AsyncField.displayName = 'AsyncField';
