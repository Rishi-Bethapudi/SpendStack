-- ============================================================
-- SpendStack - Initial Database Schema
-- Migration: initial_spendstack_schema
--
-- Design principles:
--   1. auth.users is the identity source of truth.
--   2. Every application-owned row is scoped to a user.
--   3. RLS is enabled on every public application table.
--   4. Financial history is protected from accidental deletion.
--   5. Transactions are headers; transaction_entries are the
--      financial effects against accounts.
--   6. Balances are derived from opening balance + entries.
--   7. Monetary values use NUMERIC, never floating point.
--   8. Schema changes must happen through migrations.
-- ============================================================


-- ============================================================
-- 0. EXTENSIONS
-- ============================================================

create extension if not exists pgcrypto with schema extensions;


-- ============================================================
-- 1. PRIVATE SCHEMA
--
-- Internal helper functions live here so they are not exposed
-- through the Supabase Data API.
-- ============================================================

create schema if not exists private;


-- ============================================================
-- 2. COMMON FUNCTIONS
-- ============================================================

create or replace function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ============================================================
-- 3. PROFILES
--
-- One application profile per Supabase Auth user.
-- profiles.id == auth.users.id
-- ============================================================

create table public.profiles (
  id uuid primary key
    references auth.users(id)
    on delete cascade,

  display_name text,
  avatar_url text,

  default_currency char(3) not null default 'INR'
    check (default_currency ~ '^[A-Z]{3}$'),

  timezone text not null default 'Asia/Kolkata',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================================
-- 4. ACCOUNTS
--
-- Examples:
--   HDFC Bank
--   SBI Savings
--   Cash
--   HDFC Credit Card
--   Paytm Wallet
--
-- opening_balance is the initial signed balance.
--
-- Positive:
--   asset / money available
--
-- Negative:
--   liability / money owed
--
-- Current balance is DERIVED, not stored.
-- ============================================================

create table public.accounts (
  id uuid primary key default extensions.gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  name text not null
    check (length(trim(name)) > 0),

  account_type text not null
    check (
      account_type in (
        'cash',
        'bank',
        'credit_card',
        'debit_card',
        'savings',
        'investment',
        'wallet',
        'loan',
        'other'
      )
    ),

  currency char(3) not null
    check (currency ~ '^[A-Z]{3}$'),

  opening_balance numeric(20,4) not null default 0,

  opening_balance_date date not null default current_date,

  institution_name text,

  account_number_last4 char(4)
    check (
      account_number_last4 is null
      or account_number_last4 ~ '^[0-9]{4}$'
    ),

  notes text,

  is_active boolean not null default true,

  archived_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (id, user_id),

  unique (user_id, name)
);


-- ============================================================
-- 5. CATEGORIES
--
-- Supports unlimited parent/child hierarchy.
--
-- Example:
--
-- Food
--   Restaurants
--   Groceries
--   Delivery
--
-- Income
--   Salary
--   Freelance
--
-- category_type:
--   expense
--   income
--   both
-- ============================================================

create table public.categories (
  id uuid primary key default extensions.gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  parent_id uuid,

  name text not null
    check (length(trim(name)) > 0),

  category_type text not null
    check (
      category_type in (
        'expense',
        'income',
        'both'
      )
    ),

  icon text,

  color text,

  sort_order integer not null default 0,

  is_system boolean not null default false,

  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (id, user_id),

  constraint categories_parent_fk
    foreign key (parent_id, user_id)
    references public.categories(id, user_id)
    on delete restrict
);


-- Prevent duplicate category names within the same level.
create unique index categories_user_parent_name_idx
  on public.categories (
    user_id,
    coalesce(parent_id, '00000000-0000-0000-0000-000000000000'::uuid),
    lower(name)
  );


-- ============================================================
-- 6. MERCHANTS
-- ============================================================

create table public.merchants (
  id uuid primary key default extensions.gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  name text not null
    check (length(trim(name)) > 0),

  normalized_name text,

  logo_url text,

  notes text,

  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (id, user_id)
);


create unique index merchants_user_normalized_name_idx
  on public.merchants (user_id, lower(normalized_name))
  where normalized_name is not null;


-- ============================================================
-- 7. TRANSACTIONS
--
-- A transaction is the financial event/header.
--
-- The actual account effects live in transaction_entries.
--
-- Examples:
--
-- Expense:
--   Swiggy
--
-- Income:
--   Salary
--
-- Transfer:
--   HDFC Bank -> HDFC Credit Card
--
-- Refund:
--   Amazon refund
--
-- Adjustment:
--   Balance correction
-- ============================================================

create table public.transactions (
  id uuid primary key default extensions.gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  transaction_type text not null
    check (
      transaction_type in (
        'expense',
        'income',
        'transfer',
        'refund',
        'adjustment'
      )
    ),

  transaction_date timestamptz not null default now(),

  merchant_id uuid,

  description text,

  notes text,

  reference_number text,

  recurring_transaction_id uuid,

  -- Optional link for reversals/corrections.
  reversal_of_transaction_id uuid,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (id, user_id)
);


-- ============================================================
-- 8. TRANSACTION ENTRIES
--
-- This is the financial ledger layer.
--
-- entry_type:
--   debit
--   credit
--
-- amount:
--   original transaction amount
--
-- account_amount:
--   amount applied to the account's own currency
--
-- currency:
--   original transaction currency
--
-- account currency:
--   stored on accounts
--
-- This makes foreign-currency transactions possible without
-- losing the original transaction amount.
--
-- For normal same-currency transactions:
--
--   amount = account_amount
--
-- For FX transactions:
--
--   amount != account_amount
--
-- exchange_rate captures the applied rate.
-- ============================================================

create table public.transaction_entries (
  id uuid primary key default extensions.gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  transaction_id uuid not null,

  account_id uuid not null,

  category_id uuid,

  entry_type text not null
    check (
      entry_type in (
        'debit',
        'credit'
      )
    ),

  amount numeric(20,4) not null
    check (amount > 0),

  account_amount numeric(20,4) not null
    check (account_amount > 0),

  currency char(3) not null
    check (currency ~ '^[A-Z]{3}$'),

  exchange_rate numeric(20,10) not null default 1
    check (exchange_rate > 0),

  memo text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (id, user_id),

  constraint transaction_entries_transaction_fk
    foreign key (transaction_id, user_id)
    references public.transactions(id, user_id)
    on delete cascade,

  constraint transaction_entries_account_fk
    foreign key (account_id, user_id)
    references public.accounts(id, user_id)
    on delete restrict,

  constraint transaction_entries_category_fk
    foreign key (category_id, user_id)
    references public.categories(id, user_id)
    on delete restrict
);


-- ============================================================
-- 9. RECURRING TRANSACTIONS
--
-- This stores the recurring RULE/template.
--
-- Actual generated transactions are stored in transactions.
-- ============================================================

create table public.recurring_transactions (
  id uuid primary key default extensions.gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  name text not null
    check (length(trim(name)) > 0),

  transaction_type text not null
    check (
      transaction_type in (
        'expense',
        'income',
        'transfer'
      )
    ),

  frequency text not null
    check (
      frequency in (
        'daily',
        'weekly',
        'monthly',
        'yearly',
        'custom'
      )
    ),

  interval_count integer not null default 1
    check (interval_count > 0),

  start_date date not null,

  end_date date,

  next_occurrence_date date not null,

  last_generated_at timestamptz,

  is_active boolean not null default true,

  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (id, user_id),

  check (
    end_date is null
    or end_date >= start_date
  )
);


-- ============================================================
-- 10. RECURRING TRANSACTION ENTRIES
--
-- Mirrors transaction_entries for recurring templates.
-- ============================================================

create table public.recurring_transaction_entries (
  id uuid primary key default extensions.gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  recurring_transaction_id uuid not null,

  account_id uuid not null,

  category_id uuid,

  entry_type text not null
    check (
      entry_type in (
        'debit',
        'credit'
      )
    ),

  amount numeric(20,4) not null
    check (amount > 0),

  currency char(3) not null
    check (currency ~ '^[A-Z]{3}$'),

  memo text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (id, user_id),

  constraint recurring_entries_recurring_fk
    foreign key (recurring_transaction_id, user_id)
    references public.recurring_transactions(id, user_id)
    on delete cascade,

  constraint recurring_entries_account_fk
    foreign key (account_id, user_id)
    references public.accounts(id, user_id)
    on delete restrict,

  constraint recurring_entries_category_fk
    foreign key (category_id, user_id)
    references public.categories(id, user_id)
    on delete restrict
);


-- Link generated transaction back to recurring rule.
alter table public.transactions
  add constraint transactions_recurring_fk
  foreign key (recurring_transaction_id, user_id)
  references public.recurring_transactions(id, user_id)
  on delete set null;


-- Link reversal transaction safely.
alter table public.transactions
  add constraint transactions_reversal_fk
  foreign key (reversal_of_transaction_id, user_id)
  references public.transactions(id, user_id)
  on delete set null;


-- Link merchant safely.
alter table public.transactions
  add constraint transactions_merchant_fk
  foreign key (merchant_id, user_id)
  references public.merchants(id, user_id)
  on delete restrict;


-- ============================================================
-- 11. BUDGETS
-- ============================================================

create table public.budgets (
  id uuid primary key default extensions.gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  name text not null
    check (length(trim(name)) > 0),

  amount numeric(20,4) not null
    check (amount >= 0),

  currency char(3) not null
    check (currency ~ '^[A-Z]{3}$'),

  period_type text not null
    check (
      period_type in (
        'monthly',
        'yearly',
        'custom'
      )
    ),

  start_date date not null,

  end_date date not null,

  is_active boolean not null default true,

  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (id, user_id),

  check (end_date >= start_date)
);


-- ============================================================
-- 12. BUDGET CATEGORIES
--
-- Allows:
--
-- Overall budget: ₹30,000
--
-- Food:        ₹8,000
-- Transport:   ₹4,000
-- Shopping:    ₹6,000
-- etc.
-- ============================================================

create table public.budget_categories (
  id uuid primary key default extensions.gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  budget_id uuid not null,

  category_id uuid not null,

  amount numeric(20,4) not null
    check (amount >= 0),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (id, user_id),

  unique (budget_id, category_id),

  constraint budget_categories_budget_fk
    foreign key (budget_id, user_id)
    references public.budgets(id, user_id)
    on delete cascade,

  constraint budget_categories_category_fk
    foreign key (category_id, user_id)
    references public.categories(id, user_id)
    on delete restrict
);


-- ============================================================
-- 13. GOALS
-- ============================================================

create table public.goals (
  id uuid primary key default extensions.gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  name text not null
    check (length(trim(name)) > 0),

  target_amount numeric(20,4) not null
    check (target_amount > 0),

  currency char(3) not null
    check (currency ~ '^[A-Z]{3}$'),

  target_date date,

  status text not null default 'active'
    check (
      status in (
        'active',
        'paused',
        'completed',
        'archived'
      )
    ),

  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (id, user_id)
);


-- ============================================================
-- 14. GOAL CONTRIBUTIONS
--
-- Current goal progress is DERIVED from this table.
-- ============================================================

create table public.goal_contributions (
  id uuid primary key default extensions.gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  goal_id uuid not null,

  transaction_id uuid,

  amount numeric(20,4) not null
    check (amount > 0),

  contribution_date date not null default current_date,

  note text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (id, user_id),

  constraint goal_contributions_goal_fk
    foreign key (goal_id, user_id)
    references public.goals(id, user_id)
    on delete cascade,

  constraint goal_contributions_transaction_fk
    foreign key (transaction_id, user_id)
    references public.transactions(id, user_id)
    on delete set null
);


-- ============================================================
-- 15. TAGS
-- ============================================================

create table public.tags (
  id uuid primary key default extensions.gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  name text not null
    check (length(trim(name)) > 0),

  color text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (id, user_id)
);


create unique index tags_user_name_idx
  on public.tags (user_id, lower(name));


-- ============================================================
-- 16. TRANSACTION TAGS
-- ============================================================

create table public.transaction_tags (
  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  transaction_id uuid not null,

  tag_id uuid not null,

  created_at timestamptz not null default now(),

  primary key (transaction_id, tag_id),

  constraint transaction_tags_transaction_fk
    foreign key (transaction_id, user_id)
    references public.transactions(id, user_id)
    on delete cascade,

  constraint transaction_tags_tag_fk
    foreign key (tag_id, user_id)
    references public.tags(id, user_id)
    on delete cascade
);


-- ============================================================
-- 17. ATTACHMENTS
--
-- Files live in Supabase Storage.
-- This table stores metadata only.
-- ============================================================

create table public.attachments (
  id uuid primary key default extensions.gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  transaction_id uuid,

  transaction_entry_id uuid,

  storage_bucket text not null default 'transaction-attachments',

  storage_path text not null,

  file_name text not null,

  content_type text,

  file_size_bytes bigint
    check (
      file_size_bytes is null
      or file_size_bytes >= 0
    ),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (id, user_id),

  check (
    transaction_id is not null
    or transaction_entry_id is not null
  ),

  constraint attachments_transaction_fk
    foreign key (transaction_id, user_id)
    references public.transactions(id, user_id)
    on delete cascade,

  constraint attachments_entry_fk
    foreign key (transaction_entry_id, user_id)
    references public.transaction_entries(id, user_id)
    on delete cascade
);


-- ============================================================
-- 18. INDEXES
--
-- These support common queries and RLS filtering.
-- ============================================================

-- Accounts
create index accounts_user_id_idx
  on public.accounts(user_id);

create index accounts_user_active_idx
  on public.accounts(user_id, is_active);


-- Categories
create index categories_user_id_idx
  on public.categories(user_id);

create index categories_user_parent_idx
  on public.categories(user_id, parent_id);


-- Merchants
create index merchants_user_id_idx
  on public.merchants(user_id);


-- Transactions
create index transactions_user_id_idx
  on public.transactions(user_id);

create index transactions_user_date_idx
  on public.transactions(user_id, transaction_date desc);

create index transactions_user_type_date_idx
  on public.transactions(user_id, transaction_type, transaction_date desc);

create index transactions_user_merchant_idx
  on public.transactions(user_id, merchant_id);

create index transactions_user_recurring_idx
  on public.transactions(user_id, recurring_transaction_id);


-- Transaction entries
create index transaction_entries_user_id_idx
  on public.transaction_entries(user_id);

create index transaction_entries_transaction_idx
  on public.transaction_entries(transaction_id);

create index transaction_entries_user_account_idx
  on public.transaction_entries(user_id, account_id);

create index transaction_entries_user_category_idx
  on public.transaction_entries(user_id, category_id);


-- Recurring
create index recurring_transactions_user_id_idx
  on public.recurring_transactions(user_id);

create index recurring_transactions_due_idx
  on public.recurring_transactions(
    user_id,
    next_occurrence_date
  )
  where is_active = true;

create index recurring_entries_recurring_idx
  on public.recurring_transaction_entries(
    recurring_transaction_id
  );


-- Budgets
create index budgets_user_id_idx
  on public.budgets(user_id);

create index budgets_user_period_idx
  on public.budgets(
    user_id,
    start_date,
    end_date
  );

create index budget_categories_user_id_idx
  on public.budget_categories(user_id);


-- Goals
create index goals_user_id_idx
  on public.goals(user_id);

create index goal_contributions_user_goal_idx
  on public.goal_contributions(user_id, goal_id);

create index goal_contributions_user_date_idx
  on public.goal_contributions(
    user_id,
    contribution_date desc
  );


-- Tags
create index tags_user_id_idx
  on public.tags(user_id);

create index transaction_tags_user_id_idx
  on public.transaction_tags(user_id);

create index transaction_tags_tag_idx
  on public.transaction_tags(tag_id);


-- Attachments
create index attachments_user_id_idx
  on public.attachments(user_id);

create index attachments_transaction_idx
  on public.attachments(transaction_id);

create index attachments_entry_idx
  on public.attachments(transaction_entry_id);


-- ============================================================
-- 19. UPDATED_AT TRIGGERS
-- ============================================================

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function private.set_updated_at();


create trigger accounts_set_updated_at
before update on public.accounts
for each row
execute function private.set_updated_at();


create trigger categories_set_updated_at
before update on public.categories
for each row
execute function private.set_updated_at();


create trigger merchants_set_updated_at
before update on public.merchants
for each row
execute function private.set_updated_at();


create trigger transactions_set_updated_at
before update on public.transactions
for each row
execute function private.set_updated_at();


create trigger transaction_entries_set_updated_at
before update on public.transaction_entries
for each row
execute function private.set_updated_at();


create trigger recurring_transactions_set_updated_at
before update on public.recurring_transactions
for each row
execute function private.set_updated_at();


create trigger recurring_entries_set_updated_at
before update on public.recurring_transaction_entries
for each row
execute function private.set_updated_at();


create trigger budgets_set_updated_at
before update on public.budgets
for each row
execute function private.set_updated_at();


create trigger budget_categories_set_updated_at
before update on public.budget_categories
for each row
execute function private.set_updated_at();


create trigger goals_set_updated_at
before update on public.goals
for each row
execute function private.set_updated_at();


create trigger goal_contributions_set_updated_at
before update on public.goal_contributions
for each row
execute function private.set_updated_at();


create trigger tags_set_updated_at
before update on public.tags
for each row
execute function private.set_updated_at();


create trigger attachments_set_updated_at
before update on public.attachments
for each row
execute function private.set_updated_at();


-- ============================================================
-- 20. DEFAULT CATEGORY SEEDING
--
-- New users automatically receive a useful category tree.
-- Categories remain user-owned and editable.
-- ============================================================

create or replace function private.seed_default_categories(
  target_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  food_id uuid;
  transport_id uuid;
  shopping_id uuid;
  bills_id uuid;
  health_id uuid;
  entertainment_id uuid;
  education_id uuid;
  personal_id uuid;
  travel_id uuid;
  income_id uuid;
begin

  -- Expense parent categories
  insert into public.categories (
    user_id,
    name,
    category_type,
    is_system
  )
  values
    (target_user_id, 'Food', 'expense', true),
    (target_user_id, 'Transport', 'expense', true),
    (target_user_id, 'Shopping', 'expense', true),
    (target_user_id, 'Bills & Utilities', 'expense', true),
    (target_user_id, 'Health', 'expense', true),
    (target_user_id, 'Entertainment', 'expense', true),
    (target_user_id, 'Education', 'expense', true),
    (target_user_id, 'Personal Care', 'expense', true),
    (target_user_id, 'Travel', 'expense', true)
  on conflict do nothing;

  -- Income parent
  insert into public.categories (
    user_id,
    name,
    category_type,
    is_system
  )
  values (
    target_user_id,
    'Income',
    'income',
    true
  )
  on conflict do nothing;

  select id into food_id
  from public.categories
  where user_id = target_user_id
    and parent_id is null
    and name = 'Food'
  limit 1;

  select id into transport_id
  from public.categories
  where user_id = target_user_id
    and parent_id is null
    and name = 'Transport'
  limit 1;

  select id into shopping_id
  from public.categories
  where user_id = target_user_id
    and parent_id is null
    and name = 'Shopping'
  limit 1;

  select id into bills_id
  from public.categories
  where user_id = target_user_id
    and parent_id is null
    and name = 'Bills & Utilities'
  limit 1;

  select id into health_id
  from public.categories
  where user_id = target_user_id
    and parent_id is null
    and name = 'Health'
  limit 1;

  select id into entertainment_id
  from public.categories
  where user_id = target_user_id
    and parent_id is null
    and name = 'Entertainment'
  limit 1;

  select id into education_id
  from public.categories
  where user_id = target_user_id
    and parent_id is null
    and name = 'Education'
  limit 1;

  select id into personal_id
  from public.categories
  where user_id = target_user_id
    and parent_id is null
    and name = 'Personal Care'
  limit 1;

  select id into travel_id
  from public.categories
  where user_id = target_user_id
    and parent_id is null
    and name = 'Travel'
  limit 1;

  select id into income_id
  from public.categories
  where user_id = target_user_id
    and parent_id is null
    and name = 'Income'
  limit 1;


  -- Food
  insert into public.categories (
    user_id,
    parent_id,
    name,
    category_type,
    is_system
  )
  values
    (target_user_id, food_id, 'Restaurants', 'expense', true),
    (target_user_id, food_id, 'Groceries', 'expense', true),
    (target_user_id, food_id, 'Delivery', 'expense', true)
  on conflict do nothing;


  -- Transport
  insert into public.categories (
    user_id,
    parent_id,
    name,
    category_type,
    is_system
  )
  values
    (target_user_id, transport_id, 'Fuel', 'expense', true),
    (target_user_id, transport_id, 'Public Transport', 'expense', true),
    (target_user_id, transport_id, 'Taxi & Ride Share', 'expense', true)
  on conflict do nothing;


  -- Shopping
  insert into public.categories (
    user_id,
    parent_id,
    name,
    category_type,
    is_system
  )
  values
    (target_user_id, shopping_id, 'Clothing', 'expense', true),
    (target_user_id, shopping_id, 'Electronics', 'expense', true),
    (target_user_id, shopping_id, 'Home', 'expense', true)
  on conflict do nothing;


  -- Bills
  insert into public.categories (
    user_id,
    parent_id,
    name,
    category_type,
    is_system
  )
  values
    (target_user_id, bills_id, 'Rent', 'expense', true),
    (target_user_id, bills_id, 'Electricity', 'expense', true),
    (target_user_id, bills_id, 'Internet', 'expense', true),
    (target_user_id, bills_id, 'Mobile', 'expense', true)
  on conflict do nothing;


  -- Health
  insert into public.categories (
    user_id,
    parent_id,
    name,
    category_type,
    is_system
  )
  values
    (target_user_id, health_id, 'Medical', 'expense', true),
    (target_user_id, health_id, 'Pharmacy', 'expense', true)
  on conflict do nothing;


  -- Entertainment
  insert into public.categories (
    user_id,
    parent_id,
    name,
    category_type,
    is_system
  )
  values
    (target_user_id, entertainment_id, 'Movies', 'expense', true),
    (target_user_id, entertainment_id, 'Games', 'expense', true),
    (target_user_id, entertainment_id, 'Subscriptions', 'expense', true)
  on conflict do nothing;


  -- Education
  insert into public.categories (
    user_id,
    parent_id,
    name,
    category_type,
    is_system
  )
  values
    (target_user_id, education_id, 'Courses', 'expense', true),
    (target_user_id, education_id, 'Books', 'expense', true)
  on conflict do nothing;


  -- Personal care
  insert into public.categories (
    user_id,
    parent_id,
    name,
    category_type,
    is_system
  )
  values
    (target_user_id, personal_id, 'Salon', 'expense', true),
    (target_user_id, personal_id, 'Grooming', 'expense', true)
  on conflict do nothing;


  -- Travel
  insert into public.categories (
    user_id,
    parent_id,
    name,
    category_type,
    is_system
  )
  values
    (target_user_id, travel_id, 'Flights', 'expense', true),
    (target_user_id, travel_id, 'Hotels', 'expense', true),
    (target_user_id, travel_id, 'Activities', 'expense', true)
  on conflict do nothing;


  -- Income
  insert into public.categories (
    user_id,
    parent_id,
    name,
    category_type,
    is_system
  )
  values
    (target_user_id, income_id, 'Salary', 'income', true),
    (target_user_id, income_id, 'Freelance', 'income', true),
    (target_user_id, income_id, 'Interest', 'income', true),
    (target_user_id, income_id, 'Other Income', 'income', true)
  on conflict do nothing;

end;
$$;


-- ============================================================
-- 21. CREATE PROFILE WHEN AUTH USER IS CREATED
--
-- Supabase Auth owns auth.users.
-- SpendStack owns public.profiles.
--
-- The trigger bridges the two.
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin

  insert into public.profiles (
    id,
    display_name,
    avatar_url
  )
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'display_name',
      new.raw_user_meta_data ->> 'full_name'
    ),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  perform private.seed_default_categories(new.id);

  return new;
end;
$$;


create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();


-- ============================================================
-- 22. TRANSACTION INTEGRITY VALIDATION
--
-- We use a DEFERRED constraint trigger because a transaction
-- can legitimately require multiple entry rows.
--
-- Example:
--
--   INSERT transaction
--   INSERT debit
--   INSERT credit
--
-- The transaction is validated at COMMIT rather than after the
-- first entry.
-- ============================================================

create or replace function private.validate_transaction_entries(
  target_transaction_id uuid
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  tx_type text;
  entry_count integer;
  debit_count integer;
  credit_count integer;
  missing_category_count integer;
begin

  select transaction_type
  into tx_type
  from public.transactions
  where id = target_transaction_id;

  if tx_type is null then
    return;
  end if;


  select
    count(*),
    count(*) filter (where entry_type = 'debit'),
    count(*) filter (where entry_type = 'credit'),
    count(*) filter (
      where category_id is null
    )
  into
    entry_count,
    debit_count,
    credit_count,
    missing_category_count
  from public.transaction_entries
  where transaction_id = target_transaction_id;


  if entry_count = 0 then
    raise exception
      'Transaction % must contain at least one entry',
      target_transaction_id;
  end if;


  -- Expense:
  -- At least one debit and every entry must have a category.
  if tx_type = 'expense' then

    if debit_count = 0 or credit_count <> 0 then
      raise exception
        'Expense transaction % must contain debit entries only',
        target_transaction_id;
    end if;

    if missing_category_count > 0 then
      raise exception
        'Expense transaction % requires a category on every entry',
        target_transaction_id;
    end if;

  end if;


  -- Income:
  -- At least one credit and every entry must have a category.
  if tx_type = 'income' then

    if credit_count = 0 or debit_count <> 0 then
      raise exception
        'Income transaction % must contain credit entries only',
        target_transaction_id;
    end if;

    if missing_category_count > 0 then
      raise exception
        'Income transaction % requires a category on every entry',
        target_transaction_id;
    end if;

  end if;


  -- Refund:
  -- Refunds increase an account balance and therefore use credits.
  if tx_type = 'refund' then

    if credit_count = 0 or debit_count <> 0 then
      raise exception
        'Refund transaction % must contain credit entries only',
        target_transaction_id;
    end if;

    if missing_category_count > 0 then
      raise exception
        'Refund transaction % requires a category on every entry',
        target_transaction_id;
    end if;

  end if;


  -- Transfer:
  -- Exactly one debit and one credit.
  --
  -- Different currencies are allowed.
  if tx_type = 'transfer' then

    if entry_count <> 2
       or debit_count <> 1
       or credit_count <> 1 then

      raise exception
        'Transfer transaction % must contain exactly one debit and one credit',
        target_transaction_id;

    end if;

    if missing_category_count <> 2 then
      raise exception
        'Transfer transaction % cannot contain categories',
        target_transaction_id;
    end if;

  end if;


  -- Adjustment:
  -- Debit/credit combination is allowed.
  -- Category is optional.

end;
$$;


create or replace function private.validate_transaction_entries_trigger()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin

  if tg_op = 'DELETE' then
    perform private.validate_transaction_entries(old.transaction_id);
    return old;
  end if;

  perform private.validate_transaction_entries(new.transaction_id);

  if tg_op = 'UPDATE'
     and old.transaction_id <> new.transaction_id then
    perform private.validate_transaction_entries(old.transaction_id);
  end if;

  return new;
end;
$$;


create constraint trigger transaction_entries_integrity
after insert or update or delete
on public.transaction_entries
deferrable initially deferred
for each row
execute function private.validate_transaction_entries_trigger();


-- ============================================================
-- 23. RLS
--
-- Every user-owned public table is protected.
-- anon receives no access.
-- authenticated receives only its own rows.
--
-- service_role is intentionally trusted server-side and bypasses
-- RLS in Supabase.
-- ============================================================

alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.merchants enable row level security;
alter table public.transactions enable row level security;
alter table public.transaction_entries enable row level security;
alter table public.recurring_transactions enable row level security;
alter table public.recurring_transaction_entries enable row level security;
alter table public.budgets enable row level security;
alter table public.budget_categories enable row level security;
alter table public.goals enable row level security;
alter table public.goal_contributions enable row level security;
alter table public.tags enable row level security;
alter table public.transaction_tags enable row level security;
alter table public.attachments enable row level security;


-- ============================================================
-- 24. GRANTS
-- ============================================================

revoke all on table
  public.profiles,
  public.accounts,
  public.categories,
  public.merchants,
  public.transactions,
  public.transaction_entries,
  public.recurring_transactions,
  public.recurring_transaction_entries,
  public.budgets,
  public.budget_categories,
  public.goals,
  public.goal_contributions,
  public.tags,
  public.transaction_tags,
  public.attachments
from anon;


grant select, insert, update on public.profiles
to authenticated;

grant select, insert, update, delete on
  public.accounts,
  public.categories,
  public.merchants,
  public.transactions,
  public.transaction_entries,
  public.recurring_transactions,
  public.recurring_transaction_entries,
  public.budgets,
  public.budget_categories,
  public.goals,
  public.goal_contributions,
  public.tags,
  public.transaction_tags,
  public.attachments
to authenticated;


-- ============================================================
-- 25. PROFILE POLICIES
-- ============================================================

create policy profiles_select_own
on public.profiles
for select
to authenticated
using (
  (select auth.uid()) = id
);


create policy profiles_insert_own
on public.profiles
for insert
to authenticated
with check (
  (select auth.uid()) = id
);


create policy profiles_update_own
on public.profiles
for update
to authenticated
using (
  (select auth.uid()) = id
)
with check (
  (select auth.uid()) = id
);


-- No DELETE policy for profiles.
-- Deleting auth.users cascades to profiles.


-- ============================================================
-- 26. GENERIC USER-OWNED TABLE POLICIES
-- ============================================================

-- ACCOUNTS

create policy accounts_select_own
on public.accounts
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy accounts_insert_own
on public.accounts
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy accounts_update_own
on public.accounts
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy accounts_delete_own
on public.accounts
for delete
to authenticated
using ((select auth.uid()) = user_id);


-- CATEGORIES

create policy categories_select_own
on public.categories
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy categories_insert_own
on public.categories
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy categories_update_own
on public.categories
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy categories_delete_own
on public.categories
for delete
to authenticated
using ((select auth.uid()) = user_id);


-- MERCHANTS

create policy merchants_select_own
on public.merchants
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy merchants_insert_own
on public.merchants
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy merchants_update_own
on public.merchants
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy merchants_delete_own
on public.merchants
for delete
to authenticated
using ((select auth.uid()) = user_id);


-- TRANSACTIONS

create policy transactions_select_own
on public.transactions
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy transactions_insert_own
on public.transactions
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy transactions_update_own
on public.transactions
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy transactions_delete_own
on public.transactions
for delete
to authenticated
using ((select auth.uid()) = user_id);


-- TRANSACTION ENTRIES

create policy transaction_entries_select_own
on public.transaction_entries
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy transaction_entries_insert_own
on public.transaction_entries
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy transaction_entries_update_own
on public.transaction_entries
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy transaction_entries_delete_own
on public.transaction_entries
for delete
to authenticated
using ((select auth.uid()) = user_id);


-- RECURRING TRANSACTIONS

create policy recurring_transactions_select_own
on public.recurring_transactions
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy recurring_transactions_insert_own
on public.recurring_transactions
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy recurring_transactions_update_own
on public.recurring_transactions
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy recurring_transactions_delete_own
on public.recurring_transactions
for delete
to authenticated
using ((select auth.uid()) = user_id);


-- RECURRING ENTRIES

create policy recurring_entries_select_own
on public.recurring_transaction_entries
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy recurring_entries_insert_own
on public.recurring_transaction_entries
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy recurring_entries_update_own
on public.recurring_transaction_entries
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy recurring_entries_delete_own
on public.recurring_transaction_entries
for delete
to authenticated
using ((select auth.uid()) = user_id);


-- BUDGETS

create policy budgets_select_own
on public.budgets
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy budgets_insert_own
on public.budgets
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy budgets_update_own
on public.budgets
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy budgets_delete_own
on public.budgets
for delete
to authenticated
using ((select auth.uid()) = user_id);


-- BUDGET CATEGORIES

create policy budget_categories_select_own
on public.budget_categories
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy budget_categories_insert_own
on public.budget_categories
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy budget_categories_update_own
on public.budget_categories
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy budget_categories_delete_own
on public.budget_categories
for delete
to authenticated
using ((select auth.uid()) = user_id);


-- GOALS

create policy goals_select_own
on public.goals
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy goals_insert_own
on public.goals
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy goals_update_own
on public.goals
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy goals_delete_own
on public.goals
for delete
to authenticated
using ((select auth.uid()) = user_id);


-- GOAL CONTRIBUTIONS

create policy goal_contributions_select_own
on public.goal_contributions
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy goal_contributions_insert_own
on public.goal_contributions
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy goal_contributions_update_own
on public.goal_contributions
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy goal_contributions_delete_own
on public.goal_contributions
for delete
to authenticated
using ((select auth.uid()) = user_id);


-- TAGS

create policy tags_select_own
on public.tags
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy tags_insert_own
on public.tags
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy tags_update_own
on public.tags
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy tags_delete_own
on public.tags
for delete
to authenticated
using ((select auth.uid()) = user_id);


-- TRANSACTION TAGS

create policy transaction_tags_select_own
on public.transaction_tags
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy transaction_tags_insert_own
on public.transaction_tags
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy transaction_tags_update_own
on public.transaction_tags
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy transaction_tags_delete_own
on public.transaction_tags
for delete
to authenticated
using ((select auth.uid()) = user_id);


-- ATTACHMENTS

create policy attachments_select_own
on public.attachments
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy attachments_insert_own
on public.attachments
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy attachments_update_own
on public.attachments
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy attachments_delete_own
on public.attachments
for delete
to authenticated
using ((select auth.uid()) = user_id);


-- ============================================================
-- 27. FUNCTION PRIVILEGES
--
-- Internal helper functions must not be callable by anon or
-- authenticated users unless explicitly required.
-- ============================================================

revoke all on function
  private.set_updated_at()
from public;

revoke all on function
  private.seed_default_categories(uuid)
from public;

revoke all on function
  private.validate_transaction_entries(uuid)
from public;

revoke all on function
  private.validate_transaction_entries_trigger()
from public;

revoke all on function
  public.handle_new_user()
from public;


-- ============================================================
-- END OF INITIAL SPENDSTACK SCHEMA
-- ============================================================