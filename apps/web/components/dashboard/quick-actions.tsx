import Link from 'next/link';
import { ArrowLeftRight, PiggyBank, Plus, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ACTIONS = [
  { href: '/transactions/new', label: 'Add transaction', icon: Plus, primary: true },
  { href: '/transactions/new?type=transfer', label: 'Transfer', icon: ArrowLeftRight },
  { href: '/accounts/new', label: 'Add account', icon: Wallet },
  { href: '/budgets/new', label: 'Add budget', icon: PiggyBank },
];

/**
 * Horizontally scrollable on phones rather than wrapped, so the row height
 * stays fixed and the dashboard below does not shift.
 */
export function QuickActions() {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 sm:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.href}
            asChild
            size="sm"
            variant={action.primary ? 'default' : 'outline'}
            className="h-9 shrink-0"
          >
            <Link href={action.href}>
              <Icon className="size-4" aria-hidden="true" />
              {action.label}
            </Link>
          </Button>
        );
      })}
    </div>
  );
}
