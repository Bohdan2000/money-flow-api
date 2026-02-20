# Money Flow – API Reference

Base URL: `http://localhost:3000` (or `PORT` from env).

All request/response bodies are JSON. Protected routes require header: `Authorization: Bearer <accessToken>`.

---

## Auth (no token required)

### POST /auth/register

Create account with email and password.

**Body:** `{ "email": "user@example.com", "password": "min8chars", "name": "Optional Name" }`

**Response:** `{ "accessToken": "...", "user": { "id", "email", "name" } }`

---

### POST /auth/login

Login with email and password.

**Body:** `{ "email": "user@example.com", "password": "..." }`

**Response:** `{ "accessToken": "...", "user": { "id", "email", "name" } }`

---

### POST /auth/google

Login or register with Google (mobile sends ID token from Google Sign-In).

**Body:** `{ "idToken": "<google-id-token>" }`

**Response:** `{ "accessToken": "...", "user": { "id", "email", "name" } }`

---

### GET /auth/profile (protected)

Current user profile.

**Response:** `{ "id", "email", "name" }`

---

## Categories (protected)

- **POST /categories** – Create category. Body: `{ "name", "type": "income"|"expense"|"investment", "icon"?: "" }`
- **GET /categories** – List user + system categories. Query: `?type=expense` (optional)
- **GET /categories/:id** – Get one category
- **PATCH /categories/:id** – Update (user categories only)
- **DELETE /categories/:id** – Delete (user categories only)

---

## Transactions (protected)

- **POST /transactions** – Create. Body: `{ "amount", "currency", "date" (ISO), "description"?, "type", "categoryId" }`
- **GET /transactions** – List. Query: `?from=...&to=...&limit=...&skip=...` (optional)
- **GET /transactions/:id** – Get one (with category populated)
- **PATCH /transactions/:id** – Update
- **DELETE /transactions/:id** – Delete

---

## Validation

- Invalid body or query returns `400` with validation messages.
- Unauthorized (missing/invalid token) returns `401`.
- Not found returns `404`.
- Conflict (e.g. duplicate category) returns `409`.
