
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Loader2 } from 'lucide-react';
import PromptDiffViewer from '@/components/PromptDiffViewer';

interface PromptDiffAnalysisProps {
  currentPrompt: string;
  previousPrompt: string;
  agentVersionId: string;
  pluginId?: string;
}

export const PromptDiffAnalysis: React.FC<PromptDiffAnalysisProps> = ({
  currentPrompt,
  previousPrompt,
  agentVersionId,
  pluginId
}) => {
  // Fetch or generate prompt analysis
  const { data: analysis, isLoading, error } = useQuery({
    queryKey: ['prompt-analysis', agentVersionId],
    queryFn: async () => {
      try {
        // First check if we have a stored analysis
        if (agentVersionId) {
          const { data: storedAnalysis, error: fetchError } = await supabase
            .from('agent_version_analyses')
            .select('*')
            .eq('agent_version_id', agentVersionId)
            .maybeSingle();

          if (!fetchError && storedAnalysis) {
            return storedAnalysis;
          }
        }

        // Generate new analysis using edge function
        const { data, error: invokeError } = await supabase.functions.invoke('analyzePromptDiff', {
          body: {
            current_prompt: currentPrompt,
            previous_prompt: previousPrompt,
            plugin_id: pluginId,
            agent_version_id: agentVersionId
          }
        });

        if (invokeError) throw invokeError;
        return data;
      } catch (error) {
        console.error('Error analyzing prompt diff:', error);
        throw error;
      }
    },
    // Enable only if both prompts are available
    enabled: !!currentPrompt && !!previousPrompt
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>AI Prompt Analysis</span>
            {isLoading && <Loader2 className="animate-spin h-5 w-5" />}
          </CardTitle>
          <CardDescription>
            Analysis of changes between prompt versions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>Error analyzing prompt: {String(error)}</p>
            </div>
          ) : !analysis ? (
            <div className="py-4 text-center text-muted-foreground">
              {isLoading ? 'Analyzing prompt changes...' : 'No analysis available'}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Summary of Changes</h3>
                <p className="text-sm">{analysis.diff_summary}</p>
              </div>
              <Separator />
              <div>
                <h3 className="font-medium mb-2">Potential Impact</h3>
                <p className="text-sm">{analysis.impact_rationale}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prompt Diff</CardTitle>
          <CardDescription>
            Visual comparison of the prompt changes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PromptDiffViewer oldPrompt={previousPrompt} newPrompt={currentPrompt} />
        </CardContent>
      </Card>
    </div>
  );
};

export default PromptDiffAnalysis;
