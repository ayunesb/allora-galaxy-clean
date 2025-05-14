
// This file re-exports the standardized toast system for backward compatibility
import { 
  notify,
  notifySuccess,
  notifyError, 
  notifyWarning,
  notifyInfo,
  useToast,
  ToastType
} from "@/lib/notifications/toast";

export { 
  notify, 
  notifySuccess, 
  notifyError, 
  notifyWarning, 
  notifyInfo, 
  useToast 
};

// We export the type for backward compatibility
export type ToastVariant = ToastType;
