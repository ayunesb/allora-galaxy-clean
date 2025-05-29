import React from "react";
import {
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface FormFieldProps {
  name: string;
  label?: string;
  description?: string;
  tooltip?: string;
  children: React.ReactNode;
  error?: string;
  className?: string;
  labelClassName?: string;
  descriptionClassName?: string;
  required?: boolean;
  hideError?: boolean;
}

/**
 * FormField - A component that renders a form field with label, description, tooltip, and error message
 */
export function FormField({
  name,
  label,
  description,
  tooltip,
  children,
  error,
  className,
  labelClassName,
  descriptionClassName,
  required,
  hideError = false,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="flex items-center gap-2">
          <label
            htmlFor={name}
            className={cn(
              "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              labelClassName,
            )}
          >
            {label}
            {required && <span className="text-destructive ml-0.5">*</span>}
          </label>

          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}

      {children}

      {description && (
        <p
          className={cn("text-sm text-muted-foreground", descriptionClassName)}
        >
          {description}
        </p>
      )}

      {!hideError && error && (
        <p className="text-sm font-medium text-destructive flex items-center gap-1">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
