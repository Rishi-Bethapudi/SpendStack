# SpendStack Architecture

## 1. Overview

SpendStack is a cross-platform personal finance application designed to help users record, understand, and improve their financial habits.

The project consists of:

- A feature-rich web application
- A lightweight mobile application
- A shared TypeScript/domain layer
- A shared validation layer
- Shared utility functions
- A Supabase backend
- A PostgreSQL database
- Authentication and authorization
- Analytics and financial insights

The architecture is designed to allow the Web and Mobile applications to evolve independently at the UI level while sharing the same business concepts and validation rules.

---

## 2. Architecture Goals

SpendStack should be:

1. Maintainable
2. Type-safe
3. Secure
4. Scalable
5. Easy to test
6. Easy to deploy
7. Friendly for learning and experimentation
8. Consistent across Web and Mobile
9. Structured enough to resemble a real production application
10. Simple enough to avoid unnecessary over-engineering

---

## 3. High-Level Architecture

```text
                         SpendStack
                              |
               +--------------+--------------+
               |                             |
             Web                           Mobile
          Next.js                         Expo
               |                             |
               +-------------+---------------+
                             |
                      Shared Packages
                             |
              +--------------+--------------+
              |              |              |
            Types        Validation       Utils
              |              |              |
              +--------------+--------------+
                             |
                         Supabase
                             |
              +--------------+--------------+
              |                             |
           Supabase Auth                PostgreSQL
              |                             |
              +-----------------------------+