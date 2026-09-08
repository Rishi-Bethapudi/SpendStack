import {
  ArrowLeftRight,
  LayoutDashboard,
  PiggyBank,
  Repeat,
  Settings,
  Store,
  Tags,
  Target,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Shown in the phone bottom bar. Only the five most-used destinations. */
  primary?: boolean;
  /** Shorter label for the bottom bar, where width is scarce. */
  shortLabel?: string;
}

/**
 * One definition, consumed by the desktop sidebar, the phone bottom bar and
 * the drawer. Adding a route here adds it everywhere.
 */
export const NAV_GROUPS: { heading: string | null; items: NavItem[] }[] = [
  {
    heading: null,
    items: [
      {
        href: '/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        primary: true,
        shortLabel: 'Home',
      },
      {
        href: '/accounts',
        label: 'Accounts',
        icon: Wallet,
        primary: true,
      },
      {
        href: '/transactions',
        label: 'Transactions',
        icon: ArrowLeftRight,
        primary: true,
        shortLabel: 'Activity',
      },
    ],
  },
  {
    heading: 'Planning',
    items: [
      { href: '/budgets', label: 'Budgets', icon: PiggyBank, primary: true },
      { href: '/goals', label: 'Goals', icon: Target },
      { href: '/recurring', label: 'Recurring', icon: Repeat },
    ],
  },
  {
    heading: 'Organise',
    items: [
      { href: '/categories', label: 'Categories', icon: Tags },
      { href: '/merchants', label: 'Merchants', icon: Store },
      { href: '/tags', label: 'Tags', icon: Tags },
    ],
  },
];

export const SETTINGS_ITEM: NavItem = {
  href: '/settings',
  label: 'Settings',
  icon: Settings,
};

export const ALL_NAV_ITEMS: NavItem[] = [
  ...NAV_GROUPS.flatMap((group) => group.items),
  SETTINGS_ITEM,
];

/** The bottom bar carries four routes plus a "More" trigger. */
export const PRIMARY_NAV_ITEMS = ALL_NAV_ITEMS.filter((item) => item.primary).slice(0, 4);

/**
 * A nav item is active on its own route and on nested routes beneath it, so
 * /accounts/[id] keeps Accounts highlighted. /dashboard matches exactly to
 * avoid matching everything.
 */
export function isRouteActive(pathname: string, href: string): boolean {
  if (href === '/dashboard') return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function currentNavItem(pathname: string): NavItem | undefined {
  return [...ALL_NAV_ITEMS]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => isRouteActive(pathname, item.href));
}
