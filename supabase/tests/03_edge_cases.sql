
begin;

select plan(35);

-- ============================================================
-- TEST USERS
-- ============================================================

insert into auth.users (
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  is_sso_user,
  is_anonymous
)
values
(
  '00000000-0000-0000-0000-000000000111',
  'authenticated',
  'authenticated',
  'edge-a@example.com',
  'not-a-real-password',
  now(),
  now(),
  now(),
  false,
  false
),
(
  '00000000-0000-0000-0000-000000000112',
  'authenticated',
  'authenticated',
  'edge-b@example.com',
  'not-a-real-password',
  now(),
  now(),
  now(),
  false,
  false
);

-- ============================================================
-- BASE DATA
-- ============================================================

insert into public.accounts (
  id,
  user_id,
  name,
  account_type,
  currency
)
values
(
  '00000000-0000-0000-0000-000000000201',
  '00000000-0000-0000-0000-000000000111',
  'Edge Bank',
  'bank',
  'INR'
),
(
  '00000000-0000-0000-0000-000000000202',
  '00000000-0000-0000-0000-000000000111',
  'Edge Wallet',
  'wallet',
  'INR'
),
(
  '00000000-0000-0000-0000-000000000203',
  '00000000-0000-0000-0000-000000000112',
  'Other User Bank',
  'bank',
  'INR'
);

insert into public.categories (
  id,
  user_id,
  name,
  category_type
)
values
(
  '00000000-0000-0000-0000-000000000301',
  '00000000-0000-0000-0000-000000000111',
  'Edge Food',
  'expense'
),
(
  '00000000-0000-0000-0000-000000000302',
  '00000000-0000-0000-0000-000000000111',
  'Edge Income',
  'income'
),
(
  '00000000-0000-0000-0000-000000000303',
  '00000000-0000-0000-0000-000000000112',
  'Other User Category',
  'expense'
);

-- ============================================================
-- 1. EMPTY TRANSACTION BEHAVIOR
-- ============================================================
--
-- Current schema behavior:
-- transactions themselves have no constraint requiring entries.
-- The deferred integrity trigger exists only on transaction_entries.
--
-- We intentionally document this gap instead of pretending
-- the database rejects empty transactions.
-- ============================================================

insert into public.transactions (
  id,
  user_id,
  transaction_type
)
values (
  '00000000-0000-0000-0000-000000000401',
  '00000000-0000-0000-0000-000000000111',
  'expense'
);

select is(
  (
    select count(*)
    from public.transaction_entries
    where transaction_id = '00000000-0000-0000-0000-000000000401'
  ),
  0::bigint,
  'transaction can currently exist with zero entries'
);

-- ============================================================
-- 2. REFUND DEBIT REJECTED
-- ============================================================

select throws_ok(
  $$
    insert into public.transactions (
      id,
      user_id,
      transaction_type
    )
    values (
      '00000000-0000-0000-0000-000000000402',
      '00000000-0000-0000-0000-000000000111',
      'refund'
    );

    insert into public.transaction_entries (
      id,
      user_id,
      transaction_id,
      account_id,
      category_id,
      entry_type,
      amount,
      account_amount,
      currency
    )
    values (
      '00000000-0000-0000-0000-000000000501',
      '00000000-0000-0000-0000-000000000111',
      '00000000-0000-0000-0000-000000000402',
      '00000000-0000-0000-0000-000000000201',
      '00000000-0000-0000-0000-000000000301',
      'debit',
      100,
      100,
      'INR'
    );

    set constraints transaction_entries_integrity immediate;
  $$,
  'P0001',
  NULL,
  'refund debit rejected'
);

-- ============================================================
-- 3. REFUND WITHOUT CATEGORY
-- ============================================================

select throws_ok(
  $$
    insert into public.transactions (
      id,
      user_id,
      transaction_type
    )
    values (
      '00000000-0000-0000-0000-000000000403',
      '00000000-0000-0000-0000-000000000111',
      'refund'
    );

    insert into public.transaction_entries (
      id,
      user_id,
      transaction_id,
      account_id,
      entry_type,
      amount,
      account_amount,
      currency
    )
    values (
      '00000000-0000-0000-0000-000000000502',
      '00000000-0000-0000-0000-000000000111',
      '00000000-0000-0000-0000-000000000403',
      '00000000-0000-0000-0000-000000000201',
      'credit',
      100,
      100,
      'INR'
    );

    set constraints transaction_entries_integrity immediate;
  $$,
  'P0001',
  NULL,
  'refund without category rejected'
);

-- ============================================================
-- 4. TRANSFER CATEGORY REJECTED
-- ============================================================

select throws_ok(
  $$
    insert into public.transactions (
      id,
      user_id,
      transaction_type
    )
    values (
      '00000000-0000-0000-0000-000000000404',
      '00000000-0000-0000-0000-000000000111',
      'transfer'
    );

    insert into public.transaction_entries (
      id,
      user_id,
      transaction_id,
      account_id,
      category_id,
      entry_type,
      amount,
      account_amount,
      currency
    )
    values
    (
      '00000000-0000-0000-0000-000000000503',
      '00000000-0000-0000-0000-000000000111',
      '00000000-0000-0000-0000-000000000404',
      '00000000-0000-0000-0000-000000000201',
      '00000000-0000-0000-0000-000000000301',
      'debit',
      100,
      100,
      'INR'
    ),
    (
      '00000000-0000-0000-0000-000000000504',
      '00000000-0000-0000-0000-000000000111',
      '00000000-0000-0000-0000-000000000404',
      '00000000-0000-0000-0000-000000000202',
      null,
      'credit',
      100,
      100,
      'INR'
    );

    set constraints transaction_entries_integrity immediate;
  $$,
  'P0001',
  NULL,
  'transfer with category rejected'
);

-- ============================================================
-- 5. ADJUSTMENT ALLOWS DEBIT WITHOUT CATEGORY
-- ============================================================

insert into public.transactions (
  id,
  user_id,
  transaction_type
)
values (
  '00000000-0000-0000-0000-000000000405',
  '00000000-0000-0000-0000-000000000111',
  'adjustment'
);

insert into public.transaction_entries (
  id,
  user_id,
  transaction_id,
  account_id,
  entry_type,
  amount,
  account_amount,
  currency
)
values (
  '00000000-0000-0000-0000-000000000505',
  '00000000-0000-0000-0000-000000000111',
  '00000000-0000-0000-0000-000000000405',
  '00000000-0000-0000-0000-000000000201',
  'debit',
  50,
  50,
  'INR'
);

select ok(
  true,
  'adjustment allows debit without category'
);

-- ============================================================
-- 6. ZERO AMOUNT
-- ============================================================

select throws_ok(
  $$
    insert into public.transaction_entries (
      id,
      user_id,
      transaction_id,
      account_id,
      entry_type,
      amount,
      account_amount,
      currency
    )
    values (
      '00000000-0000-0000-0000-000000000506',
      '00000000-0000-0000-0000-000000000111',
      '00000000-0000-0000-0000-000000000405',
      '00000000-0000-0000-0000-000000000201',
      'credit',
      0,
      1,
      'INR'
    );
  $$,
  '23514',
  NULL,
  'zero amount rejected'
);

-- ============================================================
-- 7. NEGATIVE AMOUNT
-- ============================================================

select throws_ok(
  $$
    insert into public.transaction_entries (
      id,
      user_id,
      transaction_id,
      account_id,
      entry_type,
      amount,
      account_amount,
      currency
    )
    values (
      '00000000-0000-0000-0000-000000000507',
      '00000000-0000-0000-0000-000000000111',
      '00000000-0000-0000-0000-000000000405',
      '00000000-0000-0000-0000-000000000201',
      'credit',
      -1,
      1,
      'INR'
    );
  $$,
  '23514',
  NULL,
  'negative amount rejected'
);

-- ============================================================
-- 8. ZERO EXCHANGE RATE
-- ============================================================

select throws_ok(
  $$
    insert into public.transaction_entries (
      id,
      user_id,
      transaction_id,
      account_id,
      entry_type,
      amount,
      account_amount,
      currency,
      exchange_rate
    )
    values (
      '00000000-0000-0000-0000-000000000508',
      '00000000-0000-0000-0000-000000000111',
      '00000000-0000-0000-0000-000000000405',
      '00000000-0000-0000-0000-000000000201',
      'credit',
      10,
      10,
      'INR',
      0
    );
  $$,
  '23514',
  NULL,
  'zero exchange rate rejected'
);

-- ============================================================
-- 9. NEGATIVE EXCHANGE RATE
-- ============================================================

select throws_ok(
  $$
    insert into public.transaction_entries (
      id,
      user_id,
      transaction_id,
      account_id,
      entry_type,
      amount,
      account_amount,
      currency,
      exchange_rate
    )
    values (
      '00000000-0000-0000-0000-000000000509',
      '00000000-0000-0000-0000-000000000111',
      '00000000-0000-0000-0000-000000000405',
      '00000000-0000-0000-0000-000000000201',
      'credit',
      10,
      10,
      'INR',
      -1
    );
  $$,
  '23514',
  NULL,
  'negative exchange rate rejected'
);

-- ============================================================
-- 10. INVALID CURRENCY
-- ============================================================

select throws_ok(
  $$
    insert into public.accounts (
      id,
      user_id,
      name,
      account_type,
      currency
    )
    values (
      '00000000-0000-0000-0000-000000000204',
      '00000000-0000-0000-0000-000000000111',
      'Bad Currency',
      'bank',
      'inr'
    );
  $$,
  '23514',
  NULL,
  'lowercase currency rejected'
);

-- ============================================================
-- 11. INVALID ACCOUNT TYPE
-- ============================================================

select throws_ok(
  $$
    insert into public.accounts (
      id,
      user_id,
      name,
      account_type,
      currency
    )
    values (
      '00000000-0000-0000-0000-000000000205',
      '00000000-0000-0000-0000-000000000111',
      'Bad Type',
      'crypto_wallet',
      'INR'
    );
  $$,
  '23514',
  NULL,
  'invalid account type rejected'
);

-- ============================================================
-- 12. BLANK ACCOUNT NAME
-- ============================================================

select throws_ok(
  $$
    insert into public.accounts (
      id,
      user_id,
      name,
      account_type,
      currency
    )
    values (
      '00000000-0000-0000-0000-000000000206',
      '00000000-0000-0000-0000-000000000111',
      '   ',
      'bank',
      'INR'
    );
  $$,
  '23514',
  NULL,
  'blank account name rejected'
);

-- ============================================================
-- 13. BLANK CATEGORY NAME
-- ============================================================

select throws_ok(
  $$
    insert into public.categories (
      id,
      user_id,
      name,
      category_type
    )
    values (
      '00000000-0000-0000-0000-000000000304',
      '00000000-0000-0000-0000-000000000111',
      '   ',
      'expense'
    );
  $$,
  '23514',
  NULL,
  'blank category name rejected'
);

-- ============================================================
-- 14. CATEGORY HIERARCHY
-- ============================================================

insert into public.categories (
  id,
  user_id,
  name,
  category_type
)
values (
  '00000000-0000-0000-0000-000000000305',
  '00000000-0000-0000-0000-000000000111',
  'Parent Category',
  'expense'
);

insert into public.categories (
  id,
  user_id,
  parent_id,
  name,
  category_type
)
values (
  '00000000-0000-0000-0000-000000000306',
  '00000000-0000-0000-0000-000000000111',
  '00000000-0000-0000-0000-000000000305',
  'Child Category',
  'expense'
);

select is(
  (
    select parent_id
    from public.categories
    where id = '00000000-0000-0000-0000-000000000306'
  ),
  '00000000-0000-0000-0000-000000000305'::uuid,
  'category hierarchy works'
);

-- ============================================================
-- 15. DUPLICATE CATEGORY
-- ============================================================

select throws_ok(
  $$
    insert into public.categories (
      id,
      user_id,
      name,
      category_type
    )
    values (
      '00000000-0000-0000-0000-000000000307',
      '00000000-0000-0000-0000-000000000111',
      'edge food',
      'expense'
    );
  $$,
  '23505',
  NULL,
  'duplicate category name rejected case-insensitively'
);

-- ============================================================
-- 16. SAME CATEGORY NAME UNDER DIFFERENT PARENT
-- ============================================================

insert into public.categories (
  id,
  user_id,
  parent_id,
  name,
  category_type
)
values (
  '00000000-0000-0000-0000-000000000308',
  '00000000-0000-0000-0000-000000000111',
  '00000000-0000-0000-0000-000000000305',
  'Edge Food',
  'expense'
);

select ok(
  true,
  'same category name under different parent allowed'
);

-- ============================================================
-- 17. SELF-REFERENCING CATEGORY
-- ============================================================
--
-- IMPORTANT:
-- Current schema allows this.
-- This is a discovered schema gap, not a passing validation.
-- ============================================================

insert into public.categories (
  id,
  user_id,
  parent_id,
  name,
  category_type
)
values (
  '00000000-0000-0000-0000-000000000309',
  '00000000-0000-0000-0000-000000000111',
  '00000000-0000-0000-0000-000000000309',
  'Self Category',
  'expense'
);

select is(
  (
    select parent_id
    from public.categories
    where id = '00000000-0000-0000-0000-000000000309'
  ),
  '00000000-0000-0000-0000-000000000309'::uuid,
  'self-referencing category is currently allowed'
);

-- ============================================================
-- 18. CROSS-USER ACCOUNT
-- ============================================================

select throws_ok(
  $$
    insert into public.transactions (
      id,
      user_id,
      transaction_type
    )
    values (
      '00000000-0000-0000-0000-000000000410',
      '00000000-0000-0000-0000-000000000111',
      'adjustment'
    );

    insert into public.transaction_entries (
      id,
      user_id,
      transaction_id,
      account_id,
      entry_type,
      amount,
      account_amount,
      currency
    )
    values (
      '00000000-0000-0000-0000-000000000510',
      '00000000-0000-0000-0000-000000000111',
      '00000000-0000-0000-0000-000000000410',
      '00000000-0000-0000-0000-000000000203',
      'debit',
      10,
      10,
      'INR'
    );
  $$,
  '23503',
  NULL,
  'cross-user account reference rejected'
);

-- ============================================================
-- 19. CROSS-USER CATEGORY
-- ============================================================

select throws_ok(
  $$
    insert into public.transactions (
      id,
      user_id,
      transaction_type
    )
    values (
      '00000000-0000-0000-0000-000000000411',
      '00000000-0000-0000-0000-000000000111',
      'expense'
    );

    insert into public.transaction_entries (
      id,
      user_id,
      transaction_id,
      account_id,
      category_id,
      entry_type,
      amount,
      account_amount,
      currency
    )
    values (
      '00000000-0000-0000-0000-000000000511',
      '00000000-0000-0000-0000-000000000111',
      '00000000-0000-0000-0000-000000000411',
      '00000000-0000-0000-0000-000000000201',
      '00000000-0000-0000-0000-000000000303',
      'debit',
      10,
      10,
      'INR'
    );
  $$,
  '23503',
  NULL,
  'cross-user category reference rejected'
);

-- ============================================================
-- 20. DUPLICATE MERCHANT
-- ============================================================

insert into public.merchants (
  id,
  user_id,
  name,
  normalized_name
)
values (
  '00000000-0000-0000-0000-000000000601',
  '00000000-0000-0000-0000-000000000111',
  'Amazon',
  'amazon'
);

select throws_ok(
  $$
    insert into public.merchants (
      id,
      user_id,
      name,
      normalized_name
    )
    values (
      '00000000-0000-0000-0000-000000000602',
      '00000000-0000-0000-0000-000000000111',
      'AMAZON',
      'AMAZON'
    );
  $$,
  '23505',
  NULL,
  'duplicate merchant normalized name rejected'
);

-- ============================================================
-- 21. DUPLICATE TAG
-- ============================================================

insert into public.tags (
  id,
  user_id,
  name
)
values (
  '00000000-0000-0000-0000-000000000701',
  '00000000-0000-0000-0000-000000000111',
  'Important'
);

select throws_ok(
  $$
    insert into public.tags (
      id,
      user_id,
      name
    )
    values (
      '00000000-0000-0000-0000-000000000702',
      '00000000-0000-0000-0000-000000000111',
      'important'
    );
  $$,
  '23505',
  NULL,
  'duplicate tag name rejected case-insensitively'
);

-- ============================================================
-- 22. RECURRING END DATE
-- ============================================================

select throws_ok(
  $$
    insert into public.recurring_transactions (
      id,
      user_id,
      name,
      transaction_type,
      frequency,
      interval_count,
      start_date,
      end_date,
      next_occurrence_date
    )
    values (
      '00000000-0000-0000-0000-000000000801',
      '00000000-0000-0000-0000-000000000111',
      'Invalid Recurring',
      'expense',
      'monthly',
      1,
      '2026-09-30',
      '2026-09-01',
      '2026-09-30'
    );
  $$,
  '23514',
  NULL,
  'recurring end date before start date rejected'
);

-- ============================================================
-- 23. BUDGET END DATE
-- ============================================================

select throws_ok(
  $$
    insert into public.budgets (
      id,
      user_id,
      name,
      amount,
      currency,
      period_type,
      start_date,
      end_date
    )
    values (
      '00000000-0000-0000-0000-000000000901',
      '00000000-0000-0000-0000-000000000111',
      'Invalid Budget',
      10000,
      'INR',
      'monthly',
      '2026-09-30',
      '2026-09-01'
    );
  $$,
  '23514',
  NULL,
  'budget end date before start date rejected'
);

-- ============================================================
-- 24. DUPLICATE BUDGET CATEGORY
-- ============================================================

insert into public.budgets (
  id,
  user_id,
  name,
  amount,
  currency,
  period_type,
  start_date,
  end_date
)
values (
  '00000000-0000-0000-0000-000000000902',
  '00000000-0000-0000-0000-000000000111',
  'Edge Budget',
  10000,
  'INR',
  'monthly',
  '2026-09-01',
  '2026-09-30'
);

insert into public.budget_categories (
  id,
  user_id,
  budget_id,
  category_id,
  amount
)
values (
  '00000000-0000-0000-0000-000000000903',
  '00000000-0000-0000-0000-000000000111',
  '00000000-0000-0000-0000-000000000902',
  '00000000-0000-0000-0000-000000000301',
  5000
);

select throws_ok(
  $$
    insert into public.budget_categories (
      id,
      user_id,
      budget_id,
      category_id,
      amount
    )
    values (
      '00000000-0000-0000-0000-000000000904',
      '00000000-0000-0000-0000-000000000111',
      '00000000-0000-0000-0000-000000000902',
      '00000000-0000-0000-0000-000000000301',
      3000
    );
  $$,
  '23505',
  NULL,
  'duplicate budget category rejected'
);

-- ============================================================
-- 25. ZERO GOAL TARGET
-- ============================================================

select throws_ok(
  $$
    insert into public.goals (
      id,
      user_id,
      name,
      target_amount,
      currency
    )
    values (
      '00000000-0000-0000-0000-000000001001',
      '00000000-0000-0000-0000-000000000111',
      'Invalid Goal',
      0,
      'INR'
    );
  $$,
  '23514',
  NULL,
  'zero goal target rejected'
);

-- ============================================================
-- 26. NEGATIVE GOAL CONTRIBUTION
-- ============================================================
--
-- Use a valid goal first.
-- ============================================================

insert into public.goals (
  id,
  user_id,
  name,
  target_amount,
  currency
)
values (
  '00000000-0000-0000-0000-000001001002',
  '00000000-0000-0000-0000-000000000111',
  'Contribution Test Goal',
  10000,
  'INR'
);

select throws_ok(
  $$
    insert into public.goal_contributions (
      id,
      user_id,
      goal_id,
      amount
    )
    values (
      '00000000-0000-0000-0000-000001001003',
      '00000000-0000-0000-0000-000000000111',
      '00000000-0000-0000-0000-000001001002',
      -10
    );
  $$,
  '23514',
  NULL,
  'negative goal contribution rejected'
);

-- ============================================================
-- 27. ATTACHMENT WITHOUT TARGET
-- ============================================================

select throws_ok(
  $$
    insert into public.attachments (
      id,
      user_id,
      storage_path,
      file_name
    )
    values (
      '00000000-0000-0000-0000-000000001101',
      '00000000-0000-0000-0000-000000000111',
      'edge/file.pdf',
      'file.pdf'
    );
  $$,
  '23514',
  NULL,
  'attachment without transaction or entry rejected'
);

-- ============================================================
-- 28. NEGATIVE ATTACHMENT SIZE
-- ============================================================

select throws_ok(
  $$
    insert into public.attachments (
      id,
      user_id,
      transaction_id,
      storage_path,
      file_name,
      file_size_bytes
    )
    values (
      '00000000-0000-0000-0000-000000001102',
      '00000000-0000-0000-0000-000000000111',
      '00000000-0000-0000-0000-000000000405',
      'edge/file.pdf',
      'file.pdf',
      -1
    );
  $$,
  '23514',
  NULL,
  'negative attachment file size rejected'
);

-- ============================================================
-- 29. TRANSACTION → ENTRY CASCADE
-- ============================================================

insert into public.transactions (
  id,
  user_id,
  transaction_type
)
values (
  '00000000-0000-0000-0000-000000001201',
  '00000000-0000-0000-0000-000000000111',
  'adjustment'
);

insert into public.transaction_entries (
  id,
  user_id,
  transaction_id,
  account_id,
  entry_type,
  amount,
  account_amount,
  currency
)
values (
  '00000000-0000-0000-0000-000000001202',
  '00000000-0000-0000-0000-000000000111',
  '00000000-0000-0000-0000-000000001201',
  '00000000-0000-0000-0000-000000000201',
  'debit',
  10,
  10,
  'INR'
);

delete from public.transactions
where id = '00000000-0000-0000-0000-000000001201';

select is(
  (
    select count(*)
    from public.transaction_entries
    where id = '00000000-0000-0000-0000-000000001202'
  ),
  0::bigint,
  'transaction deletion cascades to entries'
);

-- ============================================================
-- 30. ACCOUNT DELETION RESTRICTED
-- ============================================================

select throws_ok(
  $$
    delete from public.accounts
    where id = '00000000-0000-0000-0000-000000000201';
  $$,
  '23503',
  NULL,
  'account referenced by transaction entry cannot be deleted'
);

-- ============================================================
-- 31. CATEGORY DELETION RESTRICTED
-- ============================================================

select throws_ok(
  $$
    delete from public.categories
    where id = '00000000-0000-0000-0000-000000000301';
  $$,
  '23503',
  NULL,
  'category referenced by transaction entry cannot be deleted'
);

-- ============================================================
-- 32. CATEGORY WITH CHILDREN RESTRICTED
-- ============================================================

select throws_ok(
  $$
    delete from public.categories
    where id = '00000000-0000-0000-0000-000000000305';
  $$,
  '23503',
  NULL,
  'category with children cannot be deleted'
);

-- ============================================================
-- 33. ACCOUNT LAST FOUR VALIDATION
-- ============================================================

select throws_ok(
  $$
    insert into public.accounts (
      id,
      user_id,
      name,
      account_type,
      currency,
      account_number_last4
    )
    values (
      '00000000-0000-0000-0000-000000001701',
      '00000000-0000-0000-0000-000000000111',
      'Bad Last Four',
      'bank',
      'INR',
      '12AB'
    );
  $$,
  '23514',
  NULL,
  'non-numeric account last four rejected'
);

-- ============================================================
-- 34. DUPLICATE ACCOUNT NAME
-- ============================================================

select throws_ok(
  $$
    insert into public.accounts (
      id,
      user_id,
      name,
      account_type,
      currency
    )
    values (
      '00000000-0000-0000-0000-000000001702',
      '00000000-0000-0000-0000-000000000111',
      'Edge Bank',
      'bank',
      'INR'
    );
  $$,
  '23505',
  NULL,
  'duplicate account name for same user rejected'
);

-- ============================================================
-- 35. FOREIGN-CURRENCY ENTRY
-- ============================================================

insert into public.transactions (
  id,
  user_id,
  transaction_type
)
values (
  '00000000-0000-0000-0000-000000002001',
  '00000000-0000-0000-0000-000000000111',
  'adjustment'
);

insert into public.transaction_entries (
  id,
  user_id,
  transaction_id,
  account_id,
  entry_type,
  amount,
  account_amount,
  currency,
  exchange_rate
)
values (
  '00000000-0000-0000-0000-000000002002',
  '00000000-0000-0000-0000-000000000111',
  '00000000-0000-0000-0000-000000002001',
  '00000000-0000-0000-0000-000000000201',
  'debit',
  100,
  8500,
  'USD',
  85
);

select is(
  (
    select account_amount
    from public.transaction_entries
    where id = '00000000-0000-0000-0000-000000002002'
  ),
  8500::numeric,
  'foreign currency entry preserves account amount'
);

select * from finish();

rollback;
