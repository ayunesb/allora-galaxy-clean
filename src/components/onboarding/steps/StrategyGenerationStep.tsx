
import React from 'react';
import { Loader2 } from 'lucide-react';

const StrategyGenerationStep: React.FC = () => {
  return (
    <div className="py-12 flex flex-col items-center justify-center space-y-6">
      <div className="relative">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 rounded-full bg-background"></div>
        </div>
      </div>
      
      <div className="text-center space-y-3">
        <h3 className="text-xl font-semibold">Generating Your Strategy</h3>
        <p className="text-muted-foreground max-w-md">
          Our AI is creating a tailored go-to-market strategy based on your company profile and target persona. This may take a moment...
        </p>
      </div>
      
      <div className="max-w-md">
        <div className="bg-muted p-4 rounded-md text-sm space-y-2">
          <p>We're taking into account:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Your company's industry and size</li>
            <li>Your revenue targets and business goals</li>
            <li>Your target audience persona and tone</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StrategyGenerationStep;
