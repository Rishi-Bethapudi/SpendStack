
---

# 🗺️ `docs/roadmap.md`

```md
# SpendStack Roadmap

## Project Vision

SpendStack is a cross-platform personal finance application that helps users:

1. Record financial activity
2. Understand spending
3. Manage budgets
4. Track financial goals
5. Build better financial habits

---

# Phase 0 — Foundation

Status: In Progress

## Repository

- [x] Initialize Git repository
- [x] Configure pnpm
- [x] Configure workspace
- [x] Configure Turborepo
- [ ] Rename project to SpendStack
- [ ] Create shared packages
- [ ] Create documentation
- [ ] Create `.env.example`
- [ ] Finalize root `.gitignore`
- [ ] Verify typecheck
- [ ] Verify build
- [ ] Commit clean foundation
- [ ] Push to GitHub

## Web

- [x] Create Next.js application
- [x] Configure TypeScript
- [x] Configure Tailwind
- [ ] Add shadcn/ui when UI implementation begins
- [x] Verify development server
- [x] Verify production build
- [ ] Verify workspace typecheck

## Mobile

- [x] Create Expo application
- [x] Configure Expo Router
- [x] Configure TypeScript
- [x] Verify development server
- [x] Add typecheck script
- [ ] Verify workspace typecheck

---

# Phase 1 — Backend & Authentication

Status: Planned

## Supabase

- [ ] Create Supabase project
- [ ] Configure environment variables
- [ ] Understand Supabase architecture
- [ ] Configure local development strategy
- [ ] Connect Web
- [ ] Connect Mobile

## Database

- [ ] Create profiles table
- [ ] Create accounts table
- [ ] Create categories table
- [ ] Create transactions table
- [ ] Add foreign keys
- [ ] Add constraints
- [ ] Add indexes
- [ ] Create migrations

## Security

- [ ] Understand Row Level Security
- [ ] Enable RLS
- [ ] Create SELECT policies
- [ ] Create INSERT policies
- [ ] Create UPDATE policies
- [ ] Create DELETE policies
- [ ] Test cross-user isolation

## Authentication

- [ ] Sign up
- [ ] Sign in
- [ ] Sign out
- [ ] Session persistence
- [ ] Protected routes
- [ ] Password reset
- [ ] Profile

---

# Phase 2 — Core Financial Features

Status: Planned

## Accounts

- [ ] Create account
- [ ] Edit account
- [ ] Archive account
- [ ] View account balance
- [ ] Account transaction history

## Categories

- [ ] Default categories
- [ ] Create category
- [ ] Edit category
- [ ] Archive category
- [ ] Income categories
- [ ] Expense categories

## Transactions

- [ ] Create expense
- [ ] Create income
- [ ] Edit transaction
- [ ] Delete transaction
- [ ] Transaction list
- [ ] Transaction details
- [ ] Search
- [ ] Filter
- [ ] Date filtering

## Shared Domain

- [ ] Transaction types
- [ ] Account types
- [ ] Category types
- [ ] Shared validation schemas
- [ ] Shared financial utilities

---

# Phase 3 — Web Dashboard

Status: Planned

## Dashboard

- [ ] Total income
- [ ] Total expenses
- [ ] Net balance
- [ ] Recent transactions
- [ ] Spending summary
- [ ] Account summary

## UI

- [ ] Responsive layout
- [ ] Navigation
- [ ] Sidebar
- [ ] Mobile navigation
- [ ] Empty states
- [ ] Loading states
- [ ] Error states
- [ ] Toast feedback

---

# Phase 4 — Analytics

Status: Planned

## Charts

- [ ] Monthly spending chart
- [ ] Income vs expense chart
- [ ] Category breakdown
- [ ] Spending trend
- [ ] Account distribution

## Insights

- [ ] Highest spending category
- [ ] Month-over-month comparison
- [ ] Average daily spending
- [ ] Spending trend detection
- [ ] Unusual spending detection

---

# Phase 5 — Budgets

Status: Planned

- [ ] Budget database model
- [ ] Create budget
- [ ] Edit budget
- [ ] Delete/archive budget
- [ ] Category budgets
- [ ] Budget progress
- [ ] Budget warnings
- [ ] Budget analytics

---

# Phase 6 — Recurring Transactions

Status: Planned

- [ ] Recurring transaction model
- [ ] Frequency rules
- [ ] Next occurrence
- [ ] Create recurring transaction
- [ ] Edit recurring transaction
- [ ] Pause recurring transaction
- [ ] Automatic transaction generation
- [ ] Reminder notifications

---

# Phase 7 — Financial Goals

Status: Planned

- [ ] Goal model
- [ ] Create goal
- [ ] Edit goal
- [ ] Progress tracking
- [ ] Target date
- [ ] Goal analytics

---

# Phase 8 — Mobile Application

Status: Planned

## Core

- [ ] Authentication
- [ ] Dashboard
- [ ] Quick add transaction
- [ ] Recent transactions
- [ ] Categories
- [ ] Accounts
- [ ] Budget overview

## Mobile UX

- [ ] Bottom navigation
- [ ] Quick action button
- [ ] Native-friendly forms
- [ ] Gesture-friendly interactions
- [ ] Loading states
- [ ] Offline-aware UI

---

# Phase 9 — Offline Support

Status: Future

- [ ] Local persistence
- [ ] Offline transaction creation
- [ ] Sync queue
- [ ] Retry mechanism
- [ ] Conflict strategy
- [ ] Sync status UI

Offline functionality should only be implemented after the online architecture is stable.

---

# Phase 10 — Notifications

Status: Future

- [ ] Push notification setup
- [ ] Budget alerts
- [ ] Recurring payment reminders
- [ ] Goal reminders
- [ ] Spending insights

---

# Phase 11 — Import & Export

Status: Future

- [ ] CSV export
- [ ] Excel-compatible export
- [ ] PDF reports
- [ ] CSV import
- [ ] Import validation
- [ ] Duplicate detection

---

# Phase 12 — Advanced Features

Status: Future

Potential features:

- [ ] Multi-currency
- [ ] Attach receipts
- [ ] Advanced reports
- [ ] Saved filters
- [ ] Custom dashboards
- [ ] Financial health score
- [ ] Subscription tracking
- [ ] Shared/family finances
- [ ] Bank integrations

These features are intentionally not committed to the initial product scope.

---

# Phase 13 — Quality

Status: Ongoing

## Testing

- [ ] Unit tests
- [ ] Validation tests
- [ ] Business logic tests
- [ ] Integration tests
- [ ] Web end-to-end tests
- [ ] Mobile testing

## Quality

- [ ] Error handling
- [ ] Accessibility
- [ ] Performance optimization
- [ ] Security review
- [ ] Database query optimization
- [ ] Loading state consistency
- [ ] Empty state consistency

---

# Phase 14 — Deployment

Status: Future

## Web

- [ ] Production environment
- [ ] Environment variables
- [ ] Vercel deployment
- [ ] Domain
- [ ] Production monitoring

## Mobile

- [ ] EAS configuration
- [ ] Android build
- [ ] iOS build
- [ ] App icons
- [ ] Splash screen
- [ ] Store metadata
- [ ] Production release

---

# Definition of Done

A feature is not considered complete merely because it works locally.

A feature should generally have:

- [ ] Type-safe implementation
- [ ] Validation
- [ ] Error handling
- [ ] Loading state
- [ ] Empty state where relevant
- [ ] Responsive UI where relevant
- [ ] Security considerations
- [ ] Appropriate tests
- [ ] Documentation when architecture changes

---

# Development Philosophy

SpendStack follows:

```text
Learn
   ↓
Understand
   ↓
Build
   ↓
Break
   ↓
Debug
   ↓
Improve