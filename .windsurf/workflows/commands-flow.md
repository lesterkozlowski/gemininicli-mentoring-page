---
description: środowisko
auto_execution_mode: 3
---

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
