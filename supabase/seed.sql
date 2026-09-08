-- ============================================================
-- SpendStack - Development Seed
-- Source of truth: initial_spendstack_schema migration
--
-- Purpose:
--   Reproducible local development data for web/mobile development.
--
-- Notes:
--   - This file contains data only; schema remains in migrations.
--   - The Auth trigger creates public.profiles and default categories.
--   - All UUIDs are deterministic so the seed is easy to inspect.
-- ============================================================


-- ============================================================
-- 1. DEVELOPMENT AUTH USER
-- ============================================================

insert into auth.users (
  id,
  email,
  raw_user_meta_data
)
values (
  'd0e3c8f0-1234-5678-9abc-def012345678',
  'rishi@spendstack.local',
  '{"display_name":"Rishi","full_name":"Rishi"}'::jsonb
)
on conflict (id) do nothing;


-- ============================================================
-- 2. PROFILE
--
-- The auth trigger creates this automatically. The explicit
-- update makes the development profile deterministic.
-- ============================================================

update public.profiles
set
  display_name = 'Rishi',
  default_currency = 'INR',
  timezone = 'Asia/Kolkata'
where id = 'd0e3c8f0-1234-5678-9abc-def012345678';


-- ============================================================
-- 3. ACCOUNTS
-- ============================================================

insert into public.accounts (
  id,
  user_id,
  name,
  account_type,
  currency,
  opening_balance,
  opening_balance_date,
  institution_name,
  account_number_last4,
  notes
)
values
(
  '10000000-0000-0000-0000-000000000001',
  'd0e3c8f0-1234-5678-9abc-def012345678',
  'HDFC Bank',
  'bank',
  'INR',
  75000.0000,
  '2026-09-01',
  'HDFC Bank',
  '4521',
  'Primary everyday bank account'
),
(
  '10000000-0000-0000-0000-000000000002',
  'd0e3c8f0-1234-5678-9abc-def012345678',
  'HDFC Credit Card',
  'credit_card',
  'INR',
  -18500.0000,
  '2026-09-01',
  'HDFC Bank',
  '8832',
  'Primary credit card'
),
(
  '10000000-0000-0000-0000-000000000003',
  'd0e3c8f0-1234-5678-9abc-def012345678',
  'Cash',
  'cash',
  'INR',
  3000.0000,
  '2026-09-01',
  null,
  null,
  'Cash in wallet'
),
(
  '10000000-0000-0000-0000-000000000004',
  'd0e3c8f0-1234-5678-9abc-def012345678',
  'SBI Savings',
  'savings',
  'INR',
  150000.0000,
  '2026-09-01',
  'State Bank of India',
  '6743',
  'Long-term savings'
),
(
  '10000000-0000-0000-0000-000000000005',
  'd0e3c8f0-1234-5678-9abc-def012345678',
  'Paytm Wallet',
  'wallet',
  'INR',
  2500.0000,
  '2026-09-01',
  'Paytm',
  null,
  'Digital wallet'
)
on conflict (id) do nothing;


-- ============================================================
-- 4. MERCHANTS
-- ============================================================

insert into public.merchants (
  id,
  user_id,
  name,
  normalized_name,
  notes
)
values
(
  '20000000-0000-0000-0000-000000000001',
  'd0e3c8f0-1234-5678-9abc-def012345678',
  'Swiggy',
  'swiggy',
  'Food delivery'
),
(
  '20000000-0000-0000-0000-000000000002',
  'd0e3c8f0-1234-5678-9abc-def012345678',
  'Amazon',
  'amazon',
  'Online shopping'
),
(
  '20000000-0000-0000-0000-000000000003',
  'd0e3c8f0-1234-5678-9abc-def012345678',
  'Uber',
  'uber',
  'Cab and mobility'
),
(
  '20000000-0000-0000-0000-000000000004',
  'd0e3c8f0-1234-5678-9abc-def012345678',
  'Netflix',
  'netflix',
  'Streaming subscription'
),
(
  '20000000-0000-0000-0000-000000000005',
  'd0e3c8f0-1234-5678-9abc-def012345678',
  'Zomato',
  'zomato',
  'Food delivery'
),
(
  '20000000-0000-0000-0000-000000000006',
  'd0e3c8f0-1234-5678-9abc-def012345678',
  'HDFC Bank',
  'hdfc bank',
  'Banking'
)
on conflict (id) do nothing;


