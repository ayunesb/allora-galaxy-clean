
# Allora OS - AI-Native Business Management Platform

Allora OS is a comprehensive AI-native business management platform built with React, TypeScript, TailwindCSS, and Supabase. It provides tools for strategy generation, plugin management, and business intelligence through an intuitive user interface.

## Features

- **Authentication**: Email/password login, signup, and password reset powered by Supabase Auth
- **Multi-tenant support**: Organizations can create and manage separate workspaces
- **Strategy engine**: AI-powered business strategy generation
- **Plugin system**: Extensible framework for AI agents with version history and performance tracking
- **Galaxy explorer**: Visual network graph of connections between plugins, strategies, and agents
- **Agent performance system**: Track XP, success rates, and user feedback
- **Admin panel**: Manage user access, review logs, and govern AI decisions
- **KPI dashboard**: Track key business metrics from integrated systems

## Getting Started

### Prerequisites

- Node.js 16+
- A Supabase account

### Installation

1. Clone the repository
2. Install dependencies
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Set up the Supabase database by running the SQL in `src/lib/supabase-schema.sql`
5. Start the development server
   ```
   npm run dev
   ```

## Supabase Setup

1. Create a new Supabase project
2. Enable the Auth service and configure email authentication
3. Run the SQL commands in `src/lib/supabase-schema.sql` to create the required database tables
4. Set up the Edge Functions for strategy execution and KPI updates

### Row-Level Security (RLS)

The schema includes RLS policies to ensure data security:
- Users can only access data from tenants they are members of
- Role-based permissions control who can create, update, or delete resources
- Admin users have elevated permissions across the platform

## Application Structure

- `src/components`: Reusable UI components
- `src/context`: React context providers for auth and workspace state
- `src/hooks`: Custom React hooks
- `src/lib`: Utility functions and Supabase client
- `src/pages`: Main application pages
- `src/types`: TypeScript type definitions

## Key Pages

- `/auth`: Login, signup, and password reset
- `/onboarding`: New workspace setup wizard
- `/`: Dashboard home
- `/launch`: Strategy creation and management
- `/plugins`: Plugin management
- `/plugins/:id/evolution`: Plugin version history and performance
- `/explore`: Galaxy explorer visualization
- `/agents/performance`: Agent performance metrics
- `/insights/kpis`: Business KPI dashboard
- `/admin/*`: Admin panel pages

## Technologies Used

- **React**: UI framework
- **TypeScript**: Type-safe JavaScript
- **TailwindCSS**: Utility-first CSS framework
- **shadcn/ui**: UI component library based on Radix UI
- **Supabase**: Backend-as-a-service (auth, database)
- **React Router**: Client-side routing
- **React Query**: Data fetching and state management
- **D3.js**: Data visualization (galaxy explorer)
- **Recharts**: Chart components

## License

This project is licensed under the MIT License
