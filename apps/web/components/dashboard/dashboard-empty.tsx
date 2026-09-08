import Link from 'next/link';
import { ArrowRight, PiggyBank, Target, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Shown when a user has recorded nothing at all. The alternative — charts
 * with zeroed axes and four empty cards — implies something is broken.
 *
 * These genuinely are sequential: an account has to exist before a
 * transaction can post to it, so numbering is information here rather than
 * decoration.
 */
const STEPS = [
  {
    href: '/accounts/new',
    icon: Wallet,
    title: 'Add an account',
    description: 'A bank account, card, or the cash in your wallet.',
    cta: 'Add account',
  },
  {
    href: '/transactions/new',
    icon: ArrowRight,
    title: 'Record a transaction',
    description: 'Something you spent or received. Balances follow from here.',
    cta: 'Add transaction',
  },
  {
    href: '/budgets/new',
    icon: PiggyBank,
    title: 'Set a budget',
    description: 'Give a category a limit and watch spending against it.',
    cta: 'Create budget',
  },
  {
    href: '/goals/new',
    icon: Target,
    title: 'Name a goal',
    description: 'Something you are saving towards, with an amount.',
    cta: 'Create goal',
  },
];

export function DashboardEmpty() {
  return (
    <div className="mx-auto max-w-2xl py-6 sm:py-12">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Let&rsquo;s get your first numbers in
        </h2>
        <p className="text-pretty text-sm text-muted-foreground">
          Your balances, spending and goals will appear here once there is
          something to show.
        </p>
      </div>

      <ol className="mt-8 space-y-3">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <li
              key={step.href}
              className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <Icon className="size-4" aria-hidden="true" />
              </span>

              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-sm font-medium">
                  <span className="tnum mr-1.5 text-muted-foreground">{index + 1}.</span>
                  {step.title}
                </p>
                <p className="text-pretty text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>

              <Button
                asChild
                size="sm"
                variant={index === 0 ? 'default' : 'outline'}
                className="h-touch shrink-0 sm:h-9"
              >
                <Link href={step.href}>{step.cta}</Link>
              </Button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
