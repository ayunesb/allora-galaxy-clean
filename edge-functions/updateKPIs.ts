import { serve } from "https://deno.land/std@0.131.0/http/server.ts";

serve(async (req) => {
  const { kpiData } = await req.json();
  // ...existing code...
  return new Response(JSON.stringify({ success: true, kpiData }), {
    headers: { "Content-Type": "application/json" },
  });
});