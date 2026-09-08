'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { ALL_NAV_ITEMS } from './nav';
import { Plus, ArrowLeftRight, Wallet, Target } from 'lucide-react';

interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const QUICK_ACTIONS = [
  { label: 'Add transaction', href: '/transactions/new', icon: Plus },
  { label: 'Transfer money', href: '/transactions/new?type=transfer', icon: ArrowLeftRight },
  { label: 'Add account', href: '/accounts/new', icon: Wallet },
  { label: 'Add goal', href: '/goals/new', icon: Target },
];

/**
 * ── BACKEND INTEGRATION POINT ──────────────────────────────────────────────
 * Navigation and quick actions work today. Searching across transactions,
 * merchants and categories needs a search query or Postgres full-text index,
 * which does not exist yet, so no results group is rendered for it — the
 * menu does not pretend to search records it cannot reach.
 */
export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        onOpenChange(!open);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onOpenChange]);

  function go(href: string) {
    onOpenChange(false);
    router.push(href);
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search SpendStack"
      description="Jump to a page or start an action"
    >
      <CommandInput placeholder="Jump to a page or start an action…" />
      <CommandList>
        <CommandEmpty>Nothing matched that.</CommandEmpty>

        <CommandGroup heading="Actions">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <CommandItem
                key={action.href}
                value={action.label}
                onSelect={() => go(action.href)}
              >
                <Icon className="size-4" aria-hidden="true" />
                {action.label}
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Go to">
          {ALL_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <CommandItem key={item.href} value={item.label} onSelect={() => go(item.href)}>
                <Icon className="size-4" aria-hidden="true" />
                {item.label}
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
