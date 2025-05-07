import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

const StrategyGenerationStep: React.FC = () => {
  const { currentTenant } = useWorkspace();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(true);
  const [progressMessage, setProgressMessage] = useState('Initializing strategy generation...');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const generateStrategy = async () => {
      if (!currentTenant?.id) {
        setError('No tenant information available. Please restart the onboarding process.');
        setIsGenerating(false);
        return;
      }

      try {
        setProgressMessage('Fetching company and persona profiles...');
        setProgress(10);
        
        // Get company profile
        const { data: companyProfile, error: companyError } = await supabase
          .from('company_profiles')
          .select('*')
          .eq('tenant_id', currentTenant.id)
          .single();
          
        if (companyError) {
          throw new Error(`Failed to fetch company profile: ${companyError.message}`);
        }
        
        setProgress(30);
        setProgressMessage('Analyzing persona data...');
        
        // Get persona profile
        const { data: personaProfile, error: personaError } = await supabase
          .from('persona_profiles')
          .select('*')
          .eq('tenant_id', currentTenant.id)
          .single();
          
        if (personaError) {
          throw new Error(`Failed to fetch persona profile: ${personaError.message}`);
        }
        
        setProgress(50);
        setProgressMessage('Analyzing company and market data...');
        
        // Call the generateStrategy edge function
        const { data: generationResult, error: functionError } = await supabase.functions.invoke('generateStrategy', {
          body: {
            tenant_id: currentTenant.id,
            company_profile: companyProfile,
            persona_profile: personaProfile
          }
        });
        
        if (functionError) {
          throw new Error(`Strategy generation failed: ${functionError.message}`);
        }
        
        setProgress(90);
        setProgressMessage('Strategy generated successfully!');
        
        toast({
          title: "Strategy created",
          description: "Your AI-powered strategy is ready to view in the dashboard.",
        });
        
        // Wait a moment before proceeding to next step
        setTimeout(() => {
          setProgress(100);
          setIsGenerating(false);
        }, 1000);
        
      } catch (error: any) {
        console.error('Strategy generation error:', error);
        setError(`Failed to generate strategy: ${error.message}`);
        setIsGenerating(false);
        
        toast({
          title: "Strategy generation failed",
          description: error.message || "Please try again",
          variant: "destructive",
        });
      }
    };

    if (currentTenant?.id) {
      generateStrategy();
    }
  }, [currentTenant, toast]);

  if (error) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-6">
        <div className="text-center space-y-3">
          <h3 className="text-xl font-semibold text-red-600">Generation Error</h3>
          <p className="text-muted-foreground max-w-md">{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
          {progressMessage}
        </p>
      </div>
      
      <div className="w-full max-w-md">
        <Progress value={progress} className="h-2" />
      </div>
      
      <div className="max-w-md">
        <div className="bg-muted p-4 rounded-md text-sm space-y-2">
          <p>We're taking into account:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Your company's industry and size</li>
            <li>Your revenue targets and business goals</li>
            <li>Your target audience persona and tone</li>
            <li>Current market trends in your industry</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StrategyGenerationStep;
