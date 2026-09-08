import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold">SpendStack</h1>

        <p className="mt-4 text-gray-600">
          Connected to Supabase successfully.
        </p>

        <p className="mt-4 text-gray-500">You are not authenticated yet.</p>
      </main>
    );
  }

  const { data: accounts, error } = await supabase
    .from('accounts')
    .select('id, name, account_type, currency, opening_balance')
    .order('name');

  if (error) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold">SpendStack</h1>

        <p className="mt-4 text-red-600">Supabase error: {error.message}</p>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">SpendStack</h1>

      <p className="mt-2 text-gray-600">Connected to Supabase successfully.</p>

      <p className="mt-4 text-sm text-gray-500">
        Authenticated as: {user.email}
      </p>

      <div className="mt-8 space-y-3">
        {accounts?.length === 0 && (
          <p className="text-gray-500">No accounts found for this user.</p>
        )}

        {accounts?.map((account) => (
          <div key={account.id} className="rounded-lg border p-4">
            <p className="font-semibold">{account.name}</p>

            <p className="text-sm text-gray-600">
              {account.account_type} · {account.currency}
            </p>

            <p className="text-sm text-gray-500">
              Opening balance: {account.opening_balance}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
