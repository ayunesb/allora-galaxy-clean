
# Launch Guide for Allora OS

This document outlines the steps needed to deploy and configure Allora OS properly in production.

## Environment Setup

### Supabase Configuration

1. Create a new Supabase project
2. Run the initial migration scripts from `migrations/initial_schema.sql`
3. Set up the required storage buckets:
   - `logos` (public) - For user and company logos
   - `exports` (private) - For exporting strategy data
   - `audit-pdfs` (private) - For compliance documentation

### Required Environment Variables

#### Vercel Project Settings

Add the following environment variables to your Vercel project:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### Supabase Edge Function Secrets

Configure these secrets for your Supabase Edge Functions:

```
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
STRIPE_SECRET_KEY=your-stripe-secret-key
SMTP_HOST=your-smtp-host
SMTP_PORT=your-smtp-port
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
```

## Deployment Steps

### Supabase Functions

Deploy all Supabase Edge Functions:

```bash
supabase functions deploy executeStrategy
supabase functions deploy send-invite-email
supabase functions deploy syncMQLs
supabase functions deploy updateKPIs
```

### CRON Setup

The following functions need to be scheduled:

1. `updateKPIs` - Every 6 hours
2. `syncMQLs` - Daily at midnight

Configure these in the Supabase dashboard under Edge Functions > Schedule.

### Stripe Integration

1. Create a Stripe webhook endpoint to receive events at `/api/stripe-webhook`
2. Configure the webhook to listen for:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `checkout.session.completed`

## Post-Deployment Verification

After deploying, verify:

1. Authentication flows (login, signup, password reset)
2. Data persistence through Supabase
3. Edge function execution
4. CRON job execution
5. External integrations (Stripe, email)
6. Security measures (RLS policies)

## Troubleshooting

- Check Supabase Edge Function logs if integrations fail
- Verify environment variables are correctly set
- Ensure database migrations are applied correctly
