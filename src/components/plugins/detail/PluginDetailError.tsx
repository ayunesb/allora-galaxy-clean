
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';

interface PluginDetailErrorProps {
  error: string | null;
}

export const PluginDetailError: React.FC<PluginDetailErrorProps> = ({ error }) => {
  const navigate = useNavigate();
  const goBack = () => navigate(-1);
  
  return (
    <div className="container mx-auto py-8">
      <Button variant="ghost" onClick={goBack} className="mb-4">
        <ChevronLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">
            {error || 'Plugin not found'}
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={goBack}>Go Back</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PluginDetailError;
