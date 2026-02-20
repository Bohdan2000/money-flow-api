# Money Flow – Data Models & Relations

Backend: NestJS (monolith) · Database: MongoDB

---

## Entity Relationship Overview

**Flow: User → creates MoneyFlow → then Categories for that flow → then Transactions (with category from that flow).**

```
                    ┌───────────────┐
                    │  MoneyFlow    │
        User ──1:N─▶│  (group)      │──1:N──▶ Category
                    └───────────────┘
                            │
                            │ Transaction → Category → MoneyFlow
                            ▼
                    ┌───────────────┐
                    │  Transaction  │──N:1──▶ Category (money flow via category)
                    └───────────────┘
```

- **User** has many **MoneyFlows** (e.g. “Monthly budget”, “Investments only”).
- **MoneyFlow** has many **Categories**. Categories are scoped to a money flow.
- **Category** belongs to one **MoneyFlow** (name, type, icon).
- **Transaction** belongs to one **User** and one **Category**. The money flow is derived via **Category.moneyFlowId** (no direct moneyFlowId on transaction).
- **Tag** belongs to one **User** (name). **Transaction** has an array of tag IDs (`tagIds`); many-to-many between Transaction and Tag.

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

Categories for grouping transactions within a **money flow** (e.g. “Food”, “Salary”). Created **after** a money flow; each category belongs to one money flow.

| Field        | Type     | Required | Notes                                |
|-------------|----------|----------|--------------------------------------|
| `_id`       | ObjectId | ✓        | MongoDB default                      |
| `name`      | string   | ✓        | e.g. "Food", "Salary"                |
| `type`      | enum     | ✓        | `income` \| `expense` \| `investment` |
| `icon`      | string   | —        | Optional icon identifier for UI      |
| `moneyFlowId` | ObjectId | ✓      | Ref MoneyFlow (owner flow)           |
| `createdAt` | Date     | ✓        |                                      |
| `updatedAt` | Date     | ✓        |                                      |

**Constraints**

- Compound unique index on `(name, type, moneyFlowId)` so the same name can exist for different types or flows.

**Relations**

- **MoneyFlow** → **Category**: one-to-many (categories are created for a money flow).

---

## 3. MoneyFlow

A named group for transactions (e.g. “Monthly budget”, “Investments only”). User-scoped.

| Field        | Type     | Required | Notes                |
|-------------|----------|----------|----------------------|
| `_id`       | ObjectId | ✓        | MongoDB default      |
| `name`      | string   | ✓        | e.g. "Monthly budget"|
| `description` | string | —        | Optional             |
| `userId`    | ObjectId | ✓        | Ref User (owner)     |
| `createdAt` | Date     | ✓        |                      |
| `updatedAt` | Date     | ✓        |                      |

**Relations**

- **User** → **MoneyFlow**: one-to-many.
- **MoneyFlow** → **Category**: one-to-many (user creates categories for this flow).
- Transaction is linked to MoneyFlow only **via Category** (transaction has no moneyFlowId field).

---

## 4. Transaction

A single income, expense, or investment record. **Type is not stored on the transaction**; it is derived from the linked category (`category.type`).

| Field        | Type     | Required | Notes                                      |
|-------------|----------|----------|--------------------------------------------|
| `_id`       | ObjectId | ✓        | MongoDB default                             |
| `amount`    | number   | ✓        | Positive.                                 |
| `currency`  | string   | ✓        | ISO 4217 (e.g. USD, EUR, UAH)               |
| `date`      | Date     | ✓        | When the transaction occurred               |
| `description` | string | —        | Optional note                               |
| `categoryId`| ObjectId | ✓        | Ref Category (type and money flow via category) |
| `userId`    | ObjectId | ✓        | Ref User (owner)                            |
| `tagIds`    | ObjectId[] | —     | Refs Tag (optional; default [])            |
| `createdAt`| Date     | ✓        |                                            |
| `updatedAt`| Date     | ✓        |                                            |

**Constraints**

- `amount` > 0.
- `categoryId` must reference a Category (money flow is derived via category).
- `userId` must reference an existing User.
- Each element of `tagIds` must reference a Tag owned by the same user.

**Relations**

- **User** → **Transaction**: one-to-many (user has many transactions).
- **Category** → **Transaction**: one-to-many. Money flow is **via category** (Transaction has no moneyFlowId).
- **Transaction** ↔ **Tag**: many-to-many via `Transaction.tagIds` (array of Tag refs).

---

## 5. Tag

User-defined labels for transactions (e.g. "urgent", "reimbursable"). User-scoped.

| Field      | Type     | Required | Notes                |
|-----------|----------|----------|----------------------|
| `_id`     | ObjectId | ✓        | MongoDB default      |
| `name`    | string   | ✓        | e.g. "urgent"        |
| `userId`  | ObjectId | ✓        | Ref User (owner)     |
| `createdAt` | Date   | ✓        |                      |
| `updatedAt` | Date   | ✓        |                      |

**Constraints**

- Unique per user: one tag name per user (compound unique index on `(userId, name)`).

**Relations**

- **User** → **Tag**: one-to-many.
- **Tag** ↔ **Transaction**: many-to-many (transactions have `tagIds` array).

---

## Enums (shared)

- **TransactionType / CategoryType**: `income` | `expense` | `investment`

---

## Summary of relations

| From       | To           | Relation   | Foreign key   |
|-----------|--------------|------------|---------------|
| User      | Transaction  | 1 : N      | `Transaction.userId` → `User._id` |
| User      | MoneyFlow    | 1 : N      | `MoneyFlow.userId` → `User._id`   |
| User      | Tag          | 1 : N      | `Tag.userId` → `User._id`         |
| MoneyFlow | Category     | 1 : N      | `Category.moneyFlowId` → `MoneyFlow._id`   |
| Category  | Transaction  | 1 : N      | `Transaction.categoryId` → `Category._id` (money flow via category) |
| Tag       | Transaction  | N : M      | `Transaction.tagIds[]` → `Tag._id`        |

---

## Indexes (recommended)

- **users**: `email` (unique), `googleId` (unique, sparse).
- **categories**: `(name, type, moneyFlowId)` (unique), `moneyFlowId`, `type`.
- **money-flows**: `userId`.
- **transactions**: `userId`, `categoryId`, `tagIds`, `date`, `(userId, date)`.
- **tags**: `(userId, name)` (unique), `userId`.

---

After the BE is in place, the React Native app will consume these APIs.
