
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, CheckCircle2 } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Card className="shadow-md border-primary/20">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-3xl font-bold">Welcome to Allora OS</CardTitle>
          <CardDescription className="text-lg">
            Let's set up your AI-native business workspace
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4 mt-4">
            <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
              <h3 className="font-medium mb-2 flex items-center">
                <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
                Account Created Successfully
              </h3>
              <p className="text-sm text-muted-foreground">
                Your account has been created and you're ready to start setting up your workspace.
              </p>
            </div>

            <h3 className="font-medium mt-2">What's next? You'll need to:</h3>
            
            <ul className="space-y-2 list-inside">
              {[
                'Set up your company profile',
                'Define your target audience persona',
                'Add your business goals',
                'Generate your first AI strategy'
              ].map((item, i) => (
                <li key={i} className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
              <h3 className="font-medium mb-1 text-amber-800">Estimated Time: 5 minutes</h3>
              <p className="text-sm text-amber-700">
                This quick onboarding process will help us customize your experience and generate
                relevant AI strategies for your business.
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end pt-0">
          <Button 
            size="lg" 
            onClick={onStart}
            className="gap-2"
          >
            Start Onboarding
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default WelcomeScreen;
