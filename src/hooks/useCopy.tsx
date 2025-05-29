import { useState, useCallback } from "react";
import { toast } from "sonner";

export const useCopy = () => {
  const [copied, setCopied] = useState(false);

  const copy = useCallback((text: string) => {
    if (!navigator.clipboard) {
      console.error("Clipboard API not available");
      toast.error("Clipboard API not available in your browser");
      return;
    }

    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        toast.success("Copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        toast.error("Could not copy to clipboard");
      });
  }, []);

  return { copy, copied };
};

export default useCopy;
