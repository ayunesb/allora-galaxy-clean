
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Stripe } from "https://esm.sh/stripe@12.0.0?target=deno";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Get the stripe webhook secret from environment variables
    const stripeWebhookSecret = typeof Deno !== 'undefined' ? 
      Deno.env.get("STRIPE_WEBHOOK_SECRET") : process.env.STRIPE_WEBHOOK_SECRET || '';
    
    if (!stripeWebhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not set');
    }
    
    // Create Stripe instance
    const stripeSecretKey = typeof Deno !== 'undefined' ? 
      Deno.env.get("STRIPE_SECRET_KEY") : process.env.STRIPE_SECRET_KEY || '';
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });
    
    // Get the request body for webhook verification
    const payload = await req.text();
    const signature = req.headers.get('stripe-signature');
    
    if (!signature) {
      throw new Error('Missing stripe-signature header');
    }
    
    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(payload, signature, stripeWebhookSecret);
    } catch (err) {
      return new Response(
        JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Create Supabase client with service role
    const supabaseUrl = typeof Deno !== 'undefined' ? 
      Deno.env.get("SUPABASE_URL") : process.env.SUPABASE_URL || '';
    const supabaseServiceRole = typeof Deno !== 'undefined' ? 
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") : process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole);
    
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        // Find the tenant by Stripe customer ID
        const { data: tenants, error } = await supabaseAdmin
          .from('tenants')
          .select('id')
          .eq('metadata->stripe_customer_id', session.customer)
          .limit(1);
          
        if (error) {
          throw error;
        }
        
        if (tenants && tenants.length > 0) {
          const tenantId = tenants[0].id;
          
          // Insert or update subscription
          await supabaseAdmin
            .from('subscriptions')
            .upsert({
              tenant_id: tenantId,
              stripe_subscription_id: session.subscription,
              plan: session.metadata?.plan || 'default',
              status: 'active',
              renews_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
            }, { onConflict: 'tenant_id' });
            
          console.log(`Subscription created for tenant ${tenantId}`);
        }
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        
        // Log the failure to system_logs
        await supabaseAdmin
          .from('system_logs')
          .insert({
            type: 'subscription_payment_failed',
            message: `Payment failed for subscription ${invoice.subscription}. Status: ${invoice.status}`,
            metadata: {
              stripe_customer_id: invoice.customer,
              subscription_id: invoice.subscription,
              invoice_id: invoice.id,
              amount: invoice.amount_due,
            }
          });
          
        console.log(`Payment failed for subscription ${invoice.subscription}`);
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Webhook error:', error.message);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
