import { createClient } from "@/lib/supabase/server";
import type { LoginInput, SignupInput } from "@spendstack/validation";

export async function signUp(input: SignupInput) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
  });

  if (error) {
    return {
      data: null,
      error: error.message,
    };
  }

  return {
    data,
    error: null,
  };
}

export async function signIn(input: LoginInput) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error) {
    return {
      data: null,
      error: error.message,
    };
  }

  return {
    data,
    error: null,
  };
}

export async function signOut() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return {
      error: error.message,
    };
  }

  return {
    error: null,
  };
}

export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return {
      user: null,
      error: error.message,
    };
  }

  return {
    user,
    error: null,
  };
}