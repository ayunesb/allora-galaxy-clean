
import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { Button } from '@/components/ui/button';
import { Home, RefreshCw } from 'lucide-react';
import { useTenantId } from '@/hooks/useTenantId';
import { useRouter } from 'next/router';

interface PageErrorBoundaryProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  redirectHome?: boolean;
}

/**
 * Error boundary specifically designed for page-level errors
 */
export const PageErrorBoundary: React.FC<PageErrorBoundaryProps> = ({
  children,
  title = 'Page Error',
  description = 'Something went wrong when loading this page.',
  redirectHome = true,
}) => {
  const tenantId = useTenantId();
  const router = useRouter();

  return (
    <ErrorBoundary
      title={title}
      description={description}
      fallback={({ error, resetErrorBoundary }) => (
        <div className="container flex flex-col items-center justify-center min-h-[60vh] py-12">
          <div className="text-destructive mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold mb-3">{title}</h2>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            {description}
          </p>
          
          {process.env.NODE_ENV !== 'production' && (
            <div className="bg-muted p-4 rounded-md mb-6 w-full max-w-md">
              <h3 className="text-sm font-semibold mb-2">Error details:</h3>
              <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-[200px]">
                {error.message}
                {error.stack && (
                  <div className="mt-2 text-xs opacity-70">{error.stack}</div>
                )}
              </pre>
            </div>
          )}
          
          <div className="flex gap-4">
            <Button 
              variant="outline"
              onClick={resetErrorBoundary}
              className="flex items-center"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            
            {redirectHome && (
              <Button 
                onClick={() => router.push('/')}
                className="flex items-center"
              >
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            )}
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
};

export default PageErrorBoundary;
