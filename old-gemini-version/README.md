
# Mentoring Dashboard

Elegancki panel do zarządzania projektem mentoringu biznesowego dla chrześcijańskich przedsiębiorców.

## Funkcjonalności

- **Dashboard:** Szybki przegląd kluczowych metryk projektu.
- **Zarządzanie Aplikacjami:** Pełny CRUD (Create, Read, Update, Delete) dla mentorów, mentee i wspierających.
- **Przenośne Formularze:** Łatwe do osadzenia formularze aplikacyjne na dowolnej zewnętrznej stronie internetowej.

## Uruchomienie Lokalnie

1.  **Zainstaluj zależności:**
    ```bash
    npm install
    ```

2.  **Uruchom serwer deweloperski:**
    ```bash
    npm run dev
    ```
    - Aplikacja będzie dostępna pod adresem `http://localhost:5173`.
    - Backend (API) będzie dostępny pod adresem `http://localhost:8788`.

## Jak Osadzić Formularze Aplikacyjne

Aby osadzić formularze na zewnętrznej stronie, użyj poniższego kodu `<iframe>`, podmieniając `<URL_TWOJEJ_APLIKACJI>` na docelowy adres URL wdrożonej aplikacji.

### Formularz dla Mentora

```html
<iframe src="<URL_TWOJEJ_APLIKACJI>/form/mentor" width="100%" height="500px" frameborder="0"></iframe>
```

### Formularz dla Mentee

```html
<iframe src="<URL_TWOJEJ_APLIKACJI>/form/mentee" width="100%" height="500px" frameborder="0"></iframe>
```

### Formularz dla Wspierającego

```html
<iframe src="<URL_TWOJEJ_APLIKACJI>/form/supporter" width="100%" height="500px" frameborder="0"></iframe>
```

## Kontrybucja

1. Sklonuj repozytorium
2. Utwórz nowy branch: `git checkout -b feature/nazwa-funkcjonalnosci`
3. Zatwierdź zmiany: `git commit -m 'Dodano nową funkcjonalność'`
4. Wypchnij zmiany: `git push origin feature/nazwa-funkcjonalnosci`
5. Otwórz Pull Request

## Licencja

Ten projekt jest dostępny na licencji MIT. Więcej szczegółów znajduje się w pliku [LICENSE](LICENSE).
