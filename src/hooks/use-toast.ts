
import { toast } from "sonner";

// Toast variants
export type ToastVariant = "default" | "success" | "destructive" | "info" | "warning";

// Basic notification function
export const notify = (message: string, variant: ToastVariant = "default") => {
  switch (variant) {
    case "success":
      toast.success(message);
      break;
    case "destructive":
      toast.error(message);
      break;
    case "info":
      toast.info(message);
      break;
    case "warning":
      toast.warning(message);
      break;
    default:
      toast(message);
  }
};

// Helper functions for common use cases
export const notifySuccess = (message: string) => notify(message, "success");
export const notifyError = (message: string) => notify(message, "destructive");
export const notifyWarning = (message: string) => notify(message, "warning");
export const notifyInfo = (message: string) => notify(message, "info");

// Hook for toast notifications
export const useToast = () => {
  return {
    toast,
    notify,
    success: notifySuccess,
    error: notifyError, 
    warning: notifyWarning,
    info: notifyInfo
  };
};

export default useToast;
