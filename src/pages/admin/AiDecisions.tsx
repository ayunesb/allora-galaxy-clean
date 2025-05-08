import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AiDecisions: React.FC = () => {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">AI Decisions</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent AI Decisions</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No AI decisions have been recorded yet.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AiDecisions;
