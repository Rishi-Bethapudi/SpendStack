begin;

select plan(8);

-- ============================================================
-- TEST SETUP
-- ============================================================

-- A dedicated test user.
-- The outer transaction rolls everything back after the tests.
insert into auth.users (
  id,
  aud,
  role,
  email,
  created_at,
  updated_at,
  is_sso_user,
  is_anonymous
)
values (
  '00000000-0000-0000-0000-000000000101',
  'authenticated',
  'authenticated',
  'transaction-integrity-test@spendstack.local',
  now(),
  now(),
  false,
  false
);

-- Test account.
insert into public.accounts (
  id,
  user_id,
  name,
  account_type,
  currency,
  opening_balance
)
values (
  '00000000-0000-0000-0000-000000000201',
  '00000000-0000-0000-0000-000000000101',
  'Test Bank Account',
  'bank',
  'INR',
  0
);

-- Test expense category.
insert into public.categories (
  id,
  user_id,
  name,
  category_type,
  is_system
)
values (
  '00000000-0000-0000-0000-000000000301',
  '00000000-0000-0000-0000-000000000101',
  'Test Food',
  'expense',
  false
);

-- Test income category.
insert into public.categories (
  id,
  user_id,
  name,
  category_type,
  is_system
)
values (
  '00000000-0000-0000-0000-000000000302',
  '00000000-0000-0000-0000-000000000101',
  'Test Salary',
  'income',
  false
);


-- ============================================================
-- 1. VALID EXPENSE
-- ============================================================
-- Expense:
--
--   Swiggy ₹500
--       ↓
--   debit Food ₹500
--
-- Requirements:
--   * transaction_type = expense
--   * at least one entry
--   * entry must be debit
--   * category is required
-- ============================================================

select lives_ok(
$$
  insert into public.transactions (
    id,
    user_id,
    transaction_type,
    description
  )
  values (
    '00000000-0000-0000-0000-000000000401',
    '00000000-0000-0000-0000-000000000101',
    'expense',
    'Test expense'
  );

  insert into public.transaction_entries (
    id,
    transaction_id,
    user_id,
    account_id,
    category_id,
    entry_type,
    amount,
    currency,
    account_amount,
    exchange_rate
  )
  values (
    '00000000-0000-0000-0000-000000000501',
    '00000000-0000-0000-0000-000000000401',
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000201',
    '00000000-0000-0000-0000-000000000301',
    'debit',
    500,
    'INR',
    500,
    1
  );

  set constraints transaction_entries_integrity immediate;
  set constraints transaction_entries_integrity deferred;
$$,
'valid expense with debit and category is accepted'
);


-- ============================================================
-- 2. VALID INCOME
-- ============================================================
-- Income:
--
--   Salary ₹50,000
--       ↓
--   credit Bank ₹50,000
--
-- Requirements:
--   * transaction_type = income
--   * at least one entry
--   * entry must be credit
--   * category is required
-- ============================================================

select lives_ok(
$$
  insert into public.transactions (
    id,
    user_id,
    transaction_type,
    description
  )
  values (
    '00000000-0000-0000-0000-000000000402',
    '00000000-0000-0000-0000-000000000101',
    'income',
    'Test salary'
  );

  insert into public.transaction_entries (
    id,
    transaction_id,
    user_id,
    account_id,
    category_id,
    entry_type,
    amount,
    currency,
    account_amount,
    exchange_rate
  )
  values (
    '00000000-0000-0000-0000-000000000502',
    '00000000-0000-0000-0000-000000000402',
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000201',
    '00000000-0000-0000-0000-000000000302',
    'credit',
    50000,
    'INR',
    50000,
    1
  );

  set constraints transaction_entries_integrity immediate;
  set constraints transaction_entries_integrity deferred;
$$,
'valid income with credit and category is accepted'
);


