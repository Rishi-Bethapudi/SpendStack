// Shared Zod validation schemas for SpendStack.
//
// Validation schemas will be added here as application
// inputs and domain models are implemented.
export {
  loginSchema,
  signupSchema,
} from "./auth";

export type {
  LoginInput,
  SignupInput,
} from "./auth";