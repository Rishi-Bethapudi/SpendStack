'use client';

import { useId } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormFieldProps extends React.ComponentProps<'input'> {
  label: string;
  /** Field errors from the action's flattened Zod result. */
  errors?: string[];
  hint?: string;
}

/**
 * Label, input, hint and error, wired together with aria-describedby and
 * aria-invalid so the error is announced when focus enters the field.
 * Placeholders are never used in place of labels.
 */
export function FormField({
  label,
  errors,
  hint,
  className,
  id: providedId,
  ...props
}: FormFieldProps) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const hasError = Boolean(errors?.length);

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>

      <Input
        id={id}
        aria-invalid={hasError || undefined}
        aria-describedby={cn(hasError && errorId, hint && hintId) || undefined}
        className={cn(hasError && 'border-danger focus-visible:ring-danger', className)}
        {...props}
      />

      {hint && !hasError ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}

      {hasError ? (
        <p id={errorId} className="text-xs text-danger">
          {errors?.[0]}
        </p>
      ) : null}
    </div>
  );
}
