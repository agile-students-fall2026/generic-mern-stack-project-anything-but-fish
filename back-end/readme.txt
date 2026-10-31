Backend setup (planned: Python + FastAPI + PyMongo)

.env contains local development defaults; .env.example is the committed template.
Copy .env.example to .env on a new checkout and configure MongoDB locally or use
an Atlas connection string. These files are configuration only: no backend server
or MongoDB connection has been implemented yet. Never put database credentials
in front-end environment files. The backend must load its .env explicitly.

Frontend authentication API contract (all paths start with /api/auth):
POST /register        { email, password } -> 201 { message }
POST /login           { email, password } -> 200 { user: { id, email } }
GET  /me                                 -> 200 { user: { id, email } }
POST /logout          {}                  -> 204
POST /forgot-password { email }          -> 200 { message }
POST /reset-password  { token, password } -> 200 { message }

Errors: { detail: "User-facing message" } with appropriate HTTP status.
/me returns 401 when there is no valid session. Login sets an HttpOnly session
cookie; logout clears it. The frontend sends cookies with credentials: include.
Use SameSite=Lax for same-site hosting, secure cookies in production, validate
Origin on mutations, and restrict CORS to FRONTEND_ORIGIN when cross-origin.
For production prefer serving /api from the same origin as the frontend.

Store users and server-side sessions in MONGODB_DB_NAME. Normalize email addresses
and enforce a unique index; hash passwords with a suitable password hashing
algorithm. Validate email and password (8-128 characters) on the server as well.
Never store plaintext passwords or return password hashes to the browser.

Password recovery uses an emailed link, not a verification-code step or CAPTCHA.
Return the same forgot-password response for existing and missing accounts.
Generate a random, expiring, single-use token, store only its hash, and email
PASSWORD_RESET_URL?token=... through a backend email provider (not configured yet).
Reset must validate and consume the token and invalidate existing sessions.
Rate-limit auth endpoints. Reject expired sessions and use MongoDB TTL indexes
for session and reset-token cleanup. The reset token must never be returned by
the forgot-password endpoint.
