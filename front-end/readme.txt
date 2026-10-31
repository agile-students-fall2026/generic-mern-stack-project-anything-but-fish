Run from the front-end directory:
  npm install
  cp .env.example .env
  npm run dev

Build:
  npm run build

Auth pages use Bootstrap's default CSS, without custom styles or JavaScript.
Login/register forms include validation, loading states, and server errors.
Game routes require a server-validated session. Refresh restores the session
through /api/auth/me; credentials are not persisted in browser storage.
Password recovery uses an emailed reset link; there is no verification-code step.

VITE_API_BASE_URL is public configuration and defaults to /api.
API_PROXY_TARGET defaults to http://127.0.0.1:8000 for the development proxy.
Restart Vite after changing .env. In production configure a reverse proxy for
/api, or set VITE_API_BASE_URL and configure backend CORS/cookies appropriately.
Never place MongoDB credentials or other secrets in VITE_* variables.

The backend is not implemented yet. Auth requests will show an error until the
backend endpoints documented in ../back-end/readme.txt are available. Account
creation and reset confirmation appear only after successful API responses.
The remaining game pages are navigation placeholders.
