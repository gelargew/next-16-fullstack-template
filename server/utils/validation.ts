import { z } from "zod";

// Convert Zod validation error to validation details
export function zodErrorToValidationDetails(error: any): Array<{
  field: string;
  message: string;
}> {
  // Check if it's a ZodError instance first
  if (error instanceof z.ZodError) {
    // Use issues property (Zod validation errors)
    if (error.issues && Array.isArray(error.issues)) {
      return error.issues.map((err: any) => ({
        field: err.path ? err.path.join('.') : 'unknown',
        message: err.message || 'Validation error',
      }));
    }
    // Last fallback - just the message
    return [{
      field: 'unknown',
      message: error?.message || 'Validation error occurred',
    }];
  }

  // Fallback for non-Zod errors
  return [{
    field: 'unknown',
    message: error?.message || 'Validation error occurred',
  }];
}