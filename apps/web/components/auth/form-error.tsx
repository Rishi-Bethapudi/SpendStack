import { AlertCircle } from 'lucide-react';

/**
 * Form-level failure. Sits above the fields so it is reached before them in
 * reading and tab order. role="alert" announces it on appearance.
 */
export function FormError({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-md border border-danger/30 bg-danger-subtle px-3 py-2.5 text-sm text-danger"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <p className="text-pretty">{message}</p>
    </div>
  );
}
