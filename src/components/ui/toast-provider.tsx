
import { Toaster } from "sonner";
import { useTheme } from "next-themes";

export interface ToastProviderProps {
  children: React.ReactNode;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center";
  richColors?: boolean;
  expandByDefault?: boolean;
  duration?: number;
  className?: string;
}

export function ToastProvider({
  children,
  position = "bottom-right",
  richColors = true,
  expandByDefault = false,
  duration = 4000,
  className,
}: ToastProviderProps) {
  const { theme = "system" } = useTheme();

  return (
    <>
      {children}
      <Toaster 
        theme={theme as "light" | "dark" | "system"} 
        position={position}
        closeButton
        richColors={richColors}
        expand={expandByDefault}
        toastOptions={{
          duration,
          className: className || "toast-container"
        }}
      />
    </>
  );
}
