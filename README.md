
# Allora OS - Galaxy Command Center

A multi-tenant strategy-and-agent orchestration dashboard for managing AI-driven business strategies.

## Overview

Allora OS provides organizations with a unified interface to build, deploy, and evolve agent-based strategies. The Galaxy Command Center offers real-time KPI tracking, plugin management, and comprehensive system auditing.

## Features

- **Multi-tenant Architecture**: Complete tenant isolation with robust RLS policies
- **Strategy Management**: Create, deploy, and monitor AI-driven strategies
- **Plugin Marketplace**: Browse, install, and configure plugins for your strategies
- **Agent Evolution**: Track agent performance and evolutionary improvements
- **Real-time Monitoring**: Monitor KPIs and system health
- **Comprehensive Auditing**: Detailed logs and event tracking
- **Role-based Access Control**: Granular permissions for team members

## Getting Started

### Prerequisites

- Node.js (v16+)
- Supabase account
- OpenAI API key (for agent functionality)

### Installation

1. Clone the repository:
   ```bash
   git clone git@github.com:yourorg/allora-galaxy.git
   cd allora-galaxy
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── src/
│   ├── components/        # React components
│   │   ├── admin/         # Admin-specific components
│   │   ├── agent/         # Agent-related components
│   │   ├── errors/        # Error handling components
│   │   ├── evolution/     # Evolution tracking components
│   │   ├── layout/        # Layout components
│   │   ├── plugins/       # Plugin-related components
│   │   ├── strategy/      # Strategy components
│   │   └── ui/            # UI components (buttons, cards, etc.)
│   ├── context/           # React context providers
│   ├── hooks/             # Custom React hooks
│   │   ├── admin/         # Admin-specific hooks
│   │   ├── supabase/      # Supabase data fetching hooks
│   ├── lib/               # Utility libraries
│   │   ├── admin/         # Admin utilities
│   │   ├── agents/        # Agent utilities
│   │   ├── auth/          # Authentication utilities
│   │   ├── edge/          # Edge function utilities
│   │   ├── errors/        # Error handling system
│   │   ├── notifications/ # Notification system
│   │   ├── plugins/       # Plugin system
│   │   ├── strategy/      # Strategy utilities
│   │   └── system/        # System-wide utilities
│   ├── services/          # API services
│   └── types/             # TypeScript type definitions
├── edge-functions/        # Supabase Edge Functions
├── migrations/            # Database migration scripts
└── public/                # Static assets
```

## Key Components

### Error Handling System

The application includes a comprehensive error handling system:

- Standardized error types with severity levels
- Consistent error reporting across the application
- User-friendly error messages and notifications
- Error boundary components for graceful UI recovery

See [Error Handling Documentation](src/lib/errors/README.md) for more details.

### Notification System

The notification system provides:

- Toast notifications for immediate feedback
- Persistent notifications stored in the database
- System event logging for auditing
- Multi-channel notification delivery

See [Notification System Documentation](src/lib/notifications/README.md) for more details.

### Plugin System

The plugin system allows extending application functionality:

- Discoverable plugin marketplace
- Configurable plugin parameters
- Plugin execution tracking and logging
- XP and ROI metrics for plugins

See [Plugin System Documentation](src/lib/plugins/README.md) for more details.

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow the existing component patterns
- Document exported functions with JSDoc comments
- Use the shadcn/ui component library for UI elements

### Testing

- Write unit tests for utility functions
- Write component tests for UI components
- Run tests before submitting PRs:
  ```bash
  npm test
  ```

### Git Workflow

- `main` branch represents the production version
- `develop` branch is used for staging
- Create feature branches from `develop` as `feat/<feature-name>`
- Create fix branches as `fix/<issue-name>`
- Use conventional commits (e.g., `feat:`, `fix:`, `docs:`, etc.)

## Deployment

The application is deployed using Vercel:

1. Push to `develop` for staging deployment
2. Create a PR from `develop` to `main` for production deployment
3. After review and approval, merge to `main` for production release

## License

This project is licensed under the [MIT License](LICENSE).
