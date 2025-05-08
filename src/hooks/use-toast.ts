
// Re-export the original toast functionality from the shadcn package
import { useToast as useShadcnToast, toast } from "@/components/ui/use-toast";

export const useToast = useShadcnToast;
export { toast };
