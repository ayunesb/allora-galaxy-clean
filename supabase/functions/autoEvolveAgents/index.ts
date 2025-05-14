
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  corsHeaders,
  createErrorResponse,
  createSuccessResponse,
  getEnv,
  handleCorsRequest,
  logSystemEvent,
  parseJsonBody,
  validateRequiredFields,
  withRetry
} from "../_shared/edgeUtils.ts";

// Configuration for automatic agent evolution
const CONFIG = {
  // Thresholds for evolution
  minUpvotesForEvolution: 5,
  minUpvoteRatio: 0.65,
  maxAgentsToEvolve: 3,
  // Retry configuration
  retryAttempts: 3,
  retryBaseDelay: 500, // ms
  // OpenAI configuration
  model: "gpt-4", // Default model to use
  temperature: 0.7
};

serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCorsRequest(req);
  if (corsResponse) return corsResponse;
  
  const requestStart = performance.now();
  const requestId = `evolve_${Date.now().toString(36)}`;
  
  console.log(`[${requestId}] Request received to auto-evolve agents`);
  
  try {
    // Get environment variables
    const SUPABASE_URL = getEnv("SUPABASE_URL", true);
    const SUPABASE_SERVICE_ROLE_KEY = getEnv("SUPABASE_SERVICE_ROLE_KEY", true);
    const OPENAI_API_KEY = getEnv("OPENAI_API_KEY", true);
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !OPENAI_API_KEY) {
      return createErrorResponse(
        "Missing required environment variables",
        {
          missing: [
            !SUPABASE_URL && "SUPABASE_URL",
            !SUPABASE_SERVICE_ROLE_KEY && "SUPABASE_SERVICE_ROLE_KEY",
            !OPENAI_API_KEY && "OPENAI_API_KEY",
          ].filter(Boolean)
        },
        500
      );
    }
    
    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Parse and validate request body
    let body;
    try {
      body = await parseJsonBody(req);
    } catch (error) {
      return createErrorResponse("Invalid JSON in request body", String(error), 400);
    }
    
    // Validate tenant_id
    const missingFields = validateRequiredFields(body, ['tenant_id']);
    if (missingFields.length > 0) {
      return createErrorResponse(
        `Missing required fields: ${missingFields.join(', ')}`,
        { required: ['tenant_id'] },
        400
      );
    }
    
    const { tenant_id } = body;
    
    // Log the start of the process
    await logSystemEvent(
      supabase,
      'agent',
      'auto_evolve_start',
      { tenant_id, request_id: requestId },
      tenant_id
    );
    
    // Find agents eligible for evolution
    const eligibleAgents = await findEligibleAgents(supabase, tenant_id);
    
    console.log(`[${requestId}] Found ${eligibleAgents.length} agents eligible for evolution`);
    
    if (eligibleAgents.length === 0) {
      return createSuccessResponse({
        evolved: 0,
        message: "No agents eligible for evolution",
        request_id: requestId
      });
    }
    
    // Limit the number of agents to evolve
    const agentsToEvolve = eligibleAgents.slice(0, CONFIG.maxAgentsToEvolve);
    const evolvedAgents = [];
    
    // Evolve each agent
    for (const agent of agentsToEvolve) {
      try {
        console.log(`[${requestId}] Evolving agent version: ${agent.id}`);
        
        const evolveResult = await evolveAgentVersion(
          supabase, 
          agent, 
          OPENAI_API_KEY,
          requestId
        );
        
        if (evolveResult.success) {
          evolvedAgents.push({
            originalId: agent.id,
            newVersionId: evolveResult.newVersionId,
            improvements: evolveResult.improvements
          });
        }
      } catch (agentError) {
        console.error(`[${requestId}] Error evolving agent ${agent.id}:`, agentError);
        
        // Log the error but continue with other agents
        await logSystemEvent(
          supabase,
          'agent',
          'agent_evolution_error',
          { 
            agent_id: agent.id,
            error: String(agentError),
            request_id: requestId
          },
          tenant_id
        );
      }
    }
    
    // Log completion of the process
    await logSystemEvent(
      supabase,
      'agent',
      'auto_evolve_complete',
      { 
        tenant_id,
        agents_evolved: evolvedAgents.length,
        evolved_agents: evolvedAgents.map(a => a.newVersionId),
        request_id: requestId,
        execution_time: (performance.now() - requestStart) / 1000
      },
      tenant_id
    );
    
    // Return results
    return createSuccessResponse({
      success: true,
      evolved: evolvedAgents.length,
      agentVersionIds: evolvedAgents.map(a => a.newVersionId),
      message: evolvedAgents.length > 0 
        ? `Successfully evolved ${evolvedAgents.length} agents` 
        : "No agents were evolved",
      execution_time: (performance.now() - requestStart) / 1000,
      request_id: requestId
    });
    
  } catch (error) {
    console.error(`[${requestId}] Unexpected error:`, error);
    
    return createErrorResponse(
      "Failed to auto-evolve agents",
      {
        details: error instanceof Error ? error.message : String(error),
        execution_time: (performance.now() - requestStart) / 1000,
        request_id: requestId
      },
      500
    );
  }
});

/**
 * Find agents eligible for evolution based on vote counts and ratios
 */
async function findEligibleAgents(supabase: any, tenantId: string) {
  try {
    // Use retry logic for database query
    const { data, error } = await withRetry(
      async () => {
        return await supabase
          .from('agent_versions')
          .select('id, version, prompt, plugin_id, upvotes, downvotes, created_at')
          .eq('status', 'active')
          .gte('upvotes', CONFIG.minUpvotesForEvolution)
          .order('upvotes', { ascending: false });
      },
      {
        retries: CONFIG.retryAttempts,
        delay: CONFIG.retryBaseDelay,
        onRetry: (attempt) => console.log(`Retrying eligible agents query, attempt ${attempt}`)
      }
    );
    
    if (error) throw error;
    
    // Filter agents based on upvote ratio
    return (data || []).filter(agent => {
      const totalVotes = agent.upvotes + agent.downvotes;
      const upvoteRatio = totalVotes > 0 ? agent.upvotes / totalVotes : 0;
      return upvoteRatio >= CONFIG.minUpvoteRatio;
    });
    
  } catch (error) {
    console.error('Error finding eligible agents:', error);
    throw new Error(`Failed to find eligible agents: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Evolve an agent version by improving its prompt
 */
async function evolveAgentVersion(
  supabase: any, 
  agent: any, 
  apiKey: string,
  requestId: string
) {
  try {
    // Get user comments/feedback for this agent version
    const { data: votes, error: votesError } = await withRetry(
      () => supabase
        .from('agent_votes')
        .select('vote_type, comment')
        .eq('agent_version_id', agent.id)
        .not('comment', 'is', null),
      { retries: CONFIG.retryAttempts, delay: CONFIG.retryBaseDelay }
    );
    
    if (votesError) throw votesError;
    
    // Filter comments by vote type
    const upvoteComments = votes
      .filter(v => v.vote_type === 'up' && v.comment)
      .map(v => v.comment);
      
    const downvoteComments = votes
      .filter(v => v.vote_type === 'down' && v.comment)
      .map(v => v.comment);
      
    // Get plugin information if this agent is for a plugin
    let pluginData = null;
    if (agent.plugin_id) {
      const { data: plugin, error: pluginError } = await withRetry(
        () => supabase
          .from('plugins')
          .select('name, description, metadata')
          .eq('id', agent.plugin_id)
          .single(),
        { retries: CONFIG.retryAttempts, delay: CONFIG.retryBaseDelay }
      );
      
      if (pluginError) {
        console.warn(`[${requestId}] Warning: Could not fetch plugin data: ${pluginError.message}`);
      } else {
        pluginData = plugin;
      }
    }
    
    // Analyze and improve the prompt using OpenAI
    const improvements = await improvePromptWithAI(
      agent.prompt, 
      upvoteComments, 
      downvoteComments,
      pluginData,
      apiKey
    );
    
    // Create a new agent version with the improved prompt
    const newVersion = parseFloat(agent.version) + 0.1;
    
    const { data: newAgent, error: insertError } = await withRetry(
      () => supabase
        .from('agent_versions')
        .insert({
          plugin_id: agent.plugin_id,
          prompt: improvements.newPrompt,
          version: newVersion.toFixed(1),
          status: 'active',
          created_by: null // System-generated
        })
        .select()
        .single(),
      { retries: CONFIG.retryAttempts, delay: CONFIG.retryBaseDelay }
    );
    
    if (insertError) throw insertError;
    
    // Insert analysis record
    await withRetry(
      () => supabase
        .from('agent_version_analyses')
        .insert({
          agent_version_id: newAgent.id,
          plugin_id: agent.plugin_id,
          diff_summary: improvements.diffSummary,
          impact_rationale: improvements.impactRationale
        }),
      { retries: CONFIG.retryAttempts, delay: CONFIG.retryBaseDelay }
    );
    
    return {
      success: true,
      newVersionId: newAgent.id,
      improvements: {
        diffSummary: improvements.diffSummary,
        impactRationale: improvements.impactRationale
      }
    };
    
  } catch (error) {
    console.error(`[${requestId}] Error evolving agent:`, error);
    throw new Error(`Failed to evolve agent: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Use OpenAI to analyze and improve a prompt based on feedback
 */
async function improvePromptWithAI(
  originalPrompt: string,
  upvoteComments: string[],
  downvoteComments: string[],
  pluginData: any | null,
  apiKey: string
) {
  try {
    // Format feedback into a coherent string
    const positiveFeedback = upvoteComments.length > 0
      ? `POSITIVE FEEDBACK:\n${upvoteComments.map(c => `- ${c}`).join('\n')}`
      : "No positive feedback available.";
      
    const negativeFeedback = downvoteComments.length > 0
      ? `NEGATIVE FEEDBACK:\n${downvoteComments.map(c => `- ${c}`).join('\n')}`
      : "No negative feedback available.";
    
    // Create plugin context if available
    const pluginContext = pluginData
      ? `PLUGIN CONTEXT:
- Name: ${pluginData.name}
- Description: ${pluginData.description}
- Additional Info: ${JSON.stringify(pluginData.metadata || {})}`
      : "No plugin context available.";
    
    // Construct the prompt for OpenAI
    const systemPrompt = `You are an expert AI prompt engineer. Your task is to improve an existing prompt based on user feedback.
Analyze the original prompt and the user feedback, then create an improved version that addresses the issues while maintaining the prompt's original intent.
Provide a summary of the changes you made and explain how they address the feedback.`;

    const userPrompt = `ORIGINAL PROMPT:
${originalPrompt}

${positiveFeedback}

${negativeFeedback}

${pluginContext}

Please provide:
1. An improved version of the prompt
2. A summary of changes made (max 300 chars)
3. A rationale explaining how these improvements address the feedback (max 500 chars)

Format your response as a JSON object with these keys: "newPrompt", "diffSummary", "impactRationale"`;

    // Make the request to OpenAI API with retries
    let attempt = 0;
    const maxAttempts = 3;
    
    while (attempt < maxAttempts) {
      attempt++;
      
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: CONFIG.model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            temperature: CONFIG.temperature,
            response_format: { type: "json_object" }
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`OpenAI API error (${response.status}): ${JSON.stringify(errorData)}`);
        }
        
        const data = await response.json();
        
        // Parse and validate the response
        let content;
        try {
          content = JSON.parse(data.choices[0].message.content);
          
          // Validate the response has all required fields
          if (!content.newPrompt || !content.diffSummary || !content.impactRationale) {
            throw new Error('Response is missing required fields');
          }
          
          return {
            newPrompt: content.newPrompt,
            diffSummary: content.diffSummary,
            impactRationale: content.impactRationale
          };
        } catch (parseError) {
          if (attempt >= maxAttempts) {
            throw new Error(`Failed to parse OpenAI response: ${parseError.message}`);
          }
          console.warn(`Attempt ${attempt}: Failed to parse OpenAI response, retrying...`);
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
      } catch (fetchError) {
        if (attempt >= maxAttempts) {
          throw fetchError;
        }
        console.warn(`Attempt ${attempt}: OpenAI API error, retrying...`, fetchError);
        // Wait before retrying with exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
      }
    }
    
    throw new Error('Failed to get response from OpenAI after multiple attempts');
  } catch (error) {
    console.error('Error improving prompt with AI:', error);
    throw new Error(`AI prompt improvement failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
