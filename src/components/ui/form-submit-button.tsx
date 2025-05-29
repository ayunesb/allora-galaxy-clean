import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FormSubmitButtonProps {
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  className?: string;
  type?: "submit" | "button";
  onClick?: () => void;
}

/**
 * FormSubmitButton - A submit button with loading state
 */
export function FormSubmitButton({
  loading = false,
  disabled = false,
  children,
  variant = "default",
  className = "",
  type = "submit",
  onClick,
}: FormSubmitButtonProps) {
  return (
    <Button
      type={type}
      variant={variant}
      disabled={disabled || loading}
      className={className}
      onClick={onClick}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}

export default FormSubmitButton;