-- ============================================================
-- 5. EXTRA DEVELOPMENT CATEGORIES
--
-- The migration's auth trigger already creates the system
-- category tree. These are additional user-created categories.
-- ============================================================

insert into public.categories (
  id,
  user_id,
  parent_id,
  name,
  category_type,
  is_system,
  sort_order
)
select
  '30000000-0000-0000-0000-000000000001',
  'd0e3c8f0-1234-5678-9abc-def012345678',
  null,
  'Work',
  'both',
  false,
  20
where not exists (
  select 1
  from public.categories
  where user_id = 'd0e3c8f0-1234-5678-9abc-def012345678'
    and parent_id is null
    and lower(name) = 'work'
);


-- ============================================================
-- 6. TAGS
-- ============================================================

insert into public.tags (
  id,
  user_id,
  name,
  color
)
values
(
  '40000000-0000-0000-0000-000000000001',
  'd0e3c8f0-1234-5678-9abc-def012345678',
  'Essential',
  '#2563EB'
),
(
  '40000000-0000-0000-0000-000000000002',
  'd0e3c8f0-1234-5678-9abc-def012345678',
  'Personal',
  '#7C3AED'
),
(
  '40000000-0000-0000-0000-000000000003',
  'd0e3c8f0-1234-5678-9abc-def012345678',
  'Work',
  '#059669'
),
(
  '40000000-0000-0000-0000-000000000004',
  'd0e3c8f0-1234-5678-9abc-def012345678',
  'Subscription',
  '#EA580C'
)
on conflict (id) do nothing;


-- ============================================================
-- 7. BUDGET
-- ============================================================

insert into public.budgets (
  id,
  user_id,
  name,
  amount,
  currency,
  period_type,
  start_date,
  end_date,
  notes
)
values (
  '50000000-0000-0000-0000-000000000001',
  'd0e3c8f0-1234-5678-9abc-def012345678',
  'September 2026 Budget',
  50000.0000,
  'INR',
  'monthly',
  '2026-09-01',
  '2026-09-30',
  'Development monthly budget'
)
on conflict (id) do nothing;


-- Attach budget categories using the system category names created
-- by the auth trigger.

insert into public.budget_categories (
  id,
  user_id,
  budget_id,
  category_id,
  amount
)
select
  v.id,
  'd0e3c8f0-1234-5678-9abc-def012345678',
  '50000000-0000-0000-0000-000000000001',
  c.id,
  v.amount
from (
  values
    ('51000000-0000-0000-0000-000000000001'::uuid, 'Food', 10000.0000::numeric),
    ('51000000-0000-0000-0000-000000000002'::uuid, 'Transport', 5000.0000::numeric),
    ('51000000-0000-0000-0000-000000000003'::uuid, 'Shopping', 8000.0000::numeric),
    ('51000000-0000-0000-0000-000000000004'::uuid, 'Bills & Utilities', 12000.0000::numeric)
) as v(id, category_name, amount)
join public.categories c
  on c.user_id = 'd0e3c8f0-1234-5678-9abc-def012345678'
 and c.parent_id is null
 and lower(c.name) = lower(v.category_name)
on conflict (budget_id, category_id) do nothing;


-- ============================================================
-- 8. GOALS
-- ============================================================

insert into public.goals (
  id,
  user_id,
  name,
  target_amount,
  currency,
  target_date,
  status,
  notes
)
values
(
  '60000000-0000-0000-0000-000000000001',
  'd0e3c8f0-1234-5678-9abc-def012345678',
  'Emergency Fund',
  300000.0000,
  'INR',
  '2027-06-30',
  'active',
  'Build a six-month emergency fund'
),
(
  '60000000-0000-0000-0000-000000000002',
  'd0e3c8f0-1234-5678-9abc-def012345678',
  'New Laptop',
  120000.0000,
  'INR',
  '2027-03-31',
  'active',
  'Laptop replacement fund'
)
on conflict (id) do nothing;


-- ============================================================
-- 9. RECURRING TRANSACTIONS
-- ============================================================

