
import React from 'react';
import { Toaster } from 'sonner';
import { useTheme } from 'next-themes';

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme = 'system' } = useTheme();

  return (
    <>
      {children}
      <Toaster 
        theme={theme as 'light' | 'dark' | 'system'} 
        position="bottom-right"
        closeButton
        richColors
      />
    </>
  );
}
