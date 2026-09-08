'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_GROUPS, SETTINGS_ITEM, isRouteActive, type NavItem } from './nav';
import { cn } from '@/lib/utils';

function NavLink({
  item,
  onNavigate,
}: {
  item: NavItem;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = isRouteActive(pathname, item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors',
        active
          ? 'bg-secondary font-medium text-foreground'
          : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
      )}
    >
      {/* The active route is marked by a rule as well as a fill, so it stays
          identifiable without colour. */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute inset-y-1.5 -left-2 w-0.5 rounded-pill bg-primary transition-opacity',
          active ? 'opacity-100' : 'opacity-0',
        )}
      />
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Main" className="flex flex-col gap-5 px-4">
      {NAV_GROUPS.map((group, index) => (
        <div key={group.heading ?? `group-${index}`} className="space-y-1">
          {group.heading ? (
            <p className="px-2.5 pb-1 text-xs text-muted-foreground">{group.heading}</p>
          ) : null}
          {group.items.map((item) => (
            <NavLink key={item.href} item={item} onNavigate={onNavigate} />
          ))}
        </div>
      ))}

      <div className="space-y-1 border-t border-border pt-4">
        <NavLink item={SETTINGS_ITEM} onNavigate={onNavigate} />
      </div>
    </nav>
  );
}
