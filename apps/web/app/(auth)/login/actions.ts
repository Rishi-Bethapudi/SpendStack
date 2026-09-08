"use server";

import { redirect } from "next/navigation";
import { loginSchema } from "@spendstack/validation";
import { signIn as signInUser } from "@/lib/auth/auth";
import {
  authError,
  type AuthFormState,
} from "@/lib/auth/form-state";

export async function signIn(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const result = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!result.success) {
    return authError(
      "Please correct the errors below.",
      result.error.flatten().fieldErrors,
    );
  }

  const response = await signInUser(result.data);

  if (response.error) {
    return authError(response.error);
  }

  redirect("/dashboard");
}