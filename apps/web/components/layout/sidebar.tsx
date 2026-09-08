import { Brand } from './brand';
import { SidebarNav } from './sidebar-nav';
import { UserMenu } from './user-menu';

interface SidebarProps {
  userEmail: string;
  displayName: string | null;
}

/**
 * Desktop only. Fixed width, its own scroll region, so a long nav never
 * pushes the page. Hidden below lg, where MobileNav takes over.
 */
export function Sidebar({ userEmail, displayName }: SidebarProps) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface lg:flex">
      <div className="flex h-14 items-center px-6">
        <Brand />
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        <SidebarNav />
      </div>

      <div className="border-t border-border p-3">
        <UserMenu userEmail={userEmail} displayName={displayName} align="start" side="top" />
      </div>
    </aside>
  );
}
