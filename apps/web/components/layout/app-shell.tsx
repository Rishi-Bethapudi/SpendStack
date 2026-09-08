'use client';

import { useState } from 'react';
import { Sidebar } from './sidebar';
import { TopBar } from './top-bar';
import { MobileBottomNav } from './mobile-nav';
import { CommandMenu } from './command-menu';

interface AppShellProps {
  userEmail: string;
  displayName: string | null;
  children: React.ReactNode;
}

/**
 * The authenticated frame. Sidebar and main content each scroll
 * independently on desktop; on phones the whole page scrolls with padding
 * reserved for the fixed bottom bar.
 */
export function AppShell({ userEmail, displayName, children }: AppShellProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="flex min-h-dvh bg-background">
      <Sidebar userEmail={userEmail} displayName={displayName} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          userEmail={userEmail}
          displayName={displayName}
          onOpenSearch={() => setSearchOpen(true)}
        />

        {/* Content is capped so text and tables stay readable on wide
            monitors, rather than stretching to 1920px. */}
        <main className="flex-1 pb-24 lg:pb-0">
          <div className="mx-auto w-full max-w-[85rem] px-4 py-6 sm:px-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>

      <MobileBottomNav />
      <CommandMenu open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
