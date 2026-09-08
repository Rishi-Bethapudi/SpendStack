import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Brand } from '@/components/layout/brand';

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <Brand href="/" />
      <div className="space-y-1.5">
        <h1 className="text-xl font-semibold tracking-tight">Page not found</h1>
        <p className="text-pretty text-sm text-muted-foreground">
          That link may be out of date, or the record may have been deleted.
        </p>
      </div>
      <Button asChild>
        <Link href="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  );
}
