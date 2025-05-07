
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Import environment utilities
import { getEnv } from "../../lib/env.ts";
import { validateEnv, logEnvStatus } from "../../lib/validateEnv.ts";
import { corsHeaders, formatErrorResponse } from "../../lib/corsHeaders.ts";

// Define required environment variables
const requiredEnv = [
  { name: 'SUPABASE_URL', required: true, description: 'Supabase project URL' },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', required: true, description: 'Service role key for admin access' },
  { name: 'OPENAI_API_KEY', required: true, description: 'OpenAI API key for strategy generation' }
];

// Validate environment variables
const env = validateEnv(requiredEnv);
logEnvStatus(env);

// Create Supabase client with admin privileges
const supabaseAdmin = env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

interface GenerateStrategyRequest {
  tenant_id: string;
  company_profile: {
    name: string;
    industry: string;
    size: string;
    website?: string;
    description?: string;
    revenue_range?: string;
  };
  persona_profile: {
    name: string;
    tone: string;
    goals: string[];
  };
  user_id: string; // Created by
}

interface StrategyResponse {
  title: string;
  description: string;
  tags: string[];
  priority: 'high' | 'medium' | 'low';
  due_date: string; // ISO date string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Check if Supabase client was initialized properly
  if (!supabaseAdmin) {
    return formatErrorResponse(
      500, 
      "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured"
    );
  }

  try {
    // Parse request body
    const { tenant_id, company_profile, persona_profile, user_id } = await req.json() as GenerateStrategyRequest;
    
    if (!tenant_id) {
      return formatErrorResponse(400, "Missing required field: tenant_id");
    }
    
    if (!company_profile || !persona_profile) {
      return formatErrorResponse(400, "Missing required fields: company_profile or persona_profile");
    }

    // Log start of strategy generation
    console.log(`Generating strategy for tenant ${tenant_id}, company: ${company_profile.name}`);
    
    // Create system prompt
    const systemPrompt = `You are an AI business strategist. Generate a go-to-market plan based on the company profile and marketing persona provided.
Focus on creating an actionable strategy with specific, measurable objectives.
Your strategy should be appropriate for a ${company_profile.size} company in the ${company_profile.industry} industry.`;

    // Create user prompt with company and persona details
    const userPrompt = `
Company Profile:
- Name: ${company_profile.name}
- Industry: ${company_profile.industry}
- Size: ${company_profile.size}
${company_profile.revenue_range ? `- Revenue Range: ${company_profile.revenue_range}` : ''}
${company_profile.website ? `- Website: ${company_profile.website}` : ''}
${company_profile.description ? `- Description: ${company_profile.description}` : ''}

Marketing Persona:
- Name: ${persona_profile.name}
- Tone: ${persona_profile.tone}
- Goals: ${persona_profile.goals.join(", ")}

Generate a comprehensive go-to-market strategy for this company targeting the specified persona. 
Include a catchy title, detailed plan description, relevant tags, priority level (high, medium, or low), and a reasonable due date.`;

    // OpenAI API call to generate strategy
    const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    if (!openAiResponse.ok) {
      const error = await openAiResponse.text();
      console.error("OpenAI API error:", error);
      return formatErrorResponse(500, `OpenAI API error: ${error}`);
    }

    const aiResponse = await openAiResponse.json();
    const generatedContent = JSON.parse(aiResponse.choices[0].message.content);
    
    // Format and validate the AI response
    const strategy: StrategyResponse = {
      title: generatedContent.title || `Strategy for ${company_profile.name}`,
      description: generatedContent.description || "Generated strategy description",
      tags: Array.isArray(generatedContent.tags) ? generatedContent.tags : [],
      priority: ['high', 'medium', 'low'].includes(generatedContent.priority) 
        ? generatedContent.priority 
        : 'medium',
      due_date: generatedContent.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    // Store the generated strategy in the database
    const { data: strategyData, error: strategyError } = await supabaseAdmin
      .from('strategies')
      .insert({
        tenant_id,
        created_by: user_id,
        title: strategy.title,
        description: strategy.description,
        tags: strategy.tags,
        priority: strategy.priority,
        due_date: strategy.due_date,
        status: 'pending'
      })
      .select('id')
      .single();

    if (strategyError) {
      console.error("Error storing strategy:", strategyError);
      return formatErrorResponse(500, `Error storing strategy: ${strategyError.message}`);
    }

    // Log success and strategy creation in system_logs
    try {
      await supabaseAdmin.from('system_logs').insert({
        tenant_id,
        module: 'strategy',
        event: 'strategy_generated',
        context: {
          strategy_id: strategyData.id,
          generated_by: 'ai'
        }
      });
    } catch (logError) {
      console.warn("Failed to log strategy generation event:", logError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Strategy generated successfully",
        strategy: { ...strategy, id: strategyData.id }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("Error in generateStrategy:", error);
    return formatErrorResponse(500, "Failed to generate strategy", String(error));
  }
});
