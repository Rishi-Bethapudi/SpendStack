"use server";

import { redirect } from "next/navigation";
import { signupSchema } from "@spendstack/validation";
import { signUp as signUpUser } from "@/lib/auth/auth";
import {
  authError,
  type AuthFormState,
} from "@/lib/auth/form-state";

export async function signUp(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const result = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!result.success) {
    return authError(
      "Please correct the errors below.",
      result.error.flatten().fieldErrors,
    );
  }

  const response = await signUpUser(result.data);

  if (response.error) {
    return authError(response.error);
  }

  // Supabase returns a user without a session when email confirmation
  // is required. Show the confirmation state instead of redirecting.
  if (response.data?.user && !response.data.session) {
    return {
      message: null,
      fieldErrors: {},
      status: "email_confirmation_required",
    };
  }

  redirect("/dashboard");
}