import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * The mark is a stacked bar — three ascending segments, reading as both a
 * stack and a small chart. Drawn rather than imported so it inherits colour
 * and works in both themes.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn('size-6 text-primary', className)}
    >
      <rect x="3" y="14.5" width="18" height="5" rx="1.5" fill="currentColor" />
      <rect x="5.5" y="8.5" width="13" height="4.5" rx="1.5" fill="currentColor" opacity="0.72" />
      <rect x="8" y="3" width="8" height="4" rx="1.5" fill="currentColor" opacity="0.44" />
    </svg>
  );
}

export function Brand({
  href = '/dashboard',
  className,
  showWordmark = true,
}: {
  href?: string;
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-2 rounded-md text-foreground transition-opacity hover:opacity-80',
        className,
      )}
    >
      <BrandMark />
      {showWordmark ? (
        <span className="text-[0.9375rem] font-semibold tracking-tight">SpendStack</span>
      ) : (
        <span className="sr-only">SpendStack</span>
      )}
    </Link>
  );
}
