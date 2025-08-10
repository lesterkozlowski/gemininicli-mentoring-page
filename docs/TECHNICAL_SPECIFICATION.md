# Specyfikacja Techniczna - Mentoring CRM

**Wersja:** 2.0  
**Data:** 2025-08-10  
**Powiązany dokument:** PRD.md  
**Typ dokumentu:** Techniczny

## 1. Architektura Systemu

### 1.1 Stack Technologiczny (Obecny)
- **Frontend:** React 18 + TypeScript + Tailwind CSS + shadcn/ui
- **Build Tool:** Vite 6.0
- **Backend:** Hono framework na Cloudflare Workers/Pages Functions
- **Baza Danych:** Cloudflare D1 (SQLite-based)
- **Hosting:** Cloudflare Pages z automatycznymi deploymentami
- **Styling:** Tailwind CSS z CSS variables (dark mode support)

### 1.2 Architektura High-Level
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (React SPA)   │◄──►│   (Hono/CF)     │◄──►│   (D1/SQLite)   │
│   Port: 3000    │    │   Port: 8788    │    │   Local/Cloud   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │              ┌─────────────────┐
         └──────────────►│  Static Assets  │
                        │  (CF Pages)     │
                        └─────────────────┘
```

## 2. Model Danych

### 2.1 Schemat Bazy Danych

#### Tabela: `contacts` (Zunifikowana tabela dla osób)
```sql
CREATE TABLE contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK (type IN ('mentor', 'mentee', 'supporter')),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'new_lead',
    summary_comment TEXT,
    details TEXT, -- JSON field dla danych specyficznych dla typu
    company_id INTEGER REFERENCES companies(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabela: `companies` (Firmy partnerskie)
```sql
CREATE TABLE companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    industry TEXT,
    size TEXT CHECK (size IN ('startup', 'small', 'medium', 'large', 'enterprise')),
    contact_person TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    website TEXT,
    cooperation_type TEXT, -- JSON array: ['sponsorship', 'jobs', 'expertise', 'mentors']
    status TEXT NOT NULL DEFAULT 'new_lead',
    summary_comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabela: `organizations` (NGO i organizacje partnerskie)
```sql
CREATE TABLE organizations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('ngo', 'foundation', 'association', 'other')),
    contact_person TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    website TEXT,
    cooperation_area TEXT, -- JSON array obszarów współpracy
    status TEXT NOT NULL DEFAULT 'new_lead',
    summary_comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabela: `mentor_mentee_relations` (Relacje wiele-do-wielu)
```sql
CREATE TABLE mentor_mentee_relations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mentor_id INTEGER NOT NULL REFERENCES contacts(id),
    mentee_id INTEGER NOT NULL REFERENCES contacts(id),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
    start_date DATE NOT NULL,
    end_date DATE,
    goals TEXT, -- JSON array celów relacji
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(mentor_id, mentee_id)
);
```

#### Tabela: `activities` (Notatki i zadania)
```sql
CREATE TABLE activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_type TEXT NOT NULL CHECK (parent_type IN ('contact', 'company', 'organization', 'relation')),
    parent_id INTEGER NOT NULL,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('note', 'task', 'call', 'meeting', 'email')),
    title TEXT,
    content TEXT NOT NULL,
    due_date DATETIME,
    is_completed INTEGER DEFAULT 0 CHECK (is_completed IN (0, 1)),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    created_by TEXT,
    assigned_to TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 2.2 Indeksy dla Wydajności
```sql
-- Indeksy dla contacts
CREATE INDEX idx_contacts_type ON contacts(type);
CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_company ON contacts(company_id);

-- Indeksy dla companies
CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_companies_industry ON companies(industry);

-- Indeksy dla organizations
CREATE INDEX idx_organizations_status ON organizations(status);
CREATE INDEX idx_organizations_type ON organizations(type);

-- Indeksy dla relations
CREATE INDEX idx_relations_mentor ON mentor_mentee_relations(mentor_id);
CREATE INDEX idx_relations_mentee ON mentor_mentee_relations(mentee_id);
CREATE INDEX idx_relations_status ON mentor_mentee_relations(status);

-- Indeksy dla activities
CREATE INDEX idx_activities_parent ON activities(parent_type, parent_id);
CREATE INDEX idx_activities_type ON activities(activity_type);
CREATE INDEX idx_activities_due_date ON activities(due_date);
CREATE INDEX idx_activities_assigned ON activities(assigned_to);
```

## 3. API Specification

### 3.1 Struktura API
```
/api/
├── public/                 # Publiczne endpointy (bez auth)
│   ├── apply/mentor       # POST - zgłoszenie mentora
│   ├── apply/mentee       # POST - zgłoszenie mentee
│   └── apply/supporter    # POST - zgłoszenie supportera
├── auth/                  # Uwierzytelnianie
│   ├── login             # POST - logowanie
│   └── refresh           # POST - odświeżenie tokena
├── contacts/             # Zarządzanie kontaktami
│   ├── mentors           # GET, POST - lista mentorów
│   ├── mentees           # GET, POST - lista mentees
│   ├── supporters        # GET, POST - lista supporterów
│   └── {id}              # GET, PUT, DELETE - konkretny kontakt
├── companies/            # Zarządzanie firmami
│   ├── /                 # GET, POST - lista firm
│   └── {id}              # GET, PUT, DELETE - konkretna firma
├── organizations/        # Zarządzanie NGO
│   ├── /                 # GET, POST - lista organizacji
│   └── {id}              # GET, PUT, DELETE - konkretna organizacja
├── relations/            # Relacje mentor-mentee
│   ├── /                 # GET, POST - lista relacji
│   ├── {id}              # GET, PUT, DELETE - konkretna relacja
│   └── suggest           # GET - sugestie dopasowań
├── activities/           # Notatki i zadania
│   ├── /                 # GET, POST - lista aktywności
│   └── {id}              # GET, PUT, DELETE - konkretna aktywność
└── dashboard/            # Dashboardy i statystyki
    ├── stats             # GET - główne statystyki
    ├── monthly-growth    # GET - wzrost miesięczny
    ├── status-distribution # GET - rozkład statusów
    └── recent-activities # GET - ostatnie aktywności
```

### 3.2 Przykładowe Endpointy

#### POST /api/public/apply/mentor
```json
{
  "name": "Jan Kowalski",
  "email": "jan@example.com",
  "phone": "+48123456789",
  "specialization": "Software Development",
  "experience_years": 10,
  "availability": "evenings",
  "mentoring_areas": ["technical", "career"],
  "company": "Tech Corp"
}
```

#### GET /api/contacts/mentors?status=active&page=1&limit=20
```json
{
  "data": [
    {
      "id": 1,
      "name": "Jan Kowalski",
      "email": "jan@example.com",
      "status": "active",
      "summary_comment": "Ekspert IT z 10-letnim doświadczeniem",
      "details": {
        "specialization": "Software Development",
        "experience_years": 10,
        "availability": "evenings"
      },
      "company": {
        "id": 1,
        "name": "Tech Corp"
      },
      "active_mentees_count": 3,
      "created_at": "2025-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

#### POST /api/relations
```json
{
  "mentor_id": 1,
  "mentee_id": 5,
  "goals": ["career development", "technical skills"],
  "start_date": "2025-02-01",
  "notes": "Dopasowanie na podstawie wspólnych zainteresowań w AI"
}
```

### 3.3 Uwierzytelnianie
- **Typ:** Bearer Token (JWT)
- **Header:** `Authorization: Bearer <token>`
- **Publiczne endpointy:** `/api/public/*` - bez uwierzytelniania
- **Prywatne endpointy:** Wszystkie pozostałe - wymagają tokena

## 4. Frontend Architecture

### 4.1 Struktura Komponentów
```
src/
├── components/
│   ├── ui/                    # shadcn/ui base components
│   ├── layout/               # Layout components
│   │   ├── Layout.tsx
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   ├── dashboard/            # Dashboard components
│   │   ├── Dashboard.tsx
│   │   ├── StatsCards.tsx
│   │   └── Charts.tsx
│   ├── contacts/             # Contact management
│   │   ├── ContactsList.tsx
│   │   ├── ContactDetail.tsx
│   │   └── ContactForm.tsx
│   ├── relations/            # Mentor-mentee relations
│   │   ├── RelationsList.tsx
│   │   ├── RelationDetail.tsx
│   │   └── MatchingSuggestions.tsx
│   └── forms/                # Public forms
│       ├── MentorForm.tsx
│       ├── MenteeForm.tsx
│       └── SupporterForm.tsx
├── hooks/
│   ├── useApi.ts            # API calls hook
│   ├── useAuth.ts           # Authentication hook
│   └── usePagination.ts     # Pagination hook
├── types/
│   ├── api.ts               # API response types
│   ├── entities.ts          # Business entities types
│   └── forms.ts             # Form types
├── utils/
│   ├── api.ts               # API utilities
│   ├── validation.ts        # Form validation
│   └── formatting.ts        # Data formatting
└── pages/
    ├── Dashboard.tsx
    ├── Mentors.tsx
    ├── Mentees.tsx
    ├── Supporters.tsx
    ├── Companies.tsx
    ├── Organizations.tsx
    └── Relations.tsx
```

### 4.2 State Management
- **Lokalne stany:** React hooks (useState, useReducer)
- **API stany:** Custom hook `useApi` z cache'owaniem
- **Globalne stany:** React Context dla auth i theme
- **Formularze:** React Hook Form z Zod validation

### 4.3 Routing
```typescript
// React Router v6 structure
const routes = [
  { path: '/', element: <Dashboard /> },
  { path: '/mentors', element: <Mentors /> },
  { path: '/mentors/:id', element: <ContactDetail type="mentor" /> },
  { path: '/mentees', element: <Mentees /> },
  { path: '/mentees/:id', element: <ContactDetail type="mentee" /> },
  { path: '/supporters', element: <Supporters /> },
  { path: '/supporters/:id', element: <ContactDetail type="supporter" /> },
  { path: '/companies', element: <Companies /> },
  { path: '/companies/:id', element: <CompanyDetail /> },
  { path: '/organizations', element: <Organizations /> },
  { path: '/organizations/:id', element: <OrganizationDetail /> },
  { path: '/relations', element: <Relations /> },
  { path: '/relations/:id', element: <RelationDetail /> }
];
```

## 5. DevOps i Deployment

### 5.1 Środowiska
- **Development:** Lokalne z `wrangler pages dev`
- **Staging:** Branch `staging` → Cloudflare Pages preview
- **Production:** Branch `main` → Cloudflare Pages production

### 5.2 CI/CD Pipeline
```yaml
# Przykład GitHub Actions
name: Deploy
on:
  push:
    branches: [main, staging]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test
      - run: npm run typecheck
      - run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: mentoring-crm
```

### 5.3 Konfiguracja Środowisk
```toml
# wrangler.toml
name = "mentoring-crm"
compatibility_date = "2025-01-01"

[env.staging]
name = "mentoring-crm-staging"

[[env.staging.d1_databases]]
binding = "DB"
database_name = "mentoring-db-staging"
database_id = "staging-db-id"

[env.production]
name = "mentoring-crm-production"

[[env.production.d1_databases]]
binding = "DB"
database_name = "mentoring-db-production"
database_id = "production-db-id"
```

## 6. Bezpieczeństwo

### 6.1 Uwierzytelnianie i Autoryzacja
- **JWT tokens** z refresh mechanism
- **Role-based access control** (admin, operator, readonly)
- **Rate limiting** na publicznych endpointach
- **CORS** skonfigurowany dla zaufanych domen

### 6.2 Ochrona Danych
- **Walidacja** wszystkich inputów (Zod schemas)
- **Sanityzacja** danych przed zapisem do DB
- **Szyfrowanie** wrażliwych danych w bazie
- **Audit log** wszystkich operacji CRUD

### 6.3 Zgodność z RODO
- **Consent management** w formularzach
- **Data retention policies** 
- **Right to be forgotten** - endpoint do usuwania danych
- **Data export** - endpoint do eksportu danych użytkownika

## 7. Monitoring i Observability

### 7.1 Metryki Biznesowe
- Liczba nowych zgłoszeń dziennie/tygodniowo
- Conversion rate z zgłoszenia do aktywnego uczestnika
- Liczba aktywnych relacji mentor-mentee
- Średni czas obsługi zgłoszenia

### 7.2 Metryki Techniczne
- Response time API endpoints
- Error rate (4xx, 5xx)
- Database query performance
- Frontend bundle size i loading time

### 7.3 Narzędzia
- **Cloudflare Analytics** - podstawowe metryki
- **Sentry** - error tracking (opcjonalnie)
- **Custom dashboards** - metryki biznesowe w aplikacji

## 8. Testing Strategy

### 8.1 Testy Jednostkowe
- **Frontend:** React Testing Library + Vitest
- **Backend:** Vitest z `@cloudflare/vitest-pool-workers`
- **Coverage:** Minimum 80% dla logiki biznesowej

### 8.2 Testy Integracyjne
- **API endpoints** z lokalną bazą D1
- **Database migrations** i seed data
- **Authentication flow**

### 8.3 Testy E2E
- **Playwright** dla krytycznych user flows
- **Środowisko staging** jako target
- **CI/CD integration** z fail-fast approach

## 9. Performance Requirements

### 9.1 Frontend
- **First Contentful Paint:** < 1.5s
- **Largest Contentful Paint:** < 2.5s
- **Cumulative Layout Shift:** < 0.1
- **Bundle size:** < 500KB (gzipped)

### 9.2 Backend
- **API Response Time:** < 200ms (95th percentile)
- **Database Queries:** < 50ms average
- **Concurrent Users:** 100+ bez degradacji
- **Uptime:** 99.9%

## 10. Migracje i Wersjonowanie

### 10.1 Database Migrations
```bash
# Struktura migrations/
migrations/
├── 0001_initial_schema.sql
├── 0002_seed_data.sql
├── 0003_add_companies_table.sql
├── 0004_add_relations_table.sql
└── 0005_add_activities_indexes.sql
```

### 10.2 API Versioning
- **URL-based versioning:** `/api/v1/`, `/api/v2/`
- **Backward compatibility:** Minimum 6 miesięcy
- **Deprecation notices** w response headers

### 10.3 Frontend Versioning
- **Semantic versioning** (semver)
- **Feature flags** dla postupnego rollout
- **Rollback strategy** w przypadku problemów
