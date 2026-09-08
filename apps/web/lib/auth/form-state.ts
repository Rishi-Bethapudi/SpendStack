/**
 * ── BACKEND INTEGRATION POINT ──────────────────────────────────────────────
 *
 * The shared return shape for the auth Server Actions in
 * app/(auth)/login/actions.ts and app/(auth)/signup/actions.ts.
 *
 * The forms consume these actions through React's useActionState. If your
 * existing actions currently return something else (or redirect only), adjust
 * them to return this shape on failure so field errors can be rendered
 * inline. Server-side Zod validation stays authoritative — the client schema
 * only provides immediate feedback before the round trip.
 */
export interface AuthFormState {
  /** Form-level failure: invalid credentials, rate limit, network. */
  message: string | null;
  /** Field-level failures keyed by input name, from the Zod flatten result. */
  fieldErrors: Record<string, string[]>;
  /** Set when the action succeeds without redirecting (e.g. confirm email). */
  status?: 'idle' | 'success' | 'email_confirmation_required';
}

export const initialAuthFormState: AuthFormState = {
  message: null,
  fieldErrors: {},
  status: 'idle',
};

/** Convenience for actions: `return authError('Invalid email or password.')` */
export function authError(
  message: string,
  fieldErrors: Record<string, string[]> = {},
): AuthFormState {
  return { message, fieldErrors, status: 'idle' };
}
