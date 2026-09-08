"use server";

import { loginSchema } from "@spendstack/validation";
import { signIn } from "@/lib/auth/auth";

export type LoginActionState = {
  success: boolean;
  error: string | null;
};

export const initialLoginState: LoginActionState = {
  success: false,
  error: null,
};

export async function loginAction(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const result = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const response = await signIn(result.data);

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