# Rozszerzona Specyfikacja Funkcjonalna i Techniczna: CRM dla Programu Mentoringowego

## 1. Wprowadzenie i Wizja Produktu

Celem projektu jest stworzenie dedykowanego systemu CRM (Customer Relationship Management) do zarządzania relacjami i procesami w ramach programu mentoringowego. System ma zastąpić proste listy i arkusze kalkulacyjne, centralizując dane i automatyzując przepływ pracy.

Aplikacja będzie służyć jako centralny punkt do zarządzania czterema kluczowymi typami kontaktów: **Mentorami**, **Podopiecznymi (Mentees)**, **Wspierającymi (Supporters)** oraz **Organizacjami Partnerskimi (NGO)**.

Niniejszy dokument jest specyfikacją na poziomie funkcjonalnym i technicznym, przeznaczoną do stworzenia systemu od podstaw.

## 2. Kluczowe Wymagania Funkcjonalne

### A. Publiczne Formularze Zgłoszeniowe

System musi umożliwiać umieszczenie na dowolnej statycznej stronie internetowej formularzy zgłoszeniowych dla Mentorów, Mentees i Wspierających.

*   **Wymagania:**
    *   Formularze muszą być renderowane przez prosty skrypt JavaScript, który komunikuje się z publicznym, niezabezpieczonym endpointem API.
    *   Po pomyślnym przesłaniu formularza, w systemie CRM automatycznie tworzony jest nowy kontakt z domyślnym statusem "Nowe zgłoszenie" (`new_lead`).
    *   Należy zaimplementować podstawową walidację po stronie klienta i serwera (np. wymagane pola, format e-mail).

### B. Podstawowe Zarządzanie Kontaktami (CRUD)

Panel CRM musi umożliwiać pełne zarządzanie (Create, Read, Update, Delete) wszystkimi czterema typami kontaktów.

*   **Wymagania:**
    *   **Widok listy:** Przejrzysta, przeszukiwalna i filtrowalna tabela dla każdego typu kontaktu, wyświetlająca kluczowe informacje (imię/nazwa, e-mail, status, data dodania).
    *   **Widok szczegółowy kontaktu:** Dedykowany ekran dla każdego kontaktu, prezentujący wszystkie zebrane o nim informacje, w tym powiązane notatki i zadania.
    *   **Tworzenie/Edycja:** Intuicyjne formularze do ręcznego dodawania i edytowania kontaktów przez operatora systemu.

### C. Funkcjonalności CRM (Zarządzanie Relacjami)

To jest rdzeń systemu, który odróżnia go od prostej bazy danych.

*   **Statusy Kontaktów:** Każdy kontakt musi mieć przypisany status, który odzwierciedla jego pozycję w lejku processingowym (np. `Nowe zgłoszenie`, `Pierwszy kontakt`, `W procesie`, `Aktywny`, `Odrzucony`, `Zakończona współpraca`). Statusy powinny być łatwo modyfikowalne z poziomu listy i widoku szczegółowego.
*   **Notatki:** Operatorzy muszą mieć możliwość dodawania dowolnej liczby notatek do każdego typu kontaktu. Każda notatka powinna mieć autora i datę utworzenia.
*   **Następne Kroki (Zadania):** Możliwość zdefiniowania "następnego kroku" lub zadania do wykonania w kontekście danego kontaktu (np. "Zadzwonić do Jana Kowalskiego w przyszłym tygodniu"). Każde zadanie powinno mieć termin i status (do zrobienia/zrobione).
*   **Komentarz Podsumowujący:** Każdy kontakt powinien mieć jedno pole tekstowe na krótki, ogólny komentarz, który jest widoczny od razu na liście lub po najechaniu na kontakt. Służy do szybkiego przypomnienia sobie kluczowych informacji o kontakcie.

## 3. Specyfikacja Bazy Danych (Cloudflare D1)

Schemat musi być znormalizowany, aby wspierać relacje i funkcje CRM.

### Tabela: `contacts` (Nowa, zunifikowana tabela dla osób)