-- ============================================================
-- 3. VALID REFUND
-- ============================================================
-- Refund:
--
--   Amazon refund ₹1,000
--       ↓
--   credit Bank ₹1,000
--
-- Requirements:
--   * transaction_type = refund
--   * at least one entry
--   * entry must be credit
--   * category is required
-- ============================================================

select lives_ok(
$$
  insert into public.transactions (
    id,
    user_id,
    transaction_type,
    description
  )
  values (
    '00000000-0000-0000-0000-000000000403',
    '00000000-0000-0000-0000-000000000101',
    'refund',
    'Test refund'
  );

  insert into public.transaction_entries (
    id,
    transaction_id,
    user_id,
    account_id,
    category_id,
    entry_type,
    amount,
    currency,
    account_amount,
    exchange_rate
  )
  values (
    '00000000-0000-0000-0000-000000000503',
    '00000000-0000-0000-0000-000000000403',
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000201',
    '00000000-0000-0000-0000-000000000301',
    'credit',
    1000,
    'INR',
    1000,
    1
  );

  set constraints transaction_entries_integrity immediate;
  set constraints transaction_entries_integrity deferred;
$$,
'valid refund with credit and category is accepted'
);


-- ============================================================
-- 4. VALID TRANSFER
-- ============================================================
-- Transfer:
--
--   Bank
--    │
--    │ debit ₹10,000
--    ▼
--   Wallet
--    ▲
--    │ credit ₹10,000
--
-- Requirements:
--   * exactly two entries
--   * one debit
--   * one credit
--   * neither entry has a category
-- ============================================================

-- Second account for the transfer.
insert into public.accounts (
  id,
  user_id,
  name,
  account_type,
  currency,
  opening_balance
)
values (
  '00000000-0000-0000-0000-000000000202',
  '00000000-0000-0000-0000-000000000101',
  'Test Wallet',
  'wallet',
  'INR',
  0
);

select lives_ok(
$$
  insert into public.transactions (
    id,
    user_id,
    transaction_type,
    description
  )
  values (
    '00000000-0000-0000-0000-000000000404',
    '00000000-0000-0000-0000-000000000101',
    'transfer',
    'Test transfer'
  );

  insert into public.transaction_entries (
    id,
    transaction_id,
    user_id,
    account_id,
    category_id,
    entry_type,
    amount,
    currency,
    account_amount,
    exchange_rate
  )
  values (
    '00000000-0000-0000-0000-000000000504',
    '00000000-0000-0000-0000-000000000404',
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000201',
    null,
    'debit',
    10000,
    'INR',
    10000,
    1
  );

  insert into public.transaction_entries (
    id,
    transaction_id,
    user_id,
    account_id,
    category_id,
    entry_type,
    amount,
    currency,
    account_amount,
    exchange_rate
  )
  values (
    '00000000-0000-0000-0000-000000000505',
    '00000000-0000-0000-0000-000000000404',
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000202',
    null,
    'credit',
    10000,
    'INR',
    10000,
    1
  );

  set constraints transaction_entries_integrity immediate;
  set constraints transaction_entries_integrity deferred;
$$,
'valid transfer with exactly one debit and one credit is accepted'
);


-- ============================================================
-- 5. INVALID TRANSFER — TWO DEBITS
-- ============================================================
-- A transfer cannot contain:
--
--   debit
--   debit
--
-- It must contain exactly one debit + one credit.
-- ============================================================

select throws_ok(
$$
  insert into public.transactions (
    id,
    user_id,
    transaction_type,
    description
  )
  values (
    '00000000-0000-0000-0000-000000000405',
    '00000000-0000-0000-0000-000000000101',
    'transfer',
    'Invalid transfer'
  );

  insert into public.transaction_entries (
    id,
    transaction_id,
    user_id,
    account_id,
    category_id,
    entry_type,
    amount,
    currency,
    account_amount,
    exchange_rate
  )
  values (
    '00000000-0000-0000-0000-000000000506',
    '00000000-0000-0000-0000-000000000405',
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000201',
    null,
    'debit',
    1000,
    'INR',
    1000,
    1
  );

  insert into public.transaction_entries (
    id,
    transaction_id,
    user_id,
    account_id,
    category_id,
    entry_type,
    amount,
    currency,
    account_amount,
    exchange_rate
  )
  values (
    '00000000-0000-0000-0000-000000000507',
    '00000000-0000-0000-0000-000000000405',
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000202',
    null,
    'debit',
    1000,
    'INR',
    1000,
    1
  );

  set constraints transaction_entries_integrity immediate;
$$,
'P0001',
'Transfer transaction 00000000-0000-0000-0000-000000000405 must contain exactly one debit and one credit',
'invalid transfer with two debits is rejected'
);


