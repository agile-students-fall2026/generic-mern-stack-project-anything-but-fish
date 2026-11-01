Run from the front-end directory:
  npm install
  cp .env.example .env
  npm run dev

Build:
  npm run build

Auth pages use native HTML form controls with no CSS framework or custom styles.
Login/register forms include validation, loading states, and server errors.
Main Screen and game routes are temporarily open for frontend development.
Use "Continue without logging in" on Welcome, or open /starting directly.
Auth pages still call the backend API; /api/auth/me checks for an existing session
on refresh. Credentials are not persisted in browser storage.
Password recovery uses an emailed reset link; there is no verification-code step.

VITE_API_BASE_URL is public configuration and defaults to /api.
API_PROXY_TARGET defaults to http://127.0.0.1:8000 for the development proxy.
Restart Vite after changing .env. In production configure a reverse proxy for
/api, or set VITE_API_BASE_URL and configure backend CORS/cookies appropriately.
Never place MongoDB credentials or other secrets in VITE_* variables.

The backend is not implemented yet. Auth requests will show an error until the
backend endpoints documented in ../back-end/readme.txt are available. Account
creation and reset confirmation are reached after successful API responses.
The story reader at /game loads src/content/story/ancient-gold-coin.json.
The draft contains 19 pages: 14 dialogue pages and 5 archive pages.
See src/content/story/README.md for the JSON format, block types, and artwork paths.
The current page is in the URL; saving progress is not implemented yet.
Story and character selection both open the same /inventory page. Back returns
to the screen that opened it, including the exact story page. Inventory is
currently a placeholder; collecting and storing items is not implemented yet.
The other game screens are navigation placeholders.
