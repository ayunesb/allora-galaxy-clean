
import React from 'react';
import { Toaster } from 'sonner';
import { useTheme } from 'next-themes';

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { theme = "system" } = useTheme();

  return (
    <>
      {children}
      <Toaster
        position="top-right"
        closeButton
        theme={theme as "light" | "dark" | "system"}
        richColors
        toastOptions={{
          duration: 5000,
        }}
      />
    </>
  );
}