-- ============================================================
-- 6. INVALID EXPENSE — CREDIT ENTRY
-- ============================================================
-- Expense must contain debit entries.
-- ============================================================

select throws_ok(
$$
  insert into public.transactions (
    id,
    user_id,
    transaction_type,
    description
  )
  values (
    '00000000-0000-0000-0000-000000000406',
    '00000000-0000-0000-0000-000000000101',
    'expense',
    'Invalid expense'
  );

  insert into public.transaction_entries (
    id,
    transaction_id,
    user_id,
    account_id,
    category_id,
    entry_type,
    amount,
    currency,
    account_amount,
    exchange_rate
  )
  values (
    '00000000-0000-0000-0000-000000000508',
    '00000000-0000-0000-0000-000000000406',
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000201',
    '00000000-0000-0000-0000-000000000301',
    'credit',
    500,
    'INR',
    500,
    1
  );

  set constraints transaction_entries_integrity immediate;
$$,
'P0001',
'Expense transaction 00000000-0000-0000-0000-000000000406 must contain debit entries only',
'invalid expense with credit entry is rejected'
);


-- ============================================================
-- 7. INVALID INCOME — DEBIT ENTRY
-- ============================================================
-- Income must contain credit entries.
-- ============================================================

select throws_ok(
$$
  insert into public.transactions (
    id,
    user_id,
    transaction_type,
    description
  )
  values (
    '00000000-0000-0000-0000-000000000407',
    '00000000-0000-0000-0000-000000000101',
    'income',
    'Invalid income'
  );

  insert into public.transaction_entries (
    id,
    transaction_id,
    user_id,
    account_id,
    category_id,
    entry_type,
    amount,
    currency,
    account_amount,
    exchange_rate
  )
  values (
    '00000000-0000-0000-0000-000000000509',
    '00000000-0000-0000-0000-000000000407',
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000201',
    '00000000-0000-0000-0000-000000000302',
    'debit',
    500,
    'INR',
    500,
    1
  );

  set constraints transaction_entries_integrity immediate;
$$,
'P0001',
'Income transaction 00000000-0000-0000-0000-000000000407 must contain credit entries only',
'invalid income with debit entry is rejected'
);


-- ============================================================
-- 8. INVALID EXPENSE — NO CATEGORY
-- ============================================================
-- Every expense entry must have a category.
-- ============================================================

select throws_ok(
$$
  insert into public.transactions (
    id,
    user_id,
    transaction_type,
    description
  )
  values (
    '00000000-0000-0000-0000-000000000408',
    '00000000-0000-0000-0000-000000000101',
    'expense',
    'Expense without category'
  );

  insert into public.transaction_entries (
    id,
    transaction_id,
    user_id,
    account_id,
    category_id,
    entry_type,
    amount,
    currency,
    account_amount,
    exchange_rate
  )
  values (
    '00000000-0000-0000-0000-000000000510',
    '00000000-0000-0000-0000-000000000408',
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000201',
    null,
    'debit',
    500,
    'INR',
    500,
    1
  );

  set constraints transaction_entries_integrity immediate;
$$,
'P0001',
'Expense transaction 00000000-0000-0000-0000-000000000408 requires a category on every entry',
'invalid expense without category is rejected'
);


-- ============================================================
-- FINISH
-- ============================================================

select * from finish();

rollback;