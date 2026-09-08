
begin;

select plan(33);

-- ============================================================
-- TEST USERS
-- ============================================================

insert into auth.users (
  id,
  email,
  raw_user_meta_data
)
values (
  'e1e2e3e4-1111-2222-3333-444455556666',
  'rls-user-b@spendstack.local',
  '{"display_name":"RLS User B"}'
)
on conflict (id) do nothing;


-- ============================================================
-- USER A
-- ============================================================

select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub',
    'd0e3c8f0-1234-5678-9abc-def012345678'
  )::text,
  true
);

set local role authenticated;


-- ============================================================
-- 1. AUTH UID
-- ============================================================

select is(
  auth.uid(),
  'd0e3c8f0-1234-5678-9abc-def012345678'::uuid,
  'authenticated JWT resolves to User A'
);


-- ============================================================
-- 2. USER A CAN SEE OWN ACCOUNTS
-- ============================================================

select ok(
  exists (
    select 1
    from public.accounts
    where user_id = auth.uid()
  ),
  'User A can see their own accounts'
);


-- ============================================================
-- 3. USER A CANNOT SEE USER B ACCOUNTS
-- ============================================================

select is(
  (
    select count(*)
    from public.accounts
    where user_id = 'e1e2e3e4-1111-2222-3333-444455556666'
  ),
  0::bigint,
  'User A cannot see User B accounts'
);


-- ============================================================
-- 4. USER A CAN INSERT OWN ACCOUNT
-- ============================================================

select lives_ok(
  $$
    insert into public.accounts (
      user_id,
      name,
      account_type,
      currency
    )
    values (
      'd0e3c8f0-1234-5678-9abc-def012345678',
      'RLS Test Account A',
      'bank',
      'INR'
    )
  $$,
  'User A can insert their own account'
);


-- ============================================================
-- 5. USER A CANNOT INSERT USER B ACCOUNT
-- ============================================================

select throws_ok(
  $$
    insert into public.accounts (
      user_id,
      name,
      account_type,
      currency
    )
    values (
      'e1e2e3e4-1111-2222-3333-444455556666',
      'Illegal Account B',
      'bank',
      'INR'
    )
  $$,
  '42501',
  null,
  'User A cannot insert an account belonging to User B'
);


-- ============================================================
-- 6. USER A CANNOT UPDATE USER B ACCOUNT
-- ============================================================

select lives_ok(
  $$
    update public.accounts
    set name = 'Should Not Update'
    where user_id = 'e1e2e3e4-1111-2222-3333-444455556666'
  $$,
  'User A update of User B account does not error'
);

select is(
  (
    select name
    from public.accounts
    where user_id = 'e1e2e3e4-1111-2222-3333-444455556666'
    limit 1
  ),
  null,
  'User A cannot observe User B account after update attempt'
);


-- ============================================================
-- 7. USER A CANNOT DELETE USER B ACCOUNT
-- ============================================================

select lives_ok(
  $$
    delete from public.accounts
    where user_id = 'e1e2e3e4-1111-2222-3333-444455556666'
  $$,
  'User A delete of User B account does not error'
);

select is(
  (
    select count(*)
    from public.accounts
    where user_id = 'e1e2e3e4-1111-2222-3333-444455556666'
  ),
  0::bigint,
  'User A still cannot access User B accounts after delete attempt'
);


-- ============================================================
-- 8. USER A CANNOT CHANGE OWNERSHIP
-- ============================================================

select throws_ok(
  $$
    update public.accounts
    set user_id = 'e1e2e3e4-1111-2222-3333-444455556666'
    where name = 'RLS Test Account A'
  $$,
  '42501',
  null,
  'User A cannot transfer account ownership to User B'
);


-- ============================================================
-- 9. USER A CANNOT SEE USER B CATEGORIES
-- ============================================================

select is(
  (
    select count(*)
    from public.categories
    where user_id = 'e1e2e3e4-1111-2222-3333-444455556666'
  ),
  0::bigint,
  'User A cannot see User B categories'
);


-- ============================================================
-- 10. USER A CANNOT SEE USER B MERCHANTS
-- ============================================================

select is(
  (
    select count(*)
    from public.merchants
    where user_id = 'e1e2e3e4-1111-2222-3333-444455556666'
  ),
  0::bigint,
  'User A cannot see User B merchants'
);


-- ============================================================
-- 11. USER A CANNOT SEE USER B TRANSACTIONS
-- ============================================================

select is(
  (
    select count(*)
    from public.transactions
    where user_id = 'e1e2e3e4-1111-2222-3333-444455556666'
  ),
  0::bigint,
  'User A cannot see User B transactions'
);


-- ============================================================
-- 12. USER A CANNOT SEE USER B TRANSACTION ENTRIES
-- ============================================================

select is(
  (
    select count(*)
    from public.transaction_entries
    where user_id = 'e1e2e3e4-1111-2222-3333-444455556666'
  ),
  0::bigint,
  'User A cannot see User B transaction entries'
);


-- ============================================================
-- 13. USER A CANNOT SEE USER B RECURRING TRANSACTIONS
-- ============================================================

select is(
  (
    select count(*)
    from public.recurring_transactions
    where user_id = 'e1e2e3e4-1111-2222-3333-444455556666'
  ),
  0::bigint,
  'User A cannot see User B recurring transactions'
);


-- ============================================================
-- 14. USER A CANNOT SEE USER B RECURRING ENTRIES
-- ============================================================

select is(
  (
    select count(*)
    from public.recurring_transaction_entries
    where user_id = 'e1e2e3e4-1111-2222-3333-444455556666'
  ),
  0::bigint,
  'User A cannot see User B recurring entries'
);


-- ============================================================
-- 15. USER A CANNOT SEE USER B BUDGETS
-- ============================================================

select is(
  (
    select count(*)
    from public.budgets
    where user_id = 'e1e2e3e4-1111-2222-3333-444455556666'
  ),
  0::bigint,
  'User A cannot see User B budgets'
);


-- ============================================================
-- 16. USER A CANNOT SEE USER B BUDGET CATEGORIES
-- ============================================================

select is(
  (
    select count(*)
    from public.budget_categories
    where user_id = 'e1e2e3e4-1111-2222-3333-444455556666'
  ),
  0::bigint,
  'User A cannot see User B budget categories'
);


-- ============================================================
-- 17. USER A CANNOT SEE USER B GOALS
-- ============================================================

select is(
  (
    select count(*)
    from public.goals
    where user_id = 'e1e2e3e4-1111-2222-3333-444455556666'
  ),
  0::bigint,
  'User A cannot see User B goals'
);


-- ============================================================
-- 18. USER A CANNOT SEE USER B GOAL CONTRIBUTIONS
-- ============================================================

select is(
  (
    select count(*)
    from public.goal_contributions
    where user_id = 'e1e2e3e4-1111-2222-3333-444455556666'
  ),
  0::bigint,
  'User A cannot see User B goal contributions'
);


-- ============================================================
-- 19. USER A CANNOT SEE USER B TAGS
-- ============================================================

select is(
  (
    select count(*)
    from public.tags
    where user_id = 'e1e2e3e4-1111-2222-3333-444455556666'
  ),
  0::bigint,
  'User A cannot see User B tags'
);


-- ============================================================
-- 20. USER A CANNOT SEE USER B TRANSACTION TAGS
-- ============================================================

select is(
  (
    select count(*)
    from public.transaction_tags
    where user_id = 'e1e2e3e4-1111-2222-3333-444455556666'
  ),
  0::bigint,
  'User A cannot see User B transaction tags'
);


-- ============================================================
-- 21. USER A CANNOT SEE USER B ATTACHMENTS
-- ============================================================

select is(
  (
    select count(*)
    from public.attachments
    where user_id = 'e1e2e3e4-1111-2222-3333-444455556666'
  ),
  0::bigint,
  'User A cannot see User B attachments'
);


-- ============================================================
-- 22. USER A CAN READ OWN PROFILE
-- ============================================================

select is(
  (
    select count(*)
    from public.profiles
    where id = auth.uid()
  ),
  1::bigint,
  'User A can read their own profile'
);


-- ============================================================
-- 23. USER A CANNOT READ USER B PROFILE
-- ============================================================

select is(
  (
    select count(*)
    from public.profiles
    where id = 'e1e2e3e4-1111-2222-3333-444455556666'
  ),
  0::bigint,
  'User A cannot read User B profile'
);


-- ============================================================
-- 24. USER A CAN UPDATE OWN PROFILE
-- ============================================================

select lives_ok(
  $$
    update public.profiles
    set display_name = 'RLS Test User A'
    where id = auth.uid()
  $$,
  'User A can update their own profile'
);


-- ============================================================
-- 25. USER A CANNOT UPDATE USER B PROFILE
-- ============================================================

select lives_ok(
  $$
    update public.profiles
    set display_name = 'Illegal Update'
    where id = 'e1e2e3e4-1111-2222-3333-444455556666'
  $$,
  'User A update of User B profile does not error'
);


-- ============================================================
-- 26. USER A CANNOT DELETE PROFILE
-- ============================================================

select lives_ok(
  $$
    delete from public.profiles
    where id = 'd0e3c8f0-1234-5678-9abc-def012345678';
  $$,
  'User A delete profile attempt does not raise an error'
);

select is(
  (
    select count(*)::integer
    from public.profiles
    where id = 'd0e3c8f0-1234-5678-9abc-def012345678'
  ),
  1,
  'User A profile still exists after delete attempt'
);


-- ============================================================
-- SWITCH TO USER B
-- ============================================================

reset role;

select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub',
    'e1e2e3e4-1111-2222-3333-444455556666'
  )::text,
  true
);

set local role authenticated;


-- ============================================================
-- 27. USER B CAN SEE OWN PROFILE
-- ============================================================

select is(
  (
    select count(*)
    from public.profiles
    where id = auth.uid()
  ),
  1::bigint,
  'User B can see their own profile'
);


-- ============================================================
-- 28. USER B CANNOT SEE USER A ACCOUNTS
-- ============================================================

select is(
  (
    select count(*)
    from public.accounts
    where user_id = 'd0e3c8f0-1234-5678-9abc-def012345678'
  ),
  0::bigint,
  'User B cannot see User A accounts'
);


-- ============================================================
-- 29. USER B CAN INSERT OWN ACCOUNT
-- ============================================================

select lives_ok(
  $$
    insert into public.accounts (
      user_id,
      name,
      account_type,
      currency
    )
    values (
      'e1e2e3e4-1111-2222-3333-444455556666',
      'RLS Test Account B',
      'bank',
      'INR'
    )
  $$,
  'User B can insert their own account'
);


-- ============================================================
-- 30. USER B CANNOT INSERT USER A ACCOUNT
-- ============================================================

select throws_ok(
  $$
    insert into public.accounts (
      user_id,
      name,
      account_type,
      currency
    )
    values (
      'd0e3c8f0-1234-5678-9abc-def012345678',
      'Illegal Account A',
      'bank',
      'INR'
    )
  $$,
  '42501',
  null,
  'User B cannot insert an account belonging to User A'
);


select * from finish();

rollback;
