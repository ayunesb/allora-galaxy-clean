
import { useState, useCallback } from 'react';

interface UseCopyResult {
  copy: (text: string) => void;
  copied: boolean;
}

export function useCopy(resetInterval = 2000): UseCopyResult {
  const [copied, setCopied] = useState(false);

  const copy = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), resetInterval);
      },
      (err) => {
        console.error('Failed to copy text: ', err);
      }
    );
  }, [resetInterval]);

  return { copy, copied };
}

export default useCopy;
