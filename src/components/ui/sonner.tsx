
import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";
import { 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  XCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "destructive group border-destructive bg-destructive/10 text-destructive dark:border-red-800 dark:bg-red-950",
        success:
          "success group border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-200",
        warning:
          "warning group border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200",
        info:
          "info group border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export type ToastPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center";

interface ToasterProps {
  position?: ToastPosition;
  closeButton?: boolean;
  richColors?: boolean;
  duration?: number;
  className?: string;
}

export function Toaster({ 
  position = "bottom-right", 
  closeButton = true, 
  richColors = true, 
  duration = 5000,
  className 
}: ToasterProps) {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme as "light" | "dark" | "system"}
      className={cn("toaster group", className)}
      toastOptions={{
        classNames: {
          toast: cn(toastVariants({ variant: "default" })),
          error: cn(toastVariants({ variant: "destructive" })),
          success: cn(toastVariants({ variant: "success" })),
          warning: cn(toastVariants({ variant: "warning" })),
          info: cn(toastVariants({ variant: "info" })),
          actionButton: "bg-primary text-primary-foreground hover:bg-primary/90",
          cancelButton: "bg-muted text-muted-foreground hover:bg-muted/90",
          title: "text-foreground font-medium text-sm",
          description: "text-muted-foreground text-xs",
          closeButton: "text-foreground/50 hover:text-foreground",
        },
        icons: {
          success: <CheckCircle2 className="h-4 w-4" />,
          error: <XCircle className="h-4 w-4" />,
          warning: <AlertCircle className="h-4 w-4" />,
          info: <Info className="h-4 w-4" />,
        }
      }}
      position={position}
      closeButton={closeButton}
      richColors={richColors}
      duration={duration}
    />
  );
}

export { toast } from "sonner";

// Export convenience methods for consistent toast usage
import { toast as sonnerToast, type ToastT } from "sonner";

type ToastOptions = {
  description?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  cancel?: {
    label: string;
    onClick?: () => void;
  };
  duration?: number;
  position?: ToastPosition;
  important?: boolean;
  onDismiss?: () => void;
  onAutoClose?: () => void;
  className?: string;
};

export type ToastType = "default" | "success" | "error" | "warning" | "info";

export const notify = (title: string, options?: ToastOptions & { type?: ToastType }) => {
  const { type = "default", ...restOptions } = options || {};
  
  switch (type) {
    case "success":
      return sonnerToast.success(title, restOptions);
    case "error":
      return sonnerToast.error(title, restOptions);
    case "warning":
      return sonnerToast.warning(title, restOptions);
    case "info":
      return sonnerToast.info(title, restOptions);
    default:
      return sonnerToast(title, restOptions);
  }
};

// Convenience methods
export const notifySuccess = (title: string, options?: Omit<ToastOptions, "type">) => 
  notify(title, { ...options, type: "success" });

export const notifyError = (title: string, options?: Omit<ToastOptions, "type">) => 
  notify(title, { ...options, type: "error" });

export const notifyWarning = (title: string, options?: Omit<ToastOptions, "type">) => 
  notify(title, { ...options, type: "warning" });

export const notifyInfo = (title: string, options?: Omit<ToastOptions, "type">) => 
  notify(title, { ...options, type: "info" });

// Promise toast helper
export const notifyPromise = <T,>(
  promise: Promise<T>, 
  { loading, success, error }: { loading: string; success: string | ((data: T) => string); error: string | ((error: any) => string) }
) => {
  return sonnerToast.promise(promise, {
    loading,
    success: (data) => typeof success === "function" ? success(data) : success,
    error: (err) => typeof error === "function" ? error(err) : error
  });
};
