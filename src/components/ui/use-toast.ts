
// Re-export from our centralized toast implementation
import { 
  useToast, 
  notify as toast,
  notify,
  notifySuccess,
  notifyError,
  notifyWarning,
  notifyInfo
} from "@/lib/notifications/toast";

export { 
  useToast, 
  toast,
  notify,
  notifySuccess,
  notifyError,
  notifyWarning,
  notifyInfo
};

// For backward compatibility
export type ToastActionElement = React.ReactElement;
