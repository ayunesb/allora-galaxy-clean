
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Book, Brain, Layers, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const WelcomeSection: React.FC = () => {
  const { user } = useAuth();
  
  // Safely access user metadata if it exists
  const userName = user?.email?.split('@')[0] || 'there';
  
  return (
    <Card className="shadow-md border-t-4 border-t-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-full">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          Welcome to Allora OS
        </CardTitle>
        <CardDescription>
          Your AI-Native Business Management Platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>
          Hello {userName}, Allora OS helps you build, deploy,
          and evolve AI-powered business strategies.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors">
            <div className="bg-primary/10 p-3 rounded-full mb-3">
              <Rocket className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium mb-1">Launch Strategy</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Create and deploy AI-assisted business strategies
            </p>
            <Button variant="outline" size="sm" className="mt-auto" asChild>
              <Link to="/launch">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors">
            <div className="bg-primary/10 p-3 rounded-full mb-3">
              <Layers className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium mb-1">Explore Plugins</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Browse and install plugins to extend functionality
            </p>
            <Button variant="outline" size="sm" className="mt-auto" asChild>
              <Link to="/plugins">
                View Plugins <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors">
            <div className="bg-primary/10 p-3 rounded-full mb-3">
              <Book className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium mb-1">Documentation</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Learn how to use Allora OS effectively
            </p>
            <Button variant="outline" size="sm" className="mt-auto" asChild>
              <Link to="/documentation">
                Read Docs <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WelcomeSection;
