// Import schemas from clean, feature-based files
import * as authSchema from "./auth";
import * as productsSchema from "./products";


export const schema = {
  ...authSchema,
  ...productsSchema,

};

// Re-export individual schemas for convenience
export const {
  // Auth schemas
  user,
  session,
  account,
  verification,
  // Product schemas
  product,
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
export type {
  Product,
  NewProduct,
} from "./products";

// Export Zod schemas for validation
export {
  userSelectSchema,
  userInsertSchema,
  sessionSelectSchema,
  sessionInsertSchema,
  accountSelectSchema,
  accountInsertSchema,
  verificationSelectSchema,
  verificationInsertSchema,
  createUserSchema,
  updateUserSchema,
} from "./auth";
export {
  productSelectSchema,
  productInsertSchema,
  createProductSchema,
  updateProductSchema,
} from "./products";
