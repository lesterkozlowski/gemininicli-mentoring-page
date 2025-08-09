# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a CRM system for managing a mentoring program, built with Cloudflare's stack (Pages + Workers + D1). The system manages four types of entities: **Mentors**, **Mentees**, **Supporters**, and **Partner Organizations**. 

Key architectural decisions:
- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui components, built with Vite
- **Backend**: Hono framework running on Cloudflare Workers/Pages Functions
- **Database**: Cloudflare D1 (SQLite-based)
- **Deployment**: Cloudflare Pages with automatic deployments

## Current Status

✅ **Completed:**
- Modern React frontend with Tailwind CSS and shadcn/ui components
- Full dark mode support using CSS variables
- Responsive layout with proper flexbox structure
- Backend API with Hono framework
- Database schema with migrations and seed data
- Dashboard connected to real API data
- Environment-aware scripts for dev/production

🚧 **In Progress:**
- CRM functionality (contacts, organizations management)
- Authentication system
- Public form widgets

## Database Architecture

The system uses a normalized schema with three main tables:

1. **`contacts`** - Unified table for mentors, mentees, and supporters with `type` field and JSON `details` field for type-specific data
2. **`organizations`** - Partner NGOs and organizations
3. **`activities`** - Notes and tasks linked to contacts/organizations via `parent_type` and `parent_id`

Migration files are in `/migrations/` - use separate files for schema (`0001_initial_schema.sql`) and sample data (`0002_seed_data.sql`).

## API Architecture

The API has two logical sections:
- **Public API**: `/api/public/apply/:type` - handles form submissions without authentication (TODO)
- **Private CRM API**: All other endpoints require Bearer token authentication (simplified for now)

Backend code goes in `/functions/api/[[path]].ts` - this catch-all route handles all API endpoints using Hono routing.

**Current API Endpoints:**
- `GET /api/health` - Health check
- `GET /api/dashboard/stats` - Dashboard statistics (total contacts, organizations, tasks, conversion rate)
- `GET /api/dashboard/monthly-growth` - Monthly contact growth data for charts
- `GET /api/dashboard/status-distribution` - Contact status distribution for pie chart
- `GET /api/dashboard/recent-activities` - Recent activities feed

**Authentication:** Currently uses simple Bearer token (`demo-token`) - TODO: implement proper auth

## Common Commands

**Development:**
```bash
npm run dev           # Start local development with hot reload (uses .env LOCAL_DEV setting)
npm run build         # Build frontend for production  
npm run preview       # Preview production build locally
```

**Database:**
```bash
npm run db:migrate    # Apply migrations (uses .env LOCAL_DEV setting - local by default, production when LOCAL_DEV=false)
```

**Environment Configuration:**
The project uses `.env` file with `LOCAL_DEV=true` for development. Commands automatically detect this and add `--local` flags where needed. For production deployment, remove `LOCAL_DEV=true` or set `LOCAL_DEV=false`.

**Local Development Access:**
When running `npm run dev`, the application is typically available at:
- `http://localhost:8788` (Cloudflare Workers local server)

The exact port may vary - check console output when starting the dev server.

**Testing & Quality:**
```bash
npm run test         # Run unit tests with Vitest
npm run test:e2e     # Run E2E tests with Playwright
npm run lint         # Lint TypeScript/React code
npm run typecheck    # Type check without emitting files
```

**Deployment:**
```bash
npm run deploy       # Deploy to Cloudflare Pages
```

## Development Workflow

1. **Setup**: Run `npm install` and `npm run db:migrate` to initialize database
2. **Development**: Use `npm run dev` to start local server with hot reload
3. **Database changes**: Create new migration files in `/migrations/` (never modify existing migrations)
4. **API endpoints**: Add to `/functions/api/[[path]].ts` using Hono framework
5. **Frontend components**: Place in `/src/components/` using Tailwind CSS and shadcn/ui
6. **Styling**: Uses Tailwind CSS with CSS variables for theming (supports dark mode)
7. **State management**: Simple React hooks, consider adding context/store for complex state

## Frontend Architecture

- **Layout**: `src/components/Layout.tsx` - Main layout with sidebar navigation and dark mode toggle
- **Dashboard**: `src/components/Dashboard.tsx` - Connected to real API data with loading/error states
- **UI Components**: `src/components/ui/` - Reusable shadcn/ui components (button, card, etc.)
- **Hooks**: `src/hooks/useApi.ts` - Custom hook for API calls with loading/error handling
- **Types**: `src/types/api.ts` - TypeScript interfaces for API responses

## Key Features to Implement

Based on the specification in `docs/crm_functional_spec.md`:

- Public form widgets for mentor/mentee/supporter applications
- CRM dashboard with contact management, filtering, and search
- Status management for tracking contacts through the process
- Notes and tasks system for each contact/organization
- Summary comments for quick contact identification

## Database Connection

The existing D1 database is configured in `wrangler.toml`:
- Database ID: `e8973bbc-c580-4487-ae96-f0a7243dd991`
- Database name: `mentoring-db`

When making database changes, always create new migration files rather than modifying existing ones.