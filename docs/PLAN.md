# Plan Implementacji - Mentoring CRM MVP

**Wersja:** 2.0  
**Data:** 2025-08-10  
**Typ:** Plan działania dla AI Agent

## 1. Analiza Obecnego Stanu Kodu

### 1.1 Struktura Projektu ✅
```
mentoring-crm/
├── functions/api/[[path]].ts    # Backend API (Hono)
├── migrations/                  # Migracje bazy danych
│   ├── 0001_initial_schema.sql
│   └── 0002_seed_data.sql
├── scripts/                     # Skrypty pomocnicze
│   ├── dev.sh
│   └── db-migrate.sh
├── src/                         # Frontend React
│   ├── components/
│   │   ├── Dashboard.tsx
│   │   ├── Layout.tsx
│   │   └── ui/
│   ├── hooks/useApi.ts
│   ├── types/api.ts
│   └── App.tsx
├── package.json
├── wrangler.toml
└── vite.config.ts
```

### 1.2 Co Już Działa ✅
- **Backend API (Hono):**
  - `/api/dashboard/stats` - podstawowe statystyki
  - `/api/dashboard/monthly-growth` - dane wzrostu miesięcznego
  - `/api/dashboard/status-distribution` - rozkład statusów
  - `/api/dashboard/recent-activities` - ostatnie aktywności
  - `/api/health` - health check
  - Auth middleware z Bearer token (`demo-token`)
  - CORS skonfigurowany

- **Frontend (React + TypeScript):**
  - Dashboard z wykresami (Recharts)
  - Layout z sidebar navigation
  - Dark mode support
  - Tailwind CSS + shadcn/ui komponenty
  - useApi hook do API calls

- **Baza Danych (D1):**
  - Tabela `contacts` (type: mentor/mentee/supporter)
  - Tabela `organizations` (organizacje partnerskie)
  - Tabela `activities` (notatki i zadania)
  - Migracje i seed data

- **DevOps:**
  - Wrangler konfiguracja
  - Scripts dla dev i migracji
  - Vite build system
  - TypeScript konfiguracja

### 1.3 Co Wymaga Implementacji 🔄

#### Backend API - Brakujące Endpointy:
- ❌ CRUD dla kontaktów per typ (mentorzy, mentees, supporterzy)
- ❌ CRUD dla firm partnerskich
- ❌ CRUD dla organizacji partnerskich (rozszerzenie)
- ❌ Zarządzanie relacjami mentor-mentee
- ❌ Publiczne API dla formularzy
- ❌ Rate limiting

#### Frontend - Brakujące Komponenty:
- ❌ Strony per typ kontaktów (/mentors, /mentees, /supporters)
- ❌ Strona firm partnerskich (/partner-companies)
- ❌ Strona organizacji partnerskich (/partner-organizations)
- ❌ Formularze CRUD
- ❌ Zarządzanie relacjami
- ❌ React Router
- ❌ Publiczne formularze

#### Baza Danych - Brakujące Tabele:
- ❌ `partner_companies` (firmy partnerskie)
- ❌ `mentor_mentee_relations` (relacje wiele-do-wielu)
- ❌ Rozszerzenie `contacts` o `company_id`

### 1.4 Kluczowe Obserwacje
1. **Solidna podstawa:** Architektura jest dobrze zaprojektowana
2. **Brak routingu:** App.tsx renderuje tylko Dashboard
3. **Placeholder nawigacja:** Sidebar ma niedziałające linki
4. **Dobra separacja:** Backend/Frontend dobrze oddzielone
5. **Gotowe narzędzia:** useApi hook, TypeScript typy, UI komponenty

## 2. Plan Implementacji (MVP-First Approach)

### ETAP 1: Rozszerzenie Bazy Danych
**Cel:** Przygotowanie bazy pod wszystkie funkcje

#### 1.1 Nowe Migracje
```sql
-- 0003_add_partner_companies.sql
CREATE TABLE partner_companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    industry TEXT,
    size TEXT CHECK (size IN ('startup', 'small', 'medium', 'large', 'enterprise')),
    contact_person TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    website TEXT,
    cooperation_type TEXT, -- JSON: ['sponsorship', 'jobs', 'expertise']
    status TEXT NOT NULL DEFAULT 'new_lead',
    summary_comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 0004_add_mentor_mentee_relations.sql
CREATE TABLE mentor_mentee_relations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mentor_id INTEGER NOT NULL REFERENCES contacts(id),
    mentee_id INTEGER NOT NULL REFERENCES contacts(id),
    status TEXT NOT NULL DEFAULT 'zapytanie' CHECK (status IN ('zapytanie', 'aktualna', 'archiwalna')),
    start_date DATE,
    end_date DATE,
    goals TEXT, -- JSON array
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 0005_extend_contacts.sql
ALTER TABLE contacts ADD COLUMN company_id INTEGER REFERENCES partner_companies(id);
```

#### 1.2 Seed Data
- Przykładowe firmy partnerskie
- Przykładowe relacje mentor-mentee
- Powiązania kontaktów z firmami

#### 1.3 TypeScript Typy
```typescript
// src/types/entities.ts
interface PartnerCompany {
  id: number;
  name: string;
  industry?: string;
  // ...
}

interface MentorMenteeRelation {
  id: number;
  mentor_id: number;
  mentee_id: number;
  status: 'zapytanie' | 'aktualna' | 'archiwalna';
  // ...
}
```

**Rezultat:** Baza danych gotowa na wszystkie funkcje MVP

### ETAP 2: React Router i Podstawowa Nawigacja
**Cel:** Działająca nawigacja między sekcjami

#### 2.1 Instalacja React Router
```bash
npm install react-router-dom
```

#### 2.2 Routing Setup
```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const App = () => (
  <BrowserRouter>
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/mentors" element={<Mentors />} />
        <Route path="/mentees" element={<Mentees />} />
        <Route path="/supporters" element={<Supporters />} />
        <Route path="/partner-companies" element={<PartnerCompanies />} />
        <Route path="/partner-organizations" element={<PartnerOrganizations />} />
      </Routes>
    </Layout>
  </BrowserRouter>
);
```

#### 2.3 Aktualizacja Layout.tsx
- Zamiana placeholder linków na React Router Links
- Aktywne stany nawigacji
- Nowe menu items dla wszystkich 5 typów

#### 2.4 Placeholder Komponenty
- Podstawowe komponenty dla każdej strony
- Loading states
- "Coming soon" messages

**Rezultat:** Działająca nawigacja między wszystkimi sekcjami

### ETAP 3: Dashboard Enhancement
**Cel:** Dashboard z pełnym wglądem na wszystkie typy

#### 3.1 Backend - Rozszerzenie API Stats
```typescript
// Rozszerzenie /api/dashboard/stats
interface DashboardStats {
  // Obecne
  totalContacts: number;
  organizations: number;
  activeTasks: number;
  conversionRate: string;
  
  // Nowe
  totalPartnerCompanies: number;
  activeRelations: number;
  pendingRelations: number;
  
  // Breakdown per typ
  mentorsCount: { active: number, new_lead: number, total: number };
  menteesCount: { active: number, new_lead: number, matched: number, total: number };
  supportersCount: { active: number, new_lead: number, total: number };
  partnerCompaniesCount: { active: number, new_lead: number, total: number };
  partnerOrganizationsCount: { active: number, new_lead: number, total: number };
}
```

#### 3.2 Frontend - Nowe Sekcje Dashboard
- Refaktoryzacja Dashboard.tsx
- Nowe karty per typ podmiotu
- Widget relacji mentor-mentee
- Pipeline konwersji per typ
- Responsywny layout

#### 3.3 Testy
- Testy API endpoints
- Testy komponentów Dashboard

**Rezultat:** Dashboard z pełnym wglądem biznesowym na wszystkie typy

### ETAP 4: CRUD dla Kontaktów - Mentorzy
**Cel:** Pełne zarządzanie mentorami jako pierwszy typ

#### 4.1 Backend API - Mentorzy
```typescript
// functions/api/[[path]].ts
app.get('/api/contacts/mentors', authMiddleware, async (c) => {
  // Lista mentorów z filtrowaniem, paginacją, wyszukiwaniem
});

app.post('/api/contacts/mentors', authMiddleware, async (c) => {
  // Tworzenie nowego mentora
});

app.get('/api/contacts/mentors/:id', authMiddleware, async (c) => {
  // Szczegóły mentora z relacjami
});

app.put('/api/contacts/mentors/:id', authMiddleware, async (c) => {
  // Aktualizacja mentora
});

app.delete('/api/contacts/mentors/:id', authMiddleware, async (c) => {
  // Usunięcie mentora
});
```

#### 4.2 Frontend - Komponenty Mentorów
```typescript
// src/components/mentors/
- MentorsList.tsx      // Lista z filtrowaniem i wyszukiwaniem
- MentorDetail.tsx     // Szczegóły mentora
- MentorForm.tsx       // Formularz dodawania/edycji
- MentorCard.tsx       // Karta mentora na liście
- MentorFilters.tsx    // Filtry (status, specjalizacja, etc.)
```

#### 4.3 Strona Mentorów
- `/mentors` - główna strona z listą
- `/mentors/:id` - szczegóły mentora
- `/mentors/new` - dodawanie nowego mentora

**Rezultat:** Pełny CRUD dla mentorów z działającym UI

### ETAP 5: CRUD dla Kontaktów - Mentees
**Cel:** Pełne zarządzanie mentees z focus na dopasowanie

#### 5.1 Backend API - Mentees
- Podobne endpointy jak dla mentorów
- Dodatkowa logika dla statusu dopasowania
- Query dla mentees bez mentora

#### 5.2 Frontend - Komponenty Mentees
- Podobna struktura jak mentorzy
- Dodatkowe pola: cele rozwojowe, preferowany mentor
- Widget statusu dopasowania
- Lista dostępnych mentorów

#### 5.3 Integracja z Dashboard
- Aktualizacja statystyk mentees
- Widget "Mentees czekający na dopasowanie"

**Rezultat:** Pełny CRUD dla mentees z systemem dopasowania

### ETAP 6: Relacje Mentor-Mentee
**Cel:** Działające zarządzanie relacjami

#### 6.1 Backend API - Relacje
```typescript
app.get('/api/contacts/:id/relations', authMiddleware, async (c) => {
  // Relacje dla danego kontaktu (mentor lub mentee)
});

app.post('/api/contacts/:id/relations', authMiddleware, async (c) => {
  // Dodanie nowej relacji
});

app.put('/api/relations/:id', authMiddleware, async (c) => {
  // Zmiana statusu relacji
});

app.delete('/api/relations/:id', authMiddleware, async (c) => {
  // Usunięcie relacji
});
```

#### 6.2 Frontend - Zarządzanie Relacjami
```typescript
// src/components/relations/
- RelationsManager.tsx    // Główny komponent w szczegółach kontaktu
- AddRelationModal.tsx    // Modal dodawania relacji
- RelationCard.tsx        // Karta pojedynczej relacji
- RelationStatusBadge.tsx // Badge statusu
```

#### 6.3 Integracja z Kontaktami
- Dodanie sekcji relacji do MentorDetail i MenteeDetail
- Aktualizacja dashboard o statystyki relacji

**Rezultat:** Pełne zarządzanie relacjami mentor-mentee

### ETAP 7: Supporterzy i Firmy Partnerskie
**Cel:** Pozostałe typy podmiotów

#### 7.1 CRUD Supporterzy
- Backend API podobny do mentorów
- Frontend komponenty
- Specyficzne pola: typ wsparcia, obszary ekspertyzy

#### 7.2 CRUD Firmy Partnerskie
- Backend API dla partner_companies
- Frontend komponenty
- Powiązania z kontaktami (dropdown w formularzach)

#### 7.3 Aktualizacja Organizacji Partnerskich
- Rozszerzenie istniejącego CRUD
- Nowy frontend z pełną funkcjonalnością

**Rezultat:** Wszystkie 5 typów podmiotów z pełnym CRUD

### ETAP 8: Publiczne Formularze
**Cel:** Automatyzacja pozyskiwania zgłoszeń

#### 8.1 Backend - Publiczne API
```typescript
app.post('/api/public/apply/mentor', rateLimitMiddleware, async (c) => {
  // Zgłoszenie mentora bez auth
});

app.post('/api/public/apply/mentee', rateLimitMiddleware, async (c) => {
  // Zgłoszenie mentee bez auth
});

app.post('/api/public/apply/supporter', rateLimitMiddleware, async (c) => {
  // Zgłoszenie supportera bez auth
});
```

#### 8.2 Rate Limiting i Bezpieczeństwo
- Middleware rate limiting (10 req/min per IP)
- CORS dla zaufanych domen
- Walidacja danych (Zod schemas)
- Sanityzacja inputów

#### 8.3 JavaScript Widget
```javascript
// public/form-widget.js
window.MentoringForms = {
  createMentorForm: (containerId, options) => { /* ... */ },
  createMenteeForm: (containerId, options) => { /* ... */ },
  createSupporterForm: (containerId, options) => { /* ... */ }
};
```

**Rezultat:** Działające publiczne formularze do osadzania

### ETAP 9: Finalizacja i Testy
**Cel:** Stabilny, przetestowany MVP

#### 9.1 Testy
- Unit testy dla API endpoints
- Integration testy
- Frontend testy komponentów
- E2E testy kluczowych flow

#### 9.2 Bug Fixes i Optymalizacja
- Naprawa znalezionych błędów
- Optymalizacja wydajności
- UX improvements

#### 9.3 Dokumentacja
- Aktualizacja README.md
- Dokumentacja API
- Instrukcje użycia widget

**Rezultat:** Gotowy MVP do wdrożenia

## 3. Kryteria Akceptacji MVP

### 3.1 Funkcjonalne ✅
- [ ] Dashboard pokazuje statystyki dla wszystkich 5 typów
- [ ] Pełny CRUD dla mentorów, mentees, supporterów
- [ ] Pełny CRUD dla firm partnerskich, organizacji partnerskich
- [ ] Zarządzanie relacjami mentor-mentee z statusami
- [ ] Publiczne formularze działają na zewnętrznych stronach
- [ ] Rate limiting chroni przed atakami

### 3.2 Techniczne ✅
- [ ] Wszystkie migracje działają bez błędów
- [ ] API endpoints zwracają poprawne kody odpowiedzi
- [ ] Frontend jest responsywny na wszystkich urządzeniach
- [ ] Brak błędów TypeScript i ESLint
- [ ] Podstawowe testy przechodzą (coverage > 70%)

### 3.3 UX/UI ✅
- [ ] Nawigacja między typami jest intuicyjna
- [ ] Formularze mają walidację i error handling
- [ ] Loading states są widoczne podczas API calls
- [ ] Dark mode działa poprawnie we wszystkich komponentach
- [ ] Responsive design na mobile/tablet/desktop

## 4. Ryzyka i Mitygacja

### 4.1 Czasowe (Wysokie ryzyko)
**Problem:** 7-10 dni może być za mało  
**Mitygacja:** 
- MVP-first approach - każdy etap dostarcza wartość
- Możliwość wdrożenia częściowego (np. tylko mentorzy + dashboard)
- Buffer 2-3 dni na nieprzewidziane problemy

### 4.2 Złożoność Relacji (Średnie ryzyko)
**Problem:** Relacje wiele-do-wielu mogą być skomplikowane  
**Mitygacja:**
- Zacząć od prostej implementacji
- Iteracyjne rozwijanie funkcji
- Dobre testy integracyjne

### 4.3 Performance (Niskie ryzyko)
**Problem:** Dashboard może być wolny z dużą ilością danych  
**Mitygacja:**
- Optymalizacja zapytań SQL (JOINs, indeksy)
- Paginacja w listach
- Cache'owanie wyników API

### 4.4 Bezpieczeństwo (Średnie ryzyko)
**Problem:** Publiczne API może być celem ataków  
**Mitygacja:**
- Rate limiting od początku
- Walidacja wszystkich inputów
- CORS tylko dla zaufanych domen
- Monitoring i logi

## 5. Post-MVP (Kolejne iteracje)

### 5.1 Priorytet 1 (Tydzień 2)
- Automatyczne dopasowywanie mentor-mentee (ML/algorytm)
- Email notifications dla zmian statusu
- Bulk operations (import/export CSV)
- Advanced search i filtry

### 5.2 Priorytet 2 (Tydzień 3-4)
- Analytics i raporty (wykresy, trendy)
- Integracje zewnętrzne (kalendarz, email)
- Mobile app (React Native/PWA)
- User roles i permissions

### 5.3 Priorytet 3 (Miesiąc 2)
- API dla partnerów zewnętrznych
- Advanced CRM features (pipeline, forecasting)
- Integracja z CRM zewnętrznymi
- White-label rozwiązanie

## 6. Definicja "Done"

### 6.1 Kod
- [ ] Wszystkie funkcje działają zgodnie z PRD
- [ ] Kod przechodzi linting (ESLint) i formatting (Prettier)
- [ ] Brak błędów TypeScript
- [ ] Testy napisane i przechodzą (min. 70% coverage)
- [ ] Code review completed

### 6.2 Deployment
- [ ] Migracje zastosowane w dev/staging/prod
- [ ] Aplikacja działa lokalnie (`npm run dev`)
- [ ] Build przechodzi bez błędów (`npm run build`)
- [ ] Deploy na staging successful
- [ ] Smoke tests na staging passed

### 6.3 Dokumentacja
- [ ] README.md zaktualizowany z instrukcjami
- [ ] API dokumentacja (komentarze w kodzie)
- [ ] Instrukcje użycia JavaScript widget
- [ ] User manual dla operatorów systemu

---

**Uwaga:** Ten plan zakłada pracę doświadczonego full-stack developera znającego React, TypeScript, i Cloudflare stack. Dla mniej doświadczonych osób timeline może być dłuższy o 50-100%.

**Kluczowa zasada:** Każdy etap dostarcza działającą, użyteczną funkcję. Można wdrażać częściowo i iterować na podstawie feedbacku użytkowników.

## Załącznik A: Proponowana struktura testów (dla AI)

Rekomendowana, lekka struktura katalogu testów ułatwiająca szybkie pokrycie krytycznych ścieżek:

```
tests/
  api/
    relations.test.ts
    public-forms.test.ts
  components/
    RelationsManager.test.tsx
    CompanyForm.test.tsx
  e2e/
    public-forms.e2e.test.ts
```

Wskazówki:
- Testy API: focus na kody odpowiedzi, walidacje Zod i poprawność zapisów w D1.
- Testy komponentów: render, interakcje, stany ładowania/błędów.
- E2E: ścieżka zgłoszenia z publicznego formularza do pojawienia się wpisu w systemie.