insert into public.recurring_transactions (
  id,
  user_id,
  name,
  transaction_type,
  frequency,
  interval_count,
  start_date,
  end_date,
  next_occurrence_date,
  is_active,
  notes
)
values
(
  '70000000-0000-0000-0000-000000000001',
  'd0e3c8f0-1234-5678-9abc-def012345678',
  'Netflix Subscription',
  'expense',
  'monthly',
  1,
  '2026-09-05',
  null,
  '2026-10-05',
  true,
  'Monthly Netflix subscription'
),
(
  '70000000-0000-0000-0000-000000000002',
  'd0e3c8f0-1234-5678-9abc-def012345678',
  'Monthly Salary',
  'income',
  'monthly',
  1,
  '2026-09-01',
  null,
  '2026-10-01',
  true,
  'Monthly salary'
)
on conflict (id) do nothing;


-- Recurring template entries.

insert into public.recurring_transaction_entries (
  id,
  user_id,
  recurring_transaction_id,
  account_id,
  category_id,
  entry_type,
  amount,
  currency,
  memo
)
select
  '71000000-0000-0000-0000-000000000001'::uuid,
  'd0e3c8f0-1234-5678-9abc-def012345678',
  '70000000-0000-0000-0000-000000000001'::uuid,
  '10000000-0000-0000-0000-000000000001'::uuid,
  c.id,
  'debit',
  649.0000,
  'INR',
  'Netflix monthly subscription'
from public.categories c
where c.user_id = 'd0e3c8f0-1234-5678-9abc-def012345678'
  and c.parent_id is null
  and lower(c.name) = 'entertainment'
on conflict (id) do nothing;

insert into public.recurring_transaction_entries (
  id,
  user_id,
  recurring_transaction_id,
  account_id,
  category_id,
  entry_type,
  amount,
  currency,
  memo
)
select
  '71000000-0000-0000-0000-000000000002'::uuid,
  'd0e3c8f0-1234-5678-9abc-def012345678',
  '70000000-0000-0000-0000-000000000002'::uuid,
  '10000000-0000-0000-0000-000000000001'::uuid,
  c.id,
  'credit',
  120000.0000,
  'INR',
  'Monthly salary'
from public.categories c
where c.user_id = 'd0e3c8f0-1234-5678-9abc-def012345678'
  and c.parent_id is null
  and lower(c.name) = 'income'
on conflict (id) do nothing;


-- ============================================================
-- 10. TRANSACTIONS
--
-- The entries below deliberately exercise:
--   expense, income, transfer, refund, adjustment,
--   split expense, recurring link and tags.
-- ============================================================

