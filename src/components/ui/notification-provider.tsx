
import React from 'react';
import { Toaster } from 'sonner';

export function NotificationProvider() {
  return (
    <Toaster
      position="top-right"
      closeButton
      theme="system"
      richColors
      toastOptions={{
        duration: 5000,
      }}
    />
  );
}
