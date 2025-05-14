
import { Toaster } from "sonner";
import { useTheme } from "next-themes";

export function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme = "system" } = useTheme();

  return (
    <>
      {children}
      <Toaster 
        theme={theme as "light" | "dark" | "system"} 
        position="bottom-right"
        closeButton
        richColors
        expand={false}
        toastOptions={{
          duration: 4000,
          className: "toast-container"
        }}
      />
    </>
  );
}