| Nazwa Kolumny       | Typ Danych | Ograniczenia                | Opis                                                    |
| :-------------------- | :--------- | :-------------------------- | :------------------------------------------------------ |
| `id`                  | `INTEGER`  | `PRIMARY KEY AUTOINCREMENT` | Unikalny identyfikator kontaktu.                        |
| `type`                | `TEXT`     | `NOT NULL`                  | Typ kontaktu: `mentor`, `mentee`, `supporter`.          |
| `name`                | `TEXT`     | `NOT NULL`                  | Imię i nazwisko.                                        |
| `email`               | `TEXT`     | `NOT NULL UNIQUE`           | Adres e-mail.                                           |
| `status`              | `TEXT`     | `NOT NULL`                  | Status w procesie (np. `new_lead`, `active`).           |
| `summary_comment`     | `TEXT`     |                             | Krótki komentarz "do szybkiego skojarzenia".            |
| `details`             | `TEXT`     |                             | Pole JSON do przechowywania specyficznych danych (np. specjalizacja mentora). |
| `created_at`          | `DATETIME` | `DEFAULT CURRENT_TIMESTAMP` | Data utworzenia.                                        |

### Tabela: `organizations`

| Nazwa Kolumny       | Typ Danych | Ograniczenia                | Opis                                                    |
| :-------------------- | :--------- | :-------------------------- | :------------------------------------------------------ |
| `id`                  | `INTEGER`  | `PRIMARY KEY AUTOINCREMENT` | Unikalny identyfikator organizacji.                     |
| `name`                | `TEXT`     | `NOT NULL`                  | Oficjalna nazwa organizacji.                            |
| `contact_person`      | `TEXT`     |                             | Osoba do kontaktu.                                      |
| `email`               | `TEXT`     | `UNIQUE`                    | Główny e-mail kontaktowy.                               |
| `status`              | `TEXT`     | `NOT NULL`                  | Status współpracy.                                      |
| `summary_comment`     | `TEXT`     |                             | Krótki komentarz.                                       |
| `created_at`          | `DATETIME` | `DEFAULT CURRENT_TIMESTAMP` | Data utworzenia.                                        |

### Tabela: `activities` (Notatki i Zadania)

| Nazwa Kolumny       | Typ Danych | Ograniczenia                | Opis                                                                 |
| :-------------------- | :--------- | :-------------------------- | :------------------------------------------------------------------- |
| `id`                  | `INTEGER`  | `PRIMARY KEY AUTOINCREMENT` | Unikalny identyfikator aktywności.                                   |
| `parent_type`         | `TEXT`     | `NOT NULL`                  | Typ powiązanego obiektu: `contact` lub `organization`.               |
| `parent_id`           | `INTEGER`  | `NOT NULL`                  | ID powiązanego kontaktu lub organizacji.                             |
| `activity_type`       | `TEXT`     | `NOT NULL`                  | Typ aktywności: `note` (notatka) lub `task` (zadanie).               |
| `content`             | `TEXT`     | `NOT NULL`                  | Treść notatki lub opis zadania.                                      |
| `due_date`            | `DATETIME` |                             | Termin wykonania (tylko dla `task`).                                 |
| `is_completed`        | `INTEGER`  | `DEFAULT 0`                 | Status zadania: 0 (do zrobienia), 1 (zrobione).                      |
| `created_by`          | `TEXT`     |                             | Identyfikator operatora, który utworzył wpis.                        |
| `created_at`          | `DATETIME` | `DEFAULT CURRENT_TIMESTAMP` | Data utworzenia.                                                     |

## 4. Specyfikacja API (Poziom Funkcjonalny)

API zostanie podzielone na dwie logiczne części:

### A. Publiczne API (bez uwierzytelniania)

*   **Cel:** Obsługa formularzy zgłoszeniowych.
*   **Endpointy:** `POST /api/public/apply/:type` (gdzie `type` to `mentor`, `mentee`, `supporter`).
*   **Zabezpieczenia:** Ograniczenie liczby zapytań (rate limiting), CORS skonfigurowany tylko dla zaufanych domen.

