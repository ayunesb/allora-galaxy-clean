
import React from "react";
import { Toaster as Sonner } from "sonner";

import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 rounded-md border p-4 pr-6 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full data-[state=closed]:slide-out-to-right-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface ToasterProps {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center";
  closeButton?: boolean;
  richColors?: boolean;
}

export function Toaster({ position = "bottom-right", closeButton = true, richColors = true }: ToasterProps) {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme as "light" | "dark" | "system"}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: cn(toastVariants({ variant: "default" })),
          error: cn(toastVariants({ variant: "destructive" })),
          success: cn(toastVariants({ variant: "default" })),
          warning: cn(toastVariants({ variant: "default" })),
          info: cn(toastVariants({ variant: "default" })),
        },
      }}
      position={position}
      closeButton={closeButton}
      richColors={richColors}
    />
  );
}