insert into public.transactions (
  id,
  user_id,
  transaction_type,
  transaction_date,
  merchant_id,
  description,
  notes,
  reference_number,
  recurring_transaction_id
)
values
(
  '80000000-0000-0000-0000-000000000001',
  'd0e3c8f0-1234-5678-9abc-def012345678',
  'income',
  '2026-09-01 09:00:00+05:30',
  null,
  'September Salary',
  'Monthly salary credit',
  'SAL-2026-09',
  '70000000-0000-0000-0000-000000000002'
),
(
  '80000000-0000-0000-0000-000000000002',
  'd0e3c8f0-1234-5678-9abc-def012345678',
  'expense',
  '2026-09-03 20:15:00+05:30',
  '20000000-0000-0000-0000-000000000001',
  'Dinner order',
  'Dinner with friends',
  null,
  null
),
(
  '80000000-0000-0000-0000-000000000003',
  'd0e3c8f0-1234-5678-9abc-def012345678',
  'expense',
  '2026-09-04 18:30:00+05:30',
  '20000000-0000-0000-0000-000000000003',
  'Uber ride',
  'Ride home',
  null,
  null
),
(
  '80000000-0000-0000-0000-000000000004',
  'd0e3c8f0-1234-5678-9abc-def012345678',
  'expense',
  '2026-09-05 10:00:00+05:30',
  '20000000-0000-0000-0000-000000000004',
  'Netflix',
  'Monthly subscription',
  null,
  '70000000-0000-0000-0000-000000000001'
),
(
  '80000000-0000-0000-0000-000000000005',
  'd0e3c8f0-1234-5678-9abc-def012345678',
  'expense',
  '2026-09-06 14:00:00+05:30',
  '20000000-0000-0000-0000-000000000002',
  'Amazon shopping',
  'Household items',
  'AMZ-20260906',
  null
),
(
  '80000000-0000-0000-0000-000000000006',
  'd0e3c8f0-1234-5678-9abc-def012345678',
  'transfer',
  '2026-09-07 12:00:00+05:30',
  '20000000-0000-0000-0000-000000000006',
  'Credit card payment',
  'Payment towards HDFC credit card',
  'HDFC-PAY-0907',
  null
),
(
  '80000000-0000-0000-0000-000000000007',
  'd0e3c8f0-1234-5678-9abc-def012345678',
  'expense',
  '2026-09-08 19:45:00+05:30',
  '20000000-0000-0000-0000-000000000005',
  'Dinner and groceries',
  'Split expense example',
  null,
  null
),
(
  '80000000-0000-0000-0000-000000000008',
  'd0e3c8f0-1234-5678-9abc-def012345678',
  'refund',
  '2026-09-09 11:20:00+05:30',
  '20000000-0000-0000-0000-000000000002',
  'Amazon refund',
  'Refund for returned item',
  'AMZ-REF-0909',
  null
),
(
  '80000000-0000-0000-0000-000000000009',
  'd0e3c8f0-1234-5678-9abc-def012345678',
  'adjustment',
  '2026-09-10 09:00:00+05:30',
  null,
  'Balance adjustment',
  'Manual reconciliation adjustment',
  'ADJ-09010',
  null
),
(
  '80000000-0000-0000-0000-000000000010',
  'd0e3c8f0-1234-5678-9abc-def012345678',
  'expense',
  '2026-09-11 21:00:00+05:30',
  '20000000-0000-0000-0000-000000000001',
  'Food delivery',
  'Late-night meal',
  null,
  null
)
on conflict (id) do nothing;


-- ============================================================
-- 11. TRANSACTION ENTRIES
-- ============================================================

-- Salary: credit bank.
insert into public.transaction_entries (
  id, user_id, transaction_id, account_id, category_id,
  entry_type, amount, account_amount, currency, exchange_rate, memo
)
select
  '81000000-0000-0000-0000-000000000001'::uuid,
  'd0e3c8f0-1234-5678-9abc-def012345678',
  '80000000-0000-0000-0000-000000000001'::uuid,
  '10000000-0000-0000-0000-000000000001'::uuid,
  c.id,
  'credit',
  120000.0000,
  120000.0000,
  'INR',
  1,
  'Salary credit'
from public.categories c
where c.user_id = 'd0e3c8f0-1234-5678-9abc-def012345678'
  and c.parent_id is null
  and lower(c.name) = 'income'
on conflict (id) do nothing;


-- Swiggy expense.
insert into public.transaction_entries (
  id, user_id, transaction_id, account_id, category_id,
  entry_type, amount, account_amount, currency, exchange_rate, memo
)
select
  '81000000-0000-0000-0000-000000000002'::uuid,
  'd0e3c8f0-1234-5678-9abc-def012345678',
  '80000000-0000-0000-0000-000000000002'::uuid,
  '10000000-0000-0000-0000-000000000001'::uuid,
  c.id,
  'debit',
  850.0000,
  850.0000,
  'INR',
  1,
  'Dinner'
from public.categories c
where c.user_id = 'd0e3c8f0-1234-5678-9abc-def012345678'
  and c.parent_id is null
  and lower(c.name) = 'food'
on conflict (id) do nothing;


-- Uber expense.
insert into public.transaction_entries (
  id, user_id, transaction_id, account_id, category_id,
  entry_type, amount, account_amount, currency, exchange_rate, memo
)
select
  '81000000-0000-0000-0000-000000000003'::uuid,
  'd0e3c8f0-1234-5678-9abc-def012345678',
  '80000000-0000-0000-0000-000000000003'::uuid,
  '10000000-0000-0000-0000-000000000001'::uuid,
  c.id,
  'debit',
  420.0000,
  420.0000,
  'INR',
  1,
  'Uber ride'
from public.categories c
where c.user_id = 'd0e3c8f0-1234-5678-9abc-def012345678'
  and c.parent_id is null
  and lower(c.name) = 'transport'
on conflict (id) do nothing;