### B. Prywatne API CRM (wymaga uwierzytelniania)

*   **Cel:** Zasilanie danymi panelu administracyjnego.
*   **Uwierzytelnianie:** Każde zapytanie musi zawierać token (np. JWT) w nagłówku `Authorization`.
*   **Zakres Funkcjonalny:**
    *   Pełny CRUD dla `contacts` i `organizations`.
    *   Wyszukiwanie i filtrowanie dla `contacts` i `organizations`.
    *   Pełny CRUD dla `activities` powiązanych z danym kontaktem lub organizacją.
    *   Endpoint do zmiany samego statusu kontaktu/organizacji.
    *   Endpoint do logowania operatorów i wydawania tokenów.

## 5. Proces DevOps i Infrastruktura (Szczegółowo)

*   **Infrastruktura:** Całość oparta na ekosystemie Cloudflare.
    *   **Hosting Frontendu:** Cloudflare Pages.
    *   **Backend:** Cloudflare Workers.
    *   **Baza Danych:** Cloudflare D1.

*   **Środowiska:** Należy skonfigurować co najmniej trzy środowiska pracy:
    1.  **`development` (lokalne):** Uruchamiane za pomocą `wrangler pages dev`. Zapewnia hot-reloading dla frontendu i backendu. Baza D1 działa w trybie lokalnym.
    2.  **`staging` (przedprodukcyjne):** Osobny branch w Git (np. `staging` lub `develop`) połączony z osobnym projektem w Cloudflare Pages. Używa produkcyjnej, ale odizolowanej bazy danych (lub kopii) do testów E2E.
    3.  **`production` (produkcyjne):** Główny branch (np. `main`) połączony z produkcyjnym projektem Cloudflare Pages. Używa produkcyjnej bazy D1.
    *   Zarządzanie zmiennymi środowiskowymi (np. klucze API, nazwy baz danych) odbywa się za pomocą sekretów i zmiennych w `wrangler.toml` dla każdego środowiska.

*   **CI/CD (Ciągła Integracja i Wdrażanie):**
    *   **Trigger:** `git push` do brancha `staging` lub `main`.
    *   **Proces (obsługiwany przez Cloudflare Pages):**
        1.  **Build:** Uruchomienie komendy `npm run build` (lub podobnej).
        2.  **Test:** Uruchomienie testów jednostkowych i integracyjnych (`npm test`). Build zostanie przerwany w przypadku niepowodzenia testów.
        3.  **Deploy:** Jeśli testy przejdą pomyślnie, Wrangler automatycznie wdroży nową wersję Workera (backend) oraz statyczne zasoby frontendu na odpowiednie środowisko Cloudflare Pages.

*   **Strategia Testowania:**
    *   **Testy Jednostkowe (Unit Tests):** Testowanie pojedynczych funkcji i komponentów w izolacji (np. logika walidacji, czyste funkcje pomocnicze). Narzędzie: Vitest.
    *   **Testy Integracyjne (Integration Tests):** Testowanie endpointów API w połączeniu z lokalną bazą danych D1 w celu weryfikacji logiki biznesowej. Narzędzie: Vitest z `@cloudflare/vitest-pool-workers`.
    *   **Testy End-to-End (E2E):** Symulowanie interakcji użytkownika w przeglądarce na środowisku `staging`. Narzędzia: Playwright lub Cypress.

*   **Monitoring i Logowanie:**
    *   **Monitoring:** Wykorzystanie wbudowanego w Cloudflare dashboardu do monitorowania wydajności Workera (czas odpowiedzi, użycie CPU), liczby zapytań, błędów (HTTP 5xx) oraz statystyk zapytań do bazy D1.
    *   **Logowanie:** Implementacja strukturyzowanego logowania w backendzie. Logi powinny być dostępne w czasie rzeczywistym za pomocą komendy `wrangler tail` oraz w panelu Cloudflare.
