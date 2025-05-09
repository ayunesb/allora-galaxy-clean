
import { useState, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';

export function useCopy() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback((text: string, message = "Copied to clipboard!") => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(true);
        toast({
          title: "Success",
          description: message,
        });
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err);
        toast({
          title: "Error",
          description: "Failed to copy to clipboard",
          variant: "destructive",
        });
      });
  }, []);

  const copy = copyToClipboard; // Alias for backward compatibility

  return { copied, copyToClipboard, copy };
}

export default useCopy;
