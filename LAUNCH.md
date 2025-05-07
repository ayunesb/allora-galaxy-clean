
# Launch Instructions

This document outlines the steps needed to deploy the application to production using Vercel and Supabase.

## Supabase Setup

1. **Create a Supabase Project**
   If you haven't already, create a Supabase project at [https://supabase.com](https://supabase.com).

2. **Deploy Supabase Edge Functions**
   To deploy the edge functions to your Supabase project:

   ```bash
   supabase functions deploy send-invite-email
   # Deploy other edge functions as needed
   ```

3. **Set Up Required Database Tables**
   Ensure all tables are created in your Supabase database:
   - `tenants`
   - `tenant_user_roles` 
   - `user_invites`
   - `profiles` (if used)
   - Other application tables

4. **Configure CRON Jobs in Supabase Dashboard**
   For scheduled tasks like KPI updates:

   1. Navigate to the SQL Editor in your Supabase Dashboard
   2. Create a new SQL query to set up CRON jobs:
   
   ```sql
   -- Enable the pg_cron extension in your database
   create extension pg_cron;

   -- Set up a CRON job to update KPIs daily at midnight
   select
   cron.schedule(
     'update-kpis-daily',
     '0 0 * * *', -- Run at midnight every day
     $$
     select
       net.http_post(
         url:='https://{YOUR_PROJECT_REF}.supabase.co/functions/v1/updateKPIs',
         headers:='{"Content-Type": "application/json", "Authorization": "Bearer {YOUR_ANON_KEY}"}'::jsonb,
         body:='{}'::jsonb
       ) as request_id;
     $$
   );

   -- Set up a CRON job to sync MQLs weekly on Monday
   select
   cron.schedule(
     'sync-mqls-weekly',
     '0 0 * * 1', -- Run at midnight every Monday
     $$
     select
       net.http_post(
         url:='https://{YOUR_PROJECT_REF}.supabase.co/functions/v1/syncMQLs',
         headers:='{"Content-Type": "application/json", "Authorization": "Bearer {YOUR_ANON_KEY}"}'::jsonb,
         body:='{}'::jsonb
       ) as request_id;
     $$
   );
   ```

## Vercel Setup

1. **Create a Vercel Project**
   Import your GitHub repository to Vercel at [https://vercel.com/new](https://vercel.com/new).

2. **Configure Environment Variables**
   Add the following environment variables in the Vercel project settings:

   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_ANON_KEY` - Your Supabase anonymous key
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for edge functions)
   - `STRIPE_SECRET` - Your Stripe secret key (if using Stripe)

3. **Deploy the Project**
   Click on "Deploy" in the Vercel dashboard. Vercel will build and deploy the application.

## Stripe Integration (Optional)

If you're using Stripe for payments:

1. **Set up Stripe Webhook Secret**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
   - Create a webhook endpoint for your Vercel app URL (e.g., `https://your-app.vercel.app/api/stripe-webhook`)
   - Copy the webhook signing secret
   - Add it as an environment variable in Vercel named `STRIPE_WEBHOOK_SECRET`

2. **Configure Live Mode**
   - Ensure you switch to Stripe live mode in production
   - Update the Stripe keys in your environment variables

## Email Service Configuration

For sending emails (like invitations):

1. **Postmark Setup (Recommended)**
   - Create an account at [Postmark](https://postmarkapp.com/)
   - Add a sender signature or domain
   - Get your server API token
   - Add it as an environment variable in Supabase named `POSTMARK_API_TOKEN`

2. **SMTP Fallback (Alternative)**
   - If not using Postmark, configure SMTP settings
   - Add SMTP credentials as environment variables in Supabase:
     - `SMTP_HOST`
     - `SMTP_PORT`
     - `SMTP_USER`
     - `SMTP_PASSWORD`
     - `SMTP_FROM_EMAIL`

## Final Verification Checklist

Before launching to production:

- [ ] All Edge Functions are deployed to Supabase
- [ ] All necessary environment variables are set in Vercel and Supabase
- [ ] CRON jobs are set up in Supabase
- [ ] Database tables and RLS policies are correctly configured
- [ ] Authentication flow is working as expected
- [ ] Edge functions are handling errors gracefully
- [ ] Application builds successfully with `vite build`
- [ ] TypeScript checks pass with `tsc --noEmit`

## Support and Maintenance

If you encounter any issues during or after deployment, please contact our support team at support@example.com.
