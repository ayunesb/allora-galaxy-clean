import { serve } from 'https://deno.land/std/http/server.ts'
import { runStrategy } from '../../../src/lib/strategy/execute.ts'

serve(async (req) => {
  const { strategy_id } = await req.json()
  const result = await runStrategy(strategy_id)
  return new Response(JSON.stringify(result), { status: 200 })
})
