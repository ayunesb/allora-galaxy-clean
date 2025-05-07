import { serve } from "https://deno.land/std@0.131.0/http/server.ts";

serve(async (req) => {
  const { strategyId } = await req.json();
  // Add your strategy execution logic here
  return new Response(JSON.stringify({ success: true, strategyId }), {
    headers: { "Content-Type": "application/json" },
  });
});