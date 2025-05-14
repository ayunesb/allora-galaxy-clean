
// This file now re-exports the standardized toast system for backward compatibility
import { 
  notify,
  notifySuccess,
  notifyError, 
  notifyWarning,
  notifyInfo,
  useToast
} from "@/lib/notifications/toast";

export { notify, notifySuccess, notifyError, notifyWarning, notifyInfo, useToast };

// We export the type to maintain backward compatibility
export type ToastVariant = "default" | "success" | "destructive" | "info" | "warning";
