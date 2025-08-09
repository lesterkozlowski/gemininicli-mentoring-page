# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a CRM system for managing a mentoring program, built with Cloudflare's stack (Pages + Workers + D1). The system manages four types of entities: **Mentors**, **Mentees**, **Supporters**, and **Partner Organizations**. 

Key architectural decisions:
- **Frontend**: React + TypeScript + Material-UI, built with Vite
- **Backend**: Hono framework running on Cloudflare Workers  
- **Database**: Cloudflare D1 (SQLite-based)
- **Deployment**: Cloudflare Pages with automatic deployments

## Database Architecture

The system uses a normalized schema with three main tables:

1. **`contacts`** - Unified table for mentors, mentees, and supporters with `type` field and JSON `details` field for type-specific data
2. **`organizations`** - Partner NGOs and organizations
3. **`activities`** - Notes and tasks linked to contacts/organizations via `parent_type` and `parent_id`

Migration files are in `/migrations/` - use separate files for schema (`0001_initial_schema.sql`) and sample data (`0002_seed_data.sql`).

## API Architecture

The API has two logical sections:
- **Public API**: `/api/public/apply/:type` - handles form submissions without authentication
- **Private CRM API**: All other endpoints require Bearer token authentication (simplified for now)

Backend code goes in `/functions/[[path]].ts` - this catch-all route handles all API endpoints using Hono routing.

## Common Commands

**Development:**
```bash
npm run dev           # Start local development with hot reload
npm run build         # Build frontend for production  
npm run preview       # Preview production build locally
```

**Database:**
```bash
npm run db:migrate:local  # Apply migrations to local D1 database
npm run db:migrate        # Apply migrations to remote D1 database
```

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

1. Database changes require new migration files in `/migrations/`
2. API endpoints are defined in `/functions/[[path]].ts` using Hono
3. Frontend components go in `/src/components/` with Material-UI styling
4. The system supports both public form widgets (embeddable) and a private CRM interface
5. All contacts have a `status` field representing their position in the process funnel
6. Activities system supports both notes and tasks with due dates

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