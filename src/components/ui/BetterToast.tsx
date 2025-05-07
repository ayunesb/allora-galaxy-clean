
import React from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  X 
} from 'lucide-react';
import { toast as sonnerToast } from 'sonner';
import { toast } from '@/hooks/use-toast';
import { Button } from './button';

export type ToastVariant = 'default' | 'destructive' | 'success' | 'warning' | 'info';

interface ToastProps {
  title: string;
  description?: string;
  variant?: ToastVariant;
  action?: React.ReactNode;
}

function getIconForVariant(variant: ToastVariant) {
  switch (variant) {
    case 'success':
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    case 'destructive':
      return <XCircle className="h-5 w-5 text-red-600" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    case 'info':
      return <Info className="h-5 w-5 text-blue-600" />;
    default:
      return null;
  }
}

export function notifySuccess(title: string, description?: string) {
  toast({
    title,
    description,
    variant: "default",
    className: "border-green-600 bg-green-50 dark:bg-green-950/30",
  });
}

export function notifyError(title: string, description?: string) {
  toast({
    title,
    description,
    variant: "destructive",
  });
}

export function notifyWarning(title: string, description?: string) {
  toast({
    title,
    description,
    variant: "default",
    className: "border-yellow-600 bg-yellow-50 dark:bg-yellow-950/30",
  });
}

export function notifyInfo(title: string, description?: string) {
  toast({
    title,
    description,
    variant: "default",
    className: "border-blue-600 bg-blue-50 dark:bg-blue-950/30",
  });
}

export function BetterToast({
  title,
  description,
  variant = 'default',
  action,
}: ToastProps) {
  const icon = getIconForVariant(variant);
  
  // Convert our internal variant to what toast component accepts
  let toastVariant: 'default' | 'destructive';
  if (variant === 'destructive') {
    toastVariant = 'destructive';
  } else {
    toastVariant = 'default';
  }
  
  // Convert the action to a proper element if provided
  const actionElement = action ? (
    typeof action === 'string' ? (
      <Button variant="outline" size="sm">{action}</Button>
    ) : (
      action
    )
  ) : undefined;
  
  return toast({
    title,
    description,
    variant: toastVariant,
    className: variant !== 'default' && variant !== 'destructive' 
      ? `border-${variant === 'success' ? 'green' : variant === 'warning' ? 'yellow' : 'blue'}-600` 
      : undefined,
    action: actionElement,
  });
}

// Sonner toast variants for simpler usage patterns
export function sonnerSuccess(title: string, description?: string) {
  sonnerToast.success(title, { description });
}

export function sonnerError(title: string, description?: string) {
  sonnerToast.error(title, { description });
}

export function sonnerWarning(title: string, description?: string) {
  sonnerToast.warning(title, { description });
}

export function sonnerInfo(title: string, description?: string) {
  sonnerToast.info(title, { description });
}
