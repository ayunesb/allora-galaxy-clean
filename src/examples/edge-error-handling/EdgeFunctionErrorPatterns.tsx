
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EdgeFunctionHandler } from '@/components/errors/EdgeFunctionHandler';

const EdgeFunctionErrorPatterns: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Edge Function Error Patterns</CardTitle>
      </CardHeader>
      <CardContent>
        <p>This component demonstrates different edge function error patterns.</p>
        <EdgeFunctionHandler
          isLoading={false}
          error={null}
          showDetails={true}
        >
          <p>Example content when there are no errors</p>
        </EdgeFunctionHandler>
      </CardContent>
    </Card>
  );
};

export default EdgeFunctionErrorPatterns;
