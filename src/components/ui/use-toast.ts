
/**
 * @file Toast Hook Re-export
 * Re-exports toast hook functionality from the application hook system
 * 
 * This file serves as a compatibility layer to access toast functionality
 * through the component UI directory while the implementation lives in the hooks folder.
 */

import { useToast, toast, type ToastActionElement } from "@/hooks/use-toast";

/**
 * Toast System
 * 
 * The toast notification system in Allora OS provides:
 * 
 * 1. Consistent UI for transient notifications
 * 2. Multiple notification types (info, success, warning, error)
 * 3. Support for actions within toast notifications
 * 4. Automatic dismissal with configurable duration
 * 5. Accessibility features for screen readers
 * 
 * Usage patterns:
 * 
 * - Use `toast()` for simple, fire-and-forget notifications
 * - Use `useToast()` hook when you need more control or access to the toast state
 * - Add action buttons with `action` property for interactive toasts
 * - Specify appropriate variant for visual indication of notification type
 * 
 * @example
 * // Simple usage
 * toast({
 *   title: "Success",
 *   description: "Your changes have been saved.",
 * });
 * 
 * @example
 * // With action button
 * toast({
 *   title: "Error",
 *   description: "Failed to save changes.",
 *   variant: "destructive",
 *   action: <ToastAction altText="Try again">Retry</ToastAction>,
 * });
 * 
 * @example
 * // Using the hook
 * const { toast } = useToast();
 * toast({
 *   title: "Profile updated",
 *   description: "Your profile has been updated successfully."
 * });
 */

export { 
  /** Hook for using toast functionality in components */
  useToast, 
  /** Function for displaying toast notifications */
  toast, 
  /** Type for toast action elements */
  type ToastActionElement 
};
