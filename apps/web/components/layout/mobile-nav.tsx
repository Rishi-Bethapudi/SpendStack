'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Plus } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Brand } from './brand';
import { SidebarNav } from './sidebar-nav';
import { PRIMARY_NAV_ITEMS, isRouteActive } from './nav';
import { cn } from '@/lib/utils';

/**
 * Below lg the sidebar is replaced by a fixed bottom bar carrying the four
 * most-used routes, with everything else behind a drawer. The desktop
 * sidebar is never shrunk onto a phone.
 */
export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur-sm lg:hidden"
    >
      <ul className="grid grid-cols-5">
        {PRIMARY_NAV_ITEMS.map((item) => {
          const active = isRouteActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'h-touch flex flex-col items-center justify-center gap-1 py-2 text-[0.6875rem] transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                <span className={cn(active && 'font-medium')}>
                  {item.shortLabel ?? item.label}
                </span>
              </Link>
            </li>
          );
        })}

        <li>
          <MobileNavDrawer />
        </li>
      </ul>
    </nav>
  );
}

function MobileNavDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="h-touch flex w-full flex-col items-center justify-center gap-1 py-2 text-[0.6875rem] text-muted-foreground"
        >
          <Menu className="size-5" aria-hidden="true" />
          <span>More</span>
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[min(20rem,85vw)] p-0">
        <SheetHeader className="h-14 justify-center border-b border-border px-5 text-left">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Brand />
        </SheetHeader>
        <div className="overflow-y-auto py-4">
          <SidebarNav onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

/**
 * Floating compose button. Sits above the bottom bar and clear of the home
 * indicator on devices with a safe area.
 */
export function MobileAddButton({ onClick }: { onClick?: () => void }) {
  return (
    <Button
      size="icon"
      onClick={onClick}
      aria-label="Add transaction"
      className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] right-4 z-40 size-12 rounded-full shadow-overlay lg:hidden"
    >
      <Plus className="size-5" aria-hidden="true" />
    </Button>
  );
}
