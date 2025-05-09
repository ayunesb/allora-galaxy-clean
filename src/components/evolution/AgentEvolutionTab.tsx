
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AgentEvolutionTabProps {
  onStrategySelect?: (strategyId: string) => void;
}

const AgentEvolutionTab: React.FC<AgentEvolutionTabProps> = ({ onStrategySelect }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Evolution</CardTitle>
        <CardDescription>
          Track performance and evolutionary progress of AI agents
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Agent evolution data will be displayed here.
        </p>
        {onStrategySelect && (
          <Button 
            variant="outline" 
            onClick={() => onStrategySelect('example-strategy-id')}
            className="mt-4"
          >
            View Related Strategy
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default AgentEvolutionTab;
