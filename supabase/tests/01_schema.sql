begin;

select plan(15);

select has_table('public', 'profiles', 'profiles table exists');
select has_table('public', 'accounts', 'accounts table exists');
select has_table('public', 'categories', 'categories table exists');
select has_table('public', 'merchants', 'merchants table exists');
select has_table('public', 'transactions', 'transactions table exists');
select has_table('public', 'transaction_entries', 'transaction_entries table exists');
select has_table('public', 'budgets', 'budgets table exists');
select has_table('public', 'budget_categories', 'budget_categories table exists');
select has_table('public', 'recurring_transactions', 'recurring_transactions table exists');
select has_table('public', 'recurring_transaction_entries', 'recurring_transaction_entries table exists');
select has_table('public', 'goals', 'goals table exists');
select has_table('public', 'goal_contributions', 'goal_contributions table exists');
select has_table('public', 'tags', 'tags table exists');
select has_table('public', 'transaction_tags', 'transaction_tags table exists');
select has_table('public', 'attachments', 'attachments table exists');

select * from finish();

rollback;