
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PluginEvolutionTabProps {
  onStrategySelect?: (strategyId: string) => void;
}

export const PluginEvolutionTab: React.FC<PluginEvolutionTabProps> = ({ onStrategySelect }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Plugin Evolution</CardTitle>
        <CardDescription>
          Track performance and evolutionary progress of plugins
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Plugin evolution data will be displayed here.
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
