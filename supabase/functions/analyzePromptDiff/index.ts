import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { diffLines } from "https://esm.sh/diff@5.2.0";

// Import environment utilities
import { getEnv } from "../../lib/env.ts";
import { corsHeaders, formatErrorResponse } from "../../lib/corsHeaders.ts";
import { validateEnv, type EnvVar } from "../../lib/validateEnv.ts";

// Define required environment variables
const requiredEnv: EnvVar[] = [
  { name: 'SUPABASE_URL', required: true, description: 'Supabase project URL' },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', required: true, description: 'Service role key for admin access' },
  { name: 'OPENAI_API_KEY', required: true, description: 'OpenAI API key for analyzing prompt differences' }
];

// Validate environment variables
const env = validateEnv(requiredEnv);

// Create Supabase client with admin privileges
const supabaseAdmin = env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

interface PromptDiffRequest {
  current_prompt: string;
  previous_prompt: string;
  plugin_id?: string;
  agent_version_id?: string;
}

interface PromptDiffResponse {
  diff_summary: string;
  impact_rationale: string;
  raw_diff?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { current_prompt, previous_prompt, plugin_id, agent_version_id } = await req.json() as PromptDiffRequest;
    
    if (!current_prompt || !previous_prompt) {
      return formatErrorResponse(400, "Missing required fields: current_prompt or previous_prompt");
    }

    // Generate raw diff
    const diffResult = diffLines(previous_prompt, current_prompt);
    
    // Extract changes for the AI to analyze
    const changes = diffResult.map(part => {
      const prefix = part.added ? "+ " : part.removed ? "- " : "  ";
      return prefix + part.value.trim();
    }).join("\n");
    
    // Reduce changes if they're too long
    const maxDiffLength = 8000; // Limit to fit within token constraints
    const trimmedChanges = changes.length > maxDiffLength
      ? changes.substring(0, maxDiffLength) + "\n...(diff truncated due to length)"
      : changes;

    // OpenAI API call to analyze prompt changes
    const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: "You are an AI prompt engineering expert. Analyze the changes between two versions of an AI agent prompt and explain what has been modified and why these changes might matter."
          },
          { 
            role: "user", 
            content: `Analyze the following diff between two versions of an AI agent prompt. Provide a concise summary of what changed and explain the potential impact of these changes on the AI's performance, behavior, and output.

Here's the diff:
\`\`\`diff
${trimmedChanges}
\`\`\`

Your analysis should include:
1. A brief summary of the main changes (1-2 sentences)
2. An explanation of how these changes might impact the agent's performance and behavior`
          }
        ],
        temperature: 0.5
      })
    });

    if (!openAiResponse.ok) {
      const error = await openAiResponse.text();
      console.error("OpenAI API error:", error);
      return formatErrorResponse(500, `OpenAI API error: ${error}`);
    }

    const aiResponse = await openAiResponse.json();
    const analysisContent = aiResponse.choices[0].message.content;
    
    // Parse the response to extract summary and rationale
    const lines = analysisContent.split("\n");
    let diffSummary = "";
    let impactRationale = "";
    let parsingImpact = false;
    
    for (const line of lines) {
      if (line.toLowerCase().includes("summary") || diffSummary.length === 0) {
        if (!diffSummary) {
          diffSummary = line.replace(/^.*summary.*:/i, "").trim();
        } else if (!line.toLowerCase().includes("impact")) {
          diffSummary += " " + line.trim();
        }
      }
      
      if (line.toLowerCase().includes("impact") || parsingImpact) {
        parsingImpact = true;
        if (impactRationale) {
          impactRationale += " " + line.trim();
        } else {
          impactRationale = line.replace(/^.*impact.*:/i, "").trim();
        }
      }
    }
    
    // If parsing failed, use the entire response
    if (!diffSummary) diffSummary = analysisContent.substring(0, 200);
    if (!impactRationale) impactRationale = analysisContent;
    
    const response: PromptDiffResponse = {
      diff_summary: diffSummary,
      impact_rationale: impactRationale,
      raw_diff: diffResult
    };

    // If agent_version_id is provided, store the analysis in the database
    if (supabaseAdmin && agent_version_id) {
      try {
        await supabaseAdmin
          .from('agent_version_analyses')
          .upsert({
            agent_version_id,
            plugin_id,
            diff_summary: response.diff_summary,
            impact_rationale: response.impact_rationale,
            analyzed_at: new Date().toISOString()
          }, {
            onConflict: 'agent_version_id',
            ignoreDuplicates: false
          });
      } catch (dbError) {
        console.warn("Failed to store prompt analysis:", dbError);
      }
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error in analyzePromptDiff:", error);
    return formatErrorResponse(500, "Failed to analyze prompt diff", String(error));
  }
});
