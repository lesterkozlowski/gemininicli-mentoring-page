# PRD — Mentoring CRM (Product Requirements Document)

**Wersja:** 2.0  
**Data:** 2025-08-10  
**Autor:** Zespół Mentoring CRM  
**Typ dokumentu:** Biznesowy

## 1. Wprowadzenie i Wizja Produktu

### 1.1 Problem Biznesowy
Program mentoringowy obecnie zarządzany jest za pomocą rozproszonych arkuszy kalkulacyjnych, notatek i prostych list. Brak centralnego systemu utrudnia:
- Śledzenie statusu uczestników w różnych fazach programu
- Dopasowywanie mentorów do mentees
- Monitorowanie efektywności i KPI programu
- Zarządzanie relacjami z partnerami biznesowymi
- Pozyskiwanie nowych uczestników przez formularze zewnętrzne

### 1.2 Wizja Rozwiązania
CRM dla programu mentoringowego zapewniający pełny wgląd biznesowy w stan programu z perspektywy pięciu kluczowych typów podmiotów:

1. **Mentorzy** - doświadczeni profesjonaliści dzielący się wiedzą
2. **Mentees (Podopieczni)** - osoby rozwijające swoje umiejętności
3. **Supporterzy (Wspierający)** - osoby wspierające program (inwestorzy, eksperci)
4. **Organizacje partnerskie** - fundacje, stowarzyszenia i NGO współpracujące
5. **Firmy partnerskie** - przedsiębiorstwa wspierające program

**Kluczowa zasada:** "Kontakt" jest jedynie wewnętrzną abstrakcją techniczną. W warstwie biznesowej i UX operujemy wyłącznie konkretnymi typami podmiotów.

## 2. Cele Biznesowe i Metryki Sukcesu

### 2.1 Cele Główne
- **Centralizacja:** Jedno miejsce do zarządzania wszystkimi typami uczestników
- **Automatyzacja:** Zautomatyzowanie procesu pozyskiwania zgłoszeń
- **Wgląd biznesowy:** Dashboardy i KPI per typ uczestnika
- **Efektywność operacyjna:** Usprawnienie pracy zespołu zarządzającego programem

### 2.2 Metryki Sukcesu
- Liczba aktywnych mentorów, mentees, supporterów
- Współczynnik konwersji ze zgłoszenia do aktywnego uczestnictwa
- Liczba aktywnych relacji mentor-mentee
- Liczba firm i NGO współpracujących
- Czas obsługi nowego zgłoszenia
- Zadowolenie operatorów systemu (NPS)

## 3. Typy Podmiotów i Ich Charakterystyka

### 3.1 Mentorzy
**Definicja:** Doświadczeni profesjonaliści oferujący mentoring młodszym kolegom.

**Kluczowe atrybuty:**
- Specjalizacja/branża
- Lata doświadczenia
- Dostępność czasowa
- Preferowane formy mentoringu (1:1, grupowe, online/offline)
- Historia mentoringu

**Statusy w procesie:**
- Nowe zgłoszenie → Weryfikacja → Aktywny mentor → Nieaktywny → Zakończona współpraca

**KPI specyficzne:**
- Liczba aktywnych mentees pod opieką
- Średni czas trwania relacji mentoringowych
- Oceny od mentees

### 3.2 Mentees (Podopieczni)
**Definicja:** Osoby poszukujące mentora do rozwoju zawodowego lub biznesowego.

**Kluczowe atrybuty:**
- Obszar rozwoju/branża zainteresowania
- Poziom doświadczenia
- Cele rozwojowe
- Preferowany profil mentora
- Status projektu/startupu (jeśli dotyczy)

**Statusy w procesie:**
- Nowe zgłoszenie → Kwalifikacja → Dopasowanie mentora → Aktywna relacja → Zakończona relacja

**KPI specyficzne:**
- Czas do dopasowania mentora
- Sukces w osiągnięciu celów rozwojowych
- Retention rate w programie

### 3.3 Supporterzy (Wspierający)
**Definicja:** Osoby wspierające program poprzez wiedzę ekspercką, finansowanie lub networking.

**Kluczowe atrybuty:**
- Typ wsparcia (finansowe, eksperckie, networkingowe)
- Obszary ekspertyzy
- Budżet/zakres wsparcia
- Preferencje zaangażowania

**Statusy w procesie:**
- Nowe zgłoszenie → Kwalifikacja → Aktywny supporter → Nieaktywny

**KPI specyficzne:**
- Wartość wniesionego wsparcia
- Liczba wspartych projektów/osób
- Częstotliwość zaangażowania

### 3.4 Organizacje Partnerskie (NGO)
**Definicja:** Fundacje, stowarzyszenia i organizacje non-profit współpracujące przy realizacji programu.

**Kluczowe atrybuty:**
- Typ organizacji
- Obszar działalności
- Zakres współpracy
- Osoba kontaktowa
- Historia współpracy

**Statusy w procesie:**
- Nowy kontakt → Negocjacje → Aktywna współpraca → Współpraca zawieszona → Zakończona współpraca

### 3.5 Firmy Partnerskie
**Definicja:** Przedsiębiorstwa wspierające program poprzez sponsoring, miejsca pracy, ekspertyzę lub inne zasoby.

**Kluczowe atrybuty:**
- Branża/sektor
- Wielkość firmy
- Typ współpracy (sponsoring, miejsca pracy, ekspertyza)
- Budżet współpracy
- Osoba kontaktowa

**Relacje z innymi typami:**
- Firma może mieć przypisanych mentorów (pracownicy firmy)
- Firma może oferować miejsca pracy dla mentees
- Firma może mieć przypisanych supporterów (eksperci z firmy)

## 4. Relacje Między Typami

