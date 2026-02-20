# Money Flow – Data Models & Relations

Backend: NestJS (monolith) · Database: MongoDB

---

## Entity Relationship Overview

```
┌─────────────┐      1:N        ┌───────────────┐
│    User     │────────────────▶│  Transaction  │
└─────────────┘                 └───────┬───────┘
       │                                │
       │ 1:N                            │ N:1
       ▼                                ▼
┌─────────────┐                 ┌───────────────┐
│  Category   │◀────────────────│  (categoryId) │
└─────────────┘                 └───────────────┘
```

- **User** has many **Transactions** and many **Categories** (user-specific).
- **Transaction** belongs to one **User** and one **Category**.
- **Category** can be system-wide (`userId = null`) or user-specific (`userId` set).

---

## 1. User

Authentication and profile. Supports email/password and Google login.

| Field      | Type     | Required | Notes                                      |
|-----------|----------|----------|--------------------------------------------|
| `_id`     | ObjectId | ✓        | MongoDB default                             |
| `email`   | string   | ✓        | Unique. Used for email login.               |
| `password`| string   | —        | Hashed; null if user signs in only via Google. |
| `googleId`| string   | —        | Unique. Set when user signs in with Google. |
| `name`    | string   | —        | Display name                                |
| `createdAt` | Date   | ✓        |                                            |
| `updatedAt` | Date   | ✓        |                                            |

**Constraints**

- At least one of `password` or `googleId` must be set (enforced in app logic).
- Unique index on `email`.
- Unique index on `googleId` (sparse, so nulls are ignored).

---

## 2. Category

Categories for grouping transactions (e.g. “Food”, “Salary”, “Stocks”). Can be system defaults or per-user.

| Field       | Type     | Required | Notes                                      |
|------------|----------|----------|--------------------------------------------|
| `_id`      | ObjectId | ✓        | MongoDB default                             |
| `name`     | string   | ✓        | e.g. "Food", "Salary"                       |
| `type`     | enum     | ✓        | `income` \| `expense` \| `investment`       |
| `icon`     | string   | —        | Optional icon identifier for UI              |
| `userId`   | ObjectId | —        | Ref User. `null` = system/default category  |
| `createdAt`| Date     | ✓        |                                            |
| `updatedAt`| Date     | ✓        |                                            |

**Constraints**

- Compound unique index on `(name, type, userId)` so the same name can exist for different types or users.

**Relations**

- **User** → **Category**: one-to-many (user has many categories; system categories have `userId = null`).

---

## 3. Transaction

A single income, expense, or investment record. **Type is not stored on the transaction**; it is derived from the linked category (`category.type`).

| Field        | Type     | Required | Notes                                      |
|-------------|----------|----------|--------------------------------------------|
| `_id`       | ObjectId | ✓        | MongoDB default                             |
| `amount`    | number   | ✓        | Positive.                                 |
| `currency`  | string   | ✓        | ISO 4217 (e.g. USD, EUR, UAH)               |
| `date`      | Date     | ✓        | When the transaction occurred               |
| `description` | string | —        | Optional note                               |
| `categoryId`| ObjectId | ✓        | Ref Category (type comes from category)    |
| `userId`    | ObjectId | ✓        | Ref User (owner)                            |
| `createdAt`| Date     | ✓        |                                            |
| `updatedAt`| Date     | ✓        |                                            |

**Constraints**

- `amount` > 0.
- `categoryId` must reference an existing Category.
- `userId` must reference an existing User.

**Relations**

- **User** → **Transaction**: one-to-many (user has many transactions).
- **Category** → **Transaction**: one-to-many (category has many transactions).

---

## Enums (shared)

- **TransactionType / CategoryType**: `income` | `expense` | `investment`

---

## Summary of relations

| From       | To           | Relation   | Foreign key   |
|-----------|--------------|------------|---------------|
| User      | Transaction  | 1 : N      | `Transaction.userId` → `User._id` |
| User      | Category     | 1 : N      | `Category.userId` → `User._id` (nullable)   |
| Category  | Transaction  | 1 : N      | `Transaction.categoryId` → `Category._id`  |

---

## Indexes (recommended)

- **users**: `email` (unique), `googleId` (unique, sparse).
- **categories**: `(name, type, userId)` (unique), `userId`, `type`.
- **transactions**: `userId`, `categoryId`, `date`, `(userId, date)` for listing by user and time.

---

## Next steps (backend)

1. Add Mongoose schemas for User, Category, Transaction.
2. Add NestJS modules: Users, Categories, Transactions (and Auth later).
3. Implement Auth (email + Google) and protect routes by `userId`.
4. Seed or migrate system categories (`userId = null`).

After the BE is in place, the React Native app will consume these APIs.