-- Netflix recurring expense.
insert into public.transaction_entries (
  id, user_id, transaction_id, account_id, category_id,
  entry_type, amount, account_amount, currency, exchange_rate, memo
)
select
  '81000000-0000-0000-0000-000000000004'::uuid,
  'd0e3c8f0-1234-5678-9abc-def012345678',
  '80000000-0000-0000-0000-000000000004'::uuid,
  '10000000-0000-0000-0000-000000000001'::uuid,
  c.id,
  'debit',
  649.0000,
  649.0000,
  'INR',
  1,
  'Netflix subscription'
from public.categories c
where c.user_id = 'd0e3c8f0-1234-5678-9abc-def012345678'
  and c.parent_id is null
  and lower(c.name) = 'entertainment'
on conflict (id) do nothing;


-- Amazon shopping.
insert into public.transaction_entries (
  id, user_id, transaction_id, account_id, category_id,
  entry_type, amount, account_amount, currency, exchange_rate, memo
)
select
  '81000000-0000-0000-0000-000000000005'::uuid,
  'd0e3c8f0-1234-5678-9abc-def012345678',
  '80000000-0000-0000-0000-000000000005'::uuid,
  '10000000-0000-0000-0000-000000000002'::uuid,
  c.id,
  'debit',
  3499.0000,
  3499.0000,
  'INR',
  1,
  'Amazon purchase'
from public.categories c
where c.user_id = 'd0e3c8f0-1234-5678-9abc-def012345678'
  and c.parent_id is null
  and lower(c.name) = 'shopping'
on conflict (id) do nothing;


-- Credit card payment: bank debit + credit card credit.
insert into public.transaction_entries (
  id, user_id, transaction_id, account_id, category_id,
  entry_type, amount, account_amount, currency, exchange_rate, memo
)
values
(
  '81000000-0000-0000-0000-000000000006',
  'd0e3c8f0-1234-5678-9abc-def012345678',
  '80000000-0000-0000-0000-000000000006',
  '10000000-0000-0000-0000-000000000001',
  null,
  'debit',
  5000.0000,
  5000.0000,
  'INR',
  1,
  'Bank side of card payment'
),
(
  '81000000-0000-0000-0000-000000000007',
  'd0e3c8f0-1234-5678-9abc-def012345678',
  '80000000-0000-0000-0000-000000000006',
  '10000000-0000-0000-0000-000000000002',
  null,
  'credit',
  5000.0000,
  5000.0000,
  'INR',
  1,
  'Credit card payment'
)
on conflict (id) do nothing;


-- Split expense: two categories against one bank account.
insert into public.transaction_entries (
  id, user_id, transaction_id, account_id, category_id,
  entry_type, amount, account_amount, currency, exchange_rate, memo
)
select
  v.id,
  'd0e3c8f0-1234-5678-9abc-def012345678',
  '80000000-0000-0000-0000-000000000007'::uuid,
  '10000000-0000-0000-0000-000000000001'::uuid,
  c.id,
  'debit',
  v.amount,
  v.amount,
  'INR',
  1,
  v.memo
from (
  values
    (
      '81000000-0000-0000-0000-000000000008'::uuid,
      'Food',
      1200.0000::numeric,
      'Dinner'
    ),
    (
      '81000000-0000-0000-0000-000000000009'::uuid,
      'Groceries',
      800.0000::numeric,
      'Groceries'
    )
) as v(id, category_name, amount, memo)
join public.categories c
  on c.user_id = 'd0e3c8f0-1234-5678-9abc-def012345678'
 and lower(c.name) = lower(v.category_name)
on conflict (id) do nothing;


-- Amazon refund: credit bank, categorized as Shopping.
insert into public.transaction_entries (
  id, user_id, transaction_id, account_id, category_id,
  entry_type, amount, account_amount, currency, exchange_rate, memo
)
select
  '81000000-0000-0000-0000-000000000010'::uuid,
  'd0e3c8f0-1234-5678-9abc-def012345678',
  '80000000-0000-0000-0000-000000000008'::uuid,
  '10000000-0000-0000-0000-000000000001'::uuid,
  c.id,
  'credit',
  1499.0000,
  1499.0000,
  'INR',
  1,
  'Amazon refund'
