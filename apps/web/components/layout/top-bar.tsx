'use client';

import { usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import { Brand } from './brand';
import { UserMenu } from './user-menu';
import { currentNavItem } from './nav';
import { Button } from '@/components/ui/button';

interface TopBarProps {
  userEmail: string;
  displayName: string | null;
  onOpenSearch?: () => void;
}

/**
 * Sticky, deliberately sparse. On desktop it holds the search trigger and
 * account menu; on phones it carries the brand instead, since there is no
 * sidebar to hold it.
 */
export function TopBar({ userEmail, displayName, onOpenSearch }: TopBarProps) {
  const pathname = usePathname();
  const active = currentNavItem(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-sm sm:px-6">
      <div className="lg:hidden">
        <Brand showWordmark={false} />
      </div>

      <p className="truncate text-sm font-medium lg:hidden">{active?.label ?? 'SpendStack'}</p>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="outline"
          onClick={onOpenSearch}
          className="hidden h-9 w-56 justify-start gap-2 px-2.5 text-muted-foreground lg:flex xl:w-72"
        >
          <Search className="size-4" aria-hidden="true" />
          <span className="text-sm font-normal">Search</span>
          <kbd className="ml-auto rounded border border-border bg-muted px-1.5 py-0.5 text-[0.6875rem] font-medium">
            ⌘K
          </kbd>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenSearch}
          aria-label="Search"
          className="lg:hidden"
        >
          <Search className="size-5" aria-hidden="true" />
        </Button>

        <div className="lg:hidden">
          <UserMenu userEmail={userEmail} displayName={displayName} compact />
        </div>
      </div>
    </header>
  );
}
