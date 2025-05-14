
import React from 'react';
import ErrorStateExamples from '@/components/examples/ErrorStateExamples';
import { PageErrorBoundary, ErrorBoundary } from '@/lib/errors';

const ErrorStateExamplesPage: React.FC = () => {
  return (
    <PageErrorBoundary>
      <div className="py-8">
        <ErrorStateExamples />
      </div>
    </PageErrorBoundary>
  );
};

export default ErrorStateExamplesPage;