from public.categories c
where c.user_id = 'd0e3c8f0-1234-5678-9abc-def012345678'
  and c.parent_id is null
  and lower(c.name) = 'shopping'
on conflict (id) do nothing;


-- Adjustment: bank credit.
insert into public.transaction_entries (
  id, user_id, transaction_id, account_id, category_id,
  entry_type, amount, account_amount, currency, exchange_rate, memo
)
values (
  '81000000-0000-0000-0000-000000000011',
  'd0e3c8f0-1234-5678-9abc-def012345678',
  '80000000-0000-0000-0000-000000000009',
  '10000000-0000-0000-0000-000000000001',
  null,
  'credit',
  250.0000,
  250.0000,
  'INR',
  1,
  'Balance reconciliation'
)
on conflict (id) do nothing;


-- Additional food delivery expense.
insert into public.transaction_entries (
  id, user_id, transaction_id, account_id, category_id,
  entry_type, amount, account_amount, currency, exchange_rate, memo
)
select
  '81000000-0000-0000-0000-000000000012'::uuid,
  'd0e3c8f0-1234-5678-9abc-def012345678',
  '80000000-0000-0000-0000-000000000010'::uuid,
  '10000000-0000-0000-0000-000000000001'::uuid,
  c.id,
  'debit',
  620.0000,
  620.0000,
  'INR',
  1,
  'Late-night meal'
from public.categories c
where c.user_id = 'd0e3c8f0-1234-5678-9abc-def012345678'
  and c.parent_id is null
  and lower(c.name) = 'food'
on conflict (id) do nothing;


-- ============================================================
-- 12. TRANSACTION TAGS
-- ============================================================

insert into public.transaction_tags (
  user_id,
  transaction_id,
  tag_id
)
values
(
  'd0e3c8f0-1234-5678-9abc-def012345678',
  '80000000-0000-0000-0000-000000000002',
  '40000000-0000-0000-0000-000000000002'
),
(
  'd0e3c8f0-1234-5678-9abc-def012345678',
  '80000000-0000-0000-0000-000000000005',
  '40000000-0000-0000-0000-000000000002'
),
(
  'd0e3c8f0-1234-5678-9abc-def012345678',
  '80000000-0000-0000-0000-000000000004',
  '40000000-0000-0000-0000-000000000004'
),
(
  'd0e3c8f0-1234-5678-9abc-def012345678',
  '80000000-0000-0000-0000-000000000003',
  '40000000-0000-0000-0000-000000000001'
)
on conflict (transaction_id, tag_id) do nothing;


-- ============================================================
-- 13. GOAL CONTRIBUTIONS
-- ============================================================

insert into public.goal_contributions (
  id,
  user_id,
  goal_id,
  transaction_id,
  amount,
  contribution_date,
  note
)
values
(
  '90000000-0000-0000-0000-000000000001',
  'd0e3c8f0-1234-5678-9abc-def012345678',
  '60000000-0000-0000-0000-000000000001',
  '80000000-0000-0000-0000-000000000001',
  25000.0000,
  '2026-09-01',
  'Initial emergency fund contribution'
),
(
  '90000000-0000-0000-0000-000000000002',
  'd0e3c8f0-1234-5678-9abc-def012345678',
  '60000000-0000-0000-0000-000000000002',
  null,
  15000.0000,
  '2026-09-06',
  'Initial laptop fund contribution'
)
on conflict (id) do nothing;


-- ============================================================
-- 14. ATTACHMENT METADATA
--
-- No actual Storage object is created here. This only exercises
-- the metadata table. The referenced file path is development-only.
-- ============================================================

insert into public.attachments (
  id,
  user_id,
  transaction_id,
  storage_bucket,
  storage_path,
  file_name,
  content_type,
  file_size_bytes
)
values (
  'a0000000-0000-0000-0000-000000000001',
  'd0e3c8f0-1234-5678-9abc-def012345678',
  '80000000-0000-0000-0000-000000000005',
  'transaction-attachments',
  'd0e3c8f0-1234-5678-9abc-def012345678/80000000-0000-0000-0000-000000000005/receipt.pdf',
  'amazon-receipt.pdf',
  'application/pdf',
  245760
)
on conflict (id) do nothing;


-- ============================================================
-- END OF DEVELOPMENT SEED
-- ============================================================