### 4.1 Relacja Mentor-Mentee (wiele do wielu)
- Jeden mentor może mieć wielu mentees
- Jeden mentee może mieć wielu mentorów (w różnych obszarach)
- Relacja ma swoje atrybuty: data rozpoczęcia, status, cele, notatki

### 4.2 Relacje z Firmami
- Mentorzy mogą być pracownikami firm partnerskich
- Mentees mogą otrzymać oferty pracy z firm partnerskich  
- Supporterzy mogą reprezentować firmy partnerskie
- NGO pozostają niezależne od firm

### 4.3 Relacje z NGO
- NGO mogą polecać mentorów i mentees
- NGO mogą organizować wydarzenia dla uczestników programu
- NGO mogą otrzymywać wsparcie od supporterów

## 5. Funkcjonalności Systemu

### 5.1 Pozyskiwanie Uczestników
**Publiczne formularze zgłoszeniowe:**
- Dedykowane formularze dla każdego typu (mentor, mentee, supporter)
- Możliwość osadzenia na zewnętrznych stronach (widget JavaScript)
- Automatyczne utworzenie rekordu w systemie ze statusem "Nowe zgłoszenie"

### 5.2 Zarządzanie Uczestnikami
**Dla każdego typu osobno:**
- Lista z filtrowaniem i wyszukiwaniem
- Widok szczegółowy z pełnym profilem
- Zarządzanie statusem w procesie
- Historia zmian statusu

### 5.3 Zarządzanie Relacjami
- **Dopasowywanie mentor-mentee:** System sugestii na podstawie kryteriów
- **Zarządzanie relacjami:** Śledzenie aktywnych par, historii współpracy
- **Powiązania z firmami:** Przypisywanie uczestników do firm partnerskich

### 5.4 System Notatek i Zadań
- Notatki przypisane do konkretnych osób/organizacji/firm
- Zadania z terminami i statusem wykonania
- Historia wszystkich interakcji

### 5.5 Dashboardy i Raporty
**Dashboard główny:**
- Przegląd KPI dla wszystkich typów
- Aktywne relacje mentor-mentee
- Najnowsze aktywności w systemie

**Dashboardy per typ:**
- Mentorzy: liczba aktywnych, dostępnych, statystyki relacji
- Mentees: liczba w kolejce, dopasowanych, zakończonych programów
- Supporterzy: wartość wsparcia, aktywność
- NGO: liczba aktywnych partnerstw, wydarzenia
- Firmy: liczba współpracujących pracowników, oferowane pozycje

## 6. Wymagania Techniczne (High-Level)

### 6.1 Architektura
- **Frontend:** Nowoczesny SPA (React/Vue) z responsywnym UI
- **Backend:** API-first approach z RESTful endpoints
- **Baza danych:** Relacyjna baza z obsługą złożonych relacji
- **Hosting:** Cloud-native rozwiązanie z auto-skalowaniem

### 6.2 Integracje
- **Formularze zewnętrzne:** JavaScript widget do osadzania
- **Email:** Automatyczne powiadomienia o zmianach statusu
- **Kalendarz:** Integracja z popularnymi systemami kalendarzowymi
- **Eksport danych:** CSV/Excel dla raportów

### 6.3 Bezpieczeństwo i Prywatność
- Szyfrowanie danych osobowych
- Kontrola dostępu oparta na rolach
- Audit log wszystkich operacji
- Zgodność z RODO

## 7. Roadmapa Rozwoju

### Faza 1 (MVP) - 4 tygodnie
- Podstawowe CRUD dla wszystkich typów
- Publiczne formularze zgłoszeniowe
- Prosty dashboard z podstawowymi KPI
- System notatek

### Faza 2 - 6 tygodni
- Zarządzanie relacjami mentor-mentee
- Powiązania z firmami partnerskimi
- Zaawansowane filtry i wyszukiwanie
- System zadań z terminami

### Faza 3 - 8 tygodni
- Automatyczne dopasowywanie mentor-mentee
- Zaawansowane dashboardy i raporty
- Integracje zewnętrzne (email, kalendarz)
- System powiadomień

### Faza 4 - Dalszy rozwój
- Mobile app
- Advanced analytics i ML
- Integracje z CRM zewnętrznymi
- API dla partnerów

## 8. Kryteria Akceptacji

### 8.1 Funkcjonalne
- [ ] Wszystkie typy podmiotów mają dedykowane karty i formularze
- [ ] Relacje mentor-mentee są w pełni zarządzalne
- [ ] Publiczne formularze działają na zewnętrznych stronach
- [ ] Dashboard pokazuje aktualne KPI dla wszystkich typów
- [ ] System notatek i zadań jest w pełni funkcjonalny

### 8.2 Niefunkcjonalne
- [ ] Czas ładowania strony < 2 sekundy
- [ ] System obsługuje 1000+ rekordów bez spadku wydajności
- [ ] UI jest responsywne na wszystkich urządzeniach
- [ ] Dostępność systemu > 99.5%

## 9. Ryzyka i Mitygacja

| Ryzyko | Prawdopodobieństwo | Wpływ | Mitygacja |
|--------|-------------------|-------|-----------|
| Złożoność relacji mentor-mentee | Średnie | Wysokie | Iteracyjne podejście, MVP z prostymi relacjami |
| Wydajność z dużą liczbą rekordów | Niskie | Średnie | Optymalizacja bazy danych, indeksy |
| Integracja z zewnętrznymi systemami | Średnie | Średnie | API-first design, standardowe protokoły |
| Adopcja przez użytkowników | Średnie | Wysokie | UX research, iteracyjny design |

## 10. Załączniki

- **Załącznik A:** Mockupy interfejsu użytkownika
- **Załącznik B:** Specyfikacja techniczna API
- **Załącznik C:** Model danych
- **Załącznik D:** Plan testów
