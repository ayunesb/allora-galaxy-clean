
import React from 'react';
import { cn } from '@/lib/utils';
import { Label } from './label';
import { Input } from './input';
import { Textarea } from './textarea';
import { SimpleErrorMessage } from './error-message';

interface FormFieldProps {
  id: string;
  label?: string;
  error?: string;
  description?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

interface InputFieldProps {
  id: string;
  label?: string;
  error?: string;
  description?: string;
  required?: boolean;
  className?: string;
  type?: string;
  placeholder?: string;
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  [key: string]: any;
}

interface TextareaFieldProps {
  id: string;
  label?: string;
  error?: string;
  description?: string;
  required?: boolean;
  className?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
  rows?: number;
  [key: string]: any;
}

export function FormField({
  id,
  label,
  error,
  description,
  required,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label 
          htmlFor={id} 
          className={cn(
            "text-sm font-medium", 
            error ? "text-destructive" : ""
          )}
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      {children}
      {description && !error && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {error && <SimpleErrorMessage message={error} />}
    </div>
  );
}

export function InputField({
  id,
  label,
  error,
  description,
  required,
  className,
  type = "text",
  ...props
}: InputFieldProps) {
  return (
    <FormField
      id={id}
      label={label}
      error={error}
      description={description}
      required={required}
      className={className}
    >
      <Input
        id={id}
        type={type}
        className={cn(error ? "border-destructive" : "")}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : description ? `${id}-description` : undefined}
        {...props}
      />
    </FormField>
  );
}

export function TextareaField({
  id,
  label,
  error,
  description,
  required,
  className,
  rows = 4,
  ...props
}: TextareaFieldProps) {
  return (
    <FormField
      id={id}
      label={label}
      error={error}
      description={description}
      required={required}
      className={className}
    >
      <Textarea
        id={id}
        className={cn(error ? "border-destructive" : "")}
        rows={rows}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : description ? `${id}-description` : undefined}
        {...props}
      />
    </FormField>
  );
}
