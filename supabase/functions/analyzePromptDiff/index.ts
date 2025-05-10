
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Helper function to safely get environment variables
function getEnv(name: string, fallback: string = ""): string {
  try {
    return Deno.env.get(name) ?? fallback;
  } catch (err) {
    console.error(`Error accessing env variable ${name}:`, err);
    return fallback;
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PromptDiffRequest {
  oldPrompt: string;
  newPrompt: string;
  plugin_id?: string;
  agent_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get API keys from environment
    const openaiApiKey = getEnv("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    // Parse request
    const requestData: PromptDiffRequest = await req.json();
    
    // Validate request
    if (!requestData.oldPrompt || !requestData.newPrompt) {
      return new Response(
        JSON.stringify({ error: "Both oldPrompt and newPrompt are required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare OpenAI request
    const prompt = `
    Analyze the differences between these two AI prompts.
    
    PROMPT 1:
    ${requestData.oldPrompt}
    
    PROMPT 2:
    ${requestData.newPrompt}
    
    Please provide:
    1. A summary of key changes (max 3 bullet points)
    2. Assessment of how these changes might impact performance
    3. Potential improvements or concerns
    
    Format your response as JSON with the following structure:
    {
      "summary": ["point1", "point2", "point3"],
      "impact_assessment": "your assessment here",
      "recommendations": ["recommendation1", "recommendation2"],
      "concerns": ["concern1", "concern2"]
    }
    `;

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using GPT-4 mini for better analysis
        messages: [
          { role: 'system', content: 'You are an AI prompt analysis expert.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3, // Low temperature for more consistent results
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      throw new Error(`OpenAI API error: ${openaiResponse.status} ${errorData}`);
    }

    const openaiData = await openaiResponse.json();
    let analysis;

    try {
      // Extract the analysis from the response
      const content = openaiData.choices[0].message.content;
      
      // Try to parse as JSON
      try {
        analysis = JSON.parse(content);
      } catch (e) {
        // If not valid JSON, return the raw content
        analysis = { 
          raw_analysis: content,
          error: "Could not parse response as JSON" 
        };
      }
    } catch (error) {
      throw new Error(`Failed to process OpenAI response: ${error.message}`);
    }

    // Log analysis to Supabase if plugin_id or agent_id is provided
    if (requestData.plugin_id || requestData.agent_id) {
      try {
        const supabaseUrl = getEnv("SUPABASE_URL");
        const supabaseKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
        
        if (supabaseUrl && supabaseKey) {
          const supabase = createClient(supabaseUrl, supabaseKey);
          
          await supabase.from('system_logs').insert({
            module: requestData.plugin_id ? 'plugin' : 'agent',
            event: 'prompt_diff_analysis',
            context: {
              plugin_id: requestData.plugin_id,
              agent_id: requestData.agent_id,
              analysis,
              old_prompt_length: requestData.oldPrompt.length,
              new_prompt_length: requestData.newPrompt.length,
              timestamp: new Date().toISOString()
            }
          });
        }
      } catch (logError) {
        console.error('Error logging to Supabase:', logError);
        // Continue even if logging fails
      }
    }

    // Return the analysis
    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in analyzePromptDiff function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error occurred' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
