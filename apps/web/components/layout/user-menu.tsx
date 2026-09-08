'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { ChevronsUpDown, LogOut, Settings, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { signOutAction } from '@/app/(app)/actions';
import { cn } from '@/lib/utils';

interface UserMenuProps {
  userEmail: string;
  displayName: string | null;
  align?: 'start' | 'end';
  side?: 'top' | 'bottom';
  /** Compact renders the avatar alone, for the mobile top bar. */
  compact?: boolean;
}

function initialsFrom(displayName: string | null, email: string): string {
  const source = displayName?.trim() || email;
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  return (parts[0]?.[0] ?? '?').concat(parts[1]?.[0] ?? '').toUpperCase();
}

export function UserMenu({
  userEmail,
  displayName,
  align = 'end',
  side = 'bottom',
  compact = false,
}: UserMenuProps) {
  const [pending, startTransition] = useTransition();
  const initials = initialsFrom(displayName, userEmail);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'flex items-center gap-2.5 rounded-md text-left transition-colors',
          compact
            ? 'size-9 justify-center'
            : 'h-touch w-full px-2 py-1.5 hover:bg-secondary',
        )}
        aria-label="Account menu"
      >
        <Avatar className="size-7 shrink-0">
          <AvatarFallback className="bg-primary/10 text-[0.6875rem] font-medium text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>

        {!compact ? (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-foreground">
                {displayName ?? userEmail.split('@')[0]}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {userEmail}
              </span>
            </span>
            <ChevronsUpDown
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
          </>
        ) : null}
      </DropdownMenuTrigger>

      <DropdownMenuContent align={align} side={side} className="w-56">
        <div className="px-2 py-1.5">
          <p className="truncate text-sm font-medium">
            {displayName ?? userEmail.split('@')[0]}
          </p>
          <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
        </div>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/settings/profile">
            <User className="size-4" aria-hidden="true" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings className="size-4" aria-hidden="true" />
            Settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={pending}
          onSelect={(event) => {
            event.preventDefault();
            startTransition(() => {
              void signOutAction();
            });
          }}
        >
          <LogOut className="size-4" aria-hidden="true" />
          {pending ? 'Signing out…' : 'Sign out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
