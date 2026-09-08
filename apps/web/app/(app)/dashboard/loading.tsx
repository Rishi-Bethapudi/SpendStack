import { Skeleton } from '@/components/ui/skeleton';

/**
 * Mirrors the real layout so the page does not reflow when data lands.
 * Skeletons rather than one large spinner: the shape itself tells you what
 * is arriving.
 */
function SectionSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="rounded-lg border border-border bg-surface">
      <div className="border-b border-border px-4 py-3 sm:px-5">
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="space-y-3 p-4 sm:p-5">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            <Skeleton className="size-9 shrink-0 rounded-md" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-2/5" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-4 w-20 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>

      <div className="rounded-lg border border-border bg-surface p-5 sm:p-6">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="mt-3 h-11 w-64" />
        <Skeleton className="mt-3 h-4 w-40" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionSkeleton rows={3} />
        </div>
        <SectionSkeleton rows={4} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionSkeleton rows={5} />
        </div>
        <SectionSkeleton rows={3} />
      </div>
    </div>
  );
}
