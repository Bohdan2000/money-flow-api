# Money Flow (Backend)

Backend API for **Money Flow** — track income, expenses, and investments. Built with **NestJS** and **MongoDB** (monolith). A React Native mobile app will consume this API.

## Tech stack

- **Runtime:** Node.js  
- **Framework:** NestJS  
- **Database:** MongoDB (Mongoose)  
- **Auth:** JWT (access + refresh tokens), email/password, Google Sign-In (ID token)  
- **Validation:** class-validator / class-transformer  
- **Docs:** Swagger (OpenAPI)

## Features

- **Auth:** Register, login (email/password), Google login, refresh token, profile
- **Money flows:** Create first; groups (e.g. budget, investments) with name and description
- **Categories:** CRUD per money flow; create categories for a flow; type = income | expense | investment
- **Tags:** CRUD; user-scoped labels (e.g. "urgent", "reimbursable"); attach to transactions
- **Transactions:** CRUD; require categoryId (money flow via category); optional tagIds; filter by money flow, type, tag
- **Docker:** Dockerfile + docker-compose (app + MongoDB)

## Prerequisites

- Node.js 18+
- MongoDB (local or Docker)
- For Google Sign-In: Google OAuth 2.0 Client ID

## Setup

```bash
# Install dependencies
npm install

# Copy env and set values (see .env.example)
cp .env.example .env
# Edit .env: MONGODB_URI, JWT_SECRET, GOOGLE_CLIENT_ID (optional)
```

## Run

```bash
# Development (watch)
npm run start:dev

# Production build + run
npm run build
npm run start:prod
```

API: **http://localhost:3000**  
Swagger UI: **http://localhost:3000/api**

## Docker

```bash
# Build and run app + MongoDB
docker compose up --build
```

- App: port **3000**  
- MongoDB: port **27017**  
- Set `JWT_SECRET` and `GOOGLE_CLIENT_ID` in `.env` (or in `docker-compose` env).

## Scripts

| Command           | Description              |
|-------------------|--------------------------|
| `npm run start`   | Start app                |
| `npm run start:dev` | Start in watch mode    |
| `npm run build`   | Build for production     |
| `npm run start:prod` | Run production build  |
| `npm run lint`    | Run ESLint               |
| `npm run test`    | Unit tests               |
| `npm run test:e2e`| E2E tests                |

## API overview

| Area        | Endpoints |
|------------|-----------|
| **Auth**   | `POST /auth/register`, `POST /auth/login`, `POST /auth/google`, `POST /auth/refresh`, `GET /auth/profile` |
| **Money flows** | `GET/POST /money-flows`, `GET/PATCH/DELETE /money-flows/:id` (create first) |
| **Categories** | `GET/POST /categories` (body: `moneyFlowId`, list: `?moneyFlowId=` required), `GET/PATCH/DELETE /categories/:id` |
| **Tags** | `GET/POST /tags`, `GET/PATCH/DELETE /tags/:id` |
| **Transactions** | `GET/POST /transactions` (body: `categoryId`, optional `tagIds`; list: `?moneyFlowId=`, `?tagId=`, etc.), `GET/PATCH/DELETE /transactions/:id` |

Protected routes use **Bearer** token (`Authorization: Bearer <accessToken>`).  
See **[docs/API.md](docs/API.md)** for request/response details and **[docs/DATA_MODELS.md](docs/DATA_MODELS.md)** for entities and relations.

## Project structure

```
src/
├── auth/           # Auth, JWT, refresh token, Google
├── users/          # User schema and service
├── categories/     # Categories CRUD
├── money-flows/    # Money flow groups (e.g. budget, investments)
├── tags/           # Tags CRUD (labels for transactions)
├── transactions/   # Transactions CRUD (categoryId, optional tagIds; filter by tag)
├── common/         # Shared enums (e.g. TransactionType)
├── app.module.ts
└── main.ts
docs/
├── API.md          # API reference
└── DATA_MODELS.md  # Entities and relations
```

## License

UNLICENSED (see [package.json](package.json)).
