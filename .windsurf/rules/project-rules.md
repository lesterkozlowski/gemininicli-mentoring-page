---
trigger: always_on
---

1. Komuniuj się ze mną po polsku ale kod i komentarze w kodzie pisz po angielsku.
2. Kieruj się planem docs/PLAN.md o specyfikacją techniczną docs/TECHNICAL_SPECIFICATION.md, a w razie wątpliwości i dla szerszego obrazu zaglądaj do @DOCS/PRD.md
3. Dąż do jak najszybszego dostarczenia użytkownikowi pełnej mini-funkcjonalności do testów np. pełnego CRUDa dla danej encji lub pełnego formularza do użyci zewnątrz. 
4. Jak tylko zakończysz danę funkcjonalność spradż czy uruchomiłeś już PREVIEW projektu przy pomocy swojego narzędzia (tool), a jeśli nie to uruchom. Jeśli jest uruchomione nie zabijaj i nie uruchamiaj ponownie. Prawdopdoobnie kod się sam zaktualizował
5. Na ile to tylko możliwe staraj się przetestować samodzielnie funkcjonalność. Masz zainstalowany playwright który umożliwia Ci wejście na stronę preview i samodzielne nawigowanie po niej oraz robienie screenów. 
6. Jak potwierdzisz, że strona działa oddaj ją do testów przez użytkownika. Dopiero po potwierdzeniu przez użytkownika działania funkcjonalności zaznacz ją w docs/PLAN.md jako zrobioną. 
7. Po porawnych testach i potwierdzeniu przejdź od razu do kolejnej funkcjonalności.




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
