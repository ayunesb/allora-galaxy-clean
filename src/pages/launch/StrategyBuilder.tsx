
import { useState } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';

const StrategyBuilder = () => {
  const { userRole } = useWorkspace();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ai');
  
  const handleStartAiStrategy = () => {
    console.log('Starting AI strategy');
    // Placeholder: Would start AI strategy generation flow
  };
  
  const handleStartManualStrategy = () => {
    console.log('Starting manual strategy');
    // Placeholder: Would navigate to manual strategy builder
  };
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Create New Strategy</h1>
        <Button variant="outline" onClick={() => navigate('/launch')}>Back to Strategies</Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
          <TabsTrigger value="ai">AI-Generated</TabsTrigger>
          <TabsTrigger value="manual">Manual Creation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="ai" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Strategy with AI</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Let our AI analyze your business goals and create a custom strategy aligned with your objectives.
                The AI will generate step-by-step actions, resource requirements, and timeline estimates.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Marketing Campaign</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Generate a comprehensive marketing campaign strategy tailored to your target audience.
                    </p>
                    <Button onClick={handleStartAiStrategy}>Generate</Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Product Launch</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create a detailed product launch strategy to maximize market impact and adoption.
                    </p>
                    <Button onClick={handleStartAiStrategy}>Generate</Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Growth Strategy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Develop a growth strategy to expand your customer base and increase revenue.
                    </p>
                    <Button onClick={handleStartAiStrategy}>Generate</Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="manual" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Strategy Manually</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Build your own custom strategy from scratch. Define goals, actions, timelines, and resources
                according to your specific business needs.
              </p>
              <Button onClick={handleStartManualStrategy}>Start Building</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StrategyBuilder;
