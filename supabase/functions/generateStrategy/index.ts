
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Import environment utilities
import { getEnv } from "../../lib/env.ts";
import { validateEnv, logEnvStatus, type EnvVar } from "../../lib/validateEnv.ts";
import { 
  formatErrorResponse,
  formatSuccessResponse,
  safeParseRequest
} from "../../lib/validation.ts";

const MODULE_NAME = "generateStrategy";

// Define required environment variables
const requiredEnv: EnvVar[] = [
  { name: 'SUPABASE_URL', required: true, description: 'Supabase project URL' },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', required: true, description: 'Service role key for admin access' },
  { name: 'OPENAI_API_KEY', required: true, description: 'OpenAI API key for strategy generation' }
];

// Define input schema
const generateStrategySchema = z.object({
  tenant_id: z.string().uuid(),
  company_profile: z.object({
    name: z.string(),
    industry: z.string(),
    size: z.string(),
    website: z.string().optional(),
    description: z.string().optional(),
    revenue_range: z.string().optional(),
  }),
  persona_profile: z.object({
    name: z.string(),
    tone: z.string(),
    goals: z.array(z.string())
  }),
  user_id: z.string().uuid() // Created by
});

// Validate environment variables
const env = validateEnv(requiredEnv);
logEnvStatus(env);

// Create Supabase client with admin privileges
const supabaseAdmin = env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

interface StrategyResponse {
  title: string;
  description: string;
  tags: string[];
  priority: 'high' | 'medium' | 'low';
  due_date: string; // ISO date string
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  const startTime = performance.now();
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log(`${MODULE_NAME}: Processing request`);
    
    // Check if environment variables are valid
    if (!env.OPENAI_API_KEY) {
      console.error(`${MODULE_NAME}: Missing OPENAI_API_KEY`);
      return formatErrorResponse(
        500,
        "OPENAI_API_KEY is not configured",
        undefined,
        (performance.now() - startTime) / 1000
      );
    }

    // Check if Supabase client was initialized properly
    if (!supabaseAdmin) {
      console.error(`${MODULE_NAME}: Missing Supabase configuration`);
      return formatErrorResponse(
        500, 
        "Supabase client could not be initialized", 
        "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured",
        (performance.now() - startTime) / 1000
      );
    }

    // Parse and validate request using zod schema
    const [payload, parseError] = await safeParseRequest(req, generateStrategySchema);
    
    if (parseError || !payload) {
      console.error(`${MODULE_NAME}: Invalid payload - ${parseError}`);
      return formatErrorResponse(400, parseError || "Invalid request", undefined, (performance.now() - startTime) / 1000);
    }
    
    const { tenant_id, company_profile, persona_profile, user_id } = payload;

    // Log start of strategy generation
    console.log(`${MODULE_NAME}: Generating strategy for tenant ${tenant_id}, company: ${company_profile.name}`);
    
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

    try {
      console.log(`${MODULE_NAME}: Calling OpenAI API`);
      
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
        console.error(`${MODULE_NAME}: OpenAI API error:`, error);
        return formatErrorResponse(
          500, 
          "Failed to generate strategy", 
          `OpenAI API error: ${error}`,
          (performance.now() - startTime) / 1000
        );
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

      console.log(`${MODULE_NAME}: Strategy generated, storing in database`);
      
      try {
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
          console.error(`${MODULE_NAME}: Error storing strategy:`, strategyError);
          return formatErrorResponse(
            500, 
            "Failed to store generated strategy", 
            strategyError.message,
            (performance.now() - startTime) / 1000
          );
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
          console.warn(`${MODULE_NAME}: Failed to log strategy generation event:`, logError);
        }

        console.log(`${MODULE_NAME}: Strategy generated successfully with ID ${strategyData.id}`);
        
        return formatSuccessResponse({
          message: "Strategy generated successfully",
          strategy: { ...strategy, id: strategyData.id }
        }, (performance.now() - startTime) / 1000);
      } catch (dbError) {
        console.error(`${MODULE_NAME}: Database error:`, dbError);
        return formatErrorResponse(
          500, 
          "Failed to store strategy in database", 
          String(dbError),
          (performance.now() - startTime) / 1000
        );
      }
    } catch (openAiError) {
      console.error(`${MODULE_NAME}: Error calling OpenAI API:`, openAiError);
      return formatErrorResponse(
        500,
        "Failed to generate strategy with OpenAI", 
        String(openAiError),
        (performance.now() - startTime) / 1000
      );
    }
  } catch (error) {
    console.error(`${MODULE_NAME}: Unhandled error:`, error);
    return formatErrorResponse(
      500,
      "Failed to generate strategy", 
      String(error),
      (performance.now() - startTime) / 1000
    );
  }
});
