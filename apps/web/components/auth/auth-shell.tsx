import Link from 'next/link';
import { Brand } from '@/components/layout/brand';

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  /** Rendered under the card: the link to the opposite flow. */
  footer: React.ReactNode;
}

/**
 * Single-column and centred. No marketing hero — someone reaching this screen
 * has already decided to sign in.
 */
export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface-sunken">
      <header className="flex h-16 items-center px-5 sm:px-8">
        <Brand href="/" />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-[25rem] space-y-6">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="text-pretty text-sm text-muted-foreground">{subtitle}</p>
          </div>

          <div className="rounded-lg border border-border bg-surface p-5 sm:p-6">
            {children}
          </div>

          <p className="text-center text-sm text-muted-foreground">{footer}</p>
        </div>
      </main>

      <footer className="px-5 py-6 text-center text-xs text-muted-foreground sm:px-8">
        <Link href="/" className="rounded transition-colors hover:text-foreground">
          SpendStack
        </Link>
      </footer>
    </div>
  );
}
