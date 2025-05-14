
// Re-export from our centralized toast implementation
export { 
  useToast, 
  notify as toast,
  notifySuccess,
  notifyError,
  notifyWarning,
  notifyInfo
} from "@/lib/notifications/toast";

// For backward compatibility
export interface ToastProps {
  title?: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
}

export type ToastActionElement = React.ReactElement;
