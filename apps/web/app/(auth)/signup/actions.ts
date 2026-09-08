"use server";

import { signupSchema } from "@spendstack/validation";
import { signUp } from "@/lib/auth/auth";

export type SignupActionState = {
  success: boolean;
  error: string | null;
};

export const initialSignupState: SignupActionState = {
  success: false,
  error: null,
};

export async function signupAction(
  _previousState: SignupActionState,
  formData: FormData,
): Promise<SignupActionState> {
  const result = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const response = await signUp(result.data);

  if (response.error) {
    return {
      success: false,
      error: response.error,
    };
  }

  return {
    success: true,
    error: null,
  };
}