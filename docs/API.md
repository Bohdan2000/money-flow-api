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

Categories belong to a **money flow**. Create a money flow first, then categories for it.

- **POST /categories** – Create category for a money flow. Body: `{ "moneyFlowId", "name", "type": "income"|"expense"|"investment", "icon"?: "" }`
- **GET /categories** – List categories for a money flow. Query: **`?moneyFlowId=`** (required), `?type=expense` (optional)
- **GET /categories/:id** – Get one category
- **PATCH /categories/:id** – Update
- **DELETE /categories/:id** – Delete

---

## Money Flows (protected)

Groups for transactions (e.g. budget, investments).

- **POST /money-flows** – Create. Body: `{ "name", "description"?: "" }`
- **GET /money-flows** – List current user’s money flows
- **GET /money-flows/:id** – Get one
- **PATCH /money-flows/:id** – Update
- **DELETE /money-flows/:id** – Delete

---

## Tags (protected)

User-defined labels for transactions (e.g. "urgent", "reimbursable").

- **POST /tags** – Create. Body: `{ "name" }` (unique per user)
- **GET /tags** – List current user's tags
- **GET /tags/:id** – Get one
- **PATCH /tags/:id** – Update name
- **DELETE /tags/:id** – Delete

---

## Transactions (protected)

Create transactions **after** creating a money flow and its categories. Money flow is derived via category (transaction has no moneyFlowId field). Optional **tagIds** attach tags to a transaction.

- **POST /transactions** – Create. Body: `{ "amount", "currency", "date" (ISO), "description"?, "categoryId", "tagIds"?: ["id1", "id2"] }` (category must belong to user’s money flow; tag IDs must belong to user)
- **GET /transactions** – List. Query: `?from=...&to=...&moneyFlowId=...&type=...&tagId=...&limit=...&skip=...` (moneyFlowId filters by category’s flow; tagId filters by transactions that have this tag)
- **GET /transactions/:id** – Get one (returns categoryId, userId, tagIds as IDs)
- **PATCH /transactions/:id** – Update (including optional tagIds; replaces existing tags)
- **DELETE /transactions/:id** – Delete

---

## Validation

- Invalid body or query returns `400` with validation messages.
- Unauthorized (missing/invalid token) returns `401`.
- Not found returns `404`.
- Conflict (e.g. duplicate category) returns `409`.
