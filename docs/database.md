
---

# 📗 `docs/database.md`

This one is especially important because we're about to enter the Supabase phase.

```md
# SpendStack Database Design

## 1. Database Overview

SpendStack uses PostgreSQL through Supabase.

The database is responsible for storing:

- User profiles
- Financial accounts
- Transaction categories
- Financial transactions
- Budgets
- Recurring transactions
- Financial goals

The database should be designed around data integrity, security, and clear relationships.

---

# 2. Core Data Model

Initial relationship:

```text
Authenticated User
       |
       v
    Profile
       |
       +----------------+
       |       |        |
       v       v        v
   Accounts Categories Transactions
                              |
                    +---------+---------+
                    |         |         |
                    v         v         v
                 Account   Category   Future Rules