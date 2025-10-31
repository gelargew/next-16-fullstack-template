// Import schemas from clean, feature-based files
import * as authSchema from "./auth";


export const schema = {
  ...authSchema,

};

// Re-export individual schemas for convenience
export const {
  // Auth schemas
  user,
  session,
  account,
  verification,
  // Core schemas
} = schema;

// Export types for better developer experience
export type {
  User,
  NewUser,
  Session,
  NewSession,
  Account,
  NewAccount,
  Verification,
  NewVerification,
} from "./auth";
