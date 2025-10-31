import type { Session, User } from '@/server/db/schema/auth';

// Authentication options for API routes
export interface AuthOptions {
  // Role-based access control
  requiredRole?: string;

  // Custom error messages
  unauthorizedMessage?: string;
  errorMessage?: string;

  // Session validation options
  validateExpiration?: boolean;

  // Additional custom validation
  customValidator?: (session: any) => boolean | Promise<boolean>;
  customValidationMessage?: string;

  // Logging options
  logAuthAttempts?: boolean;
  logLevel?: 'error' | 'warn' | 'info' | 'debug';
}

// Rate limiting options
export interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
  keyGenerator?: (request: Request, session: any) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

// Authentication context for request handlers
export interface AuthContext {
  session: Session;
  user: User;
  isAuthenticated: boolean;
  permissions: string[];
  roles: string[];
}

// API response types for authentication
export interface AuthSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  user?: User;
}

export interface AuthErrorResponse {
  success: false;
  error: string;
  code: string;
  details?: any;
}

// Authentication error codes
export enum AuthErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  AUTH_ERROR = 'AUTH_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  AUTH_CHECK_ERROR = 'AUTH_CHECK_ERROR',
}

// User role definitions
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
  VIEWER = 'viewer',
}

// Permission definitions
export enum Permission {
  // Brand permissions
  BRAND_READ = 'brand:read',
  BRAND_CREATE = 'brand:create',
  BRAND_UPDATE = 'brand:update',
  BRAND_DELETE = 'brand:delete',

  // Integration permissions
  INTEGRATION_READ = 'integration:read',
  INTEGRATION_CREATE = 'integration:create',
  INTEGRATION_UPDATE = 'integration:update',
  INTEGRATION_DELETE = 'integration:delete',

  // Campaign permissions
  CAMPAIGN_READ = 'campaign:read',
  CAMPAIGN_CREATE = 'campaign:create',
  CAMPAIGN_UPDATE = 'campaign:update',
  CAMPAIGN_DELETE = 'campaign:delete',

  // Admin permissions
  ADMIN_ACCESS = 'admin:access',
  USER_MANAGEMENT = 'user:management',
  SYSTEM_CONFIG = 'system:config',
}

// Role to permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // All permissions
    Permission.BRAND_READ,
    Permission.BRAND_CREATE,
    Permission.BRAND_UPDATE,
    Permission.BRAND_DELETE,
    Permission.INTEGRATION_READ,
    Permission.INTEGRATION_CREATE,
    Permission.INTEGRATION_UPDATE,
    Permission.INTEGRATION_DELETE,
    Permission.CAMPAIGN_READ,
    Permission.CAMPAIGN_CREATE,
    Permission.CAMPAIGN_UPDATE,
    Permission.CAMPAIGN_DELETE,
    Permission.ADMIN_ACCESS,
    Permission.USER_MANAGEMENT,
    Permission.SYSTEM_CONFIG,
  ],
  [UserRole.MODERATOR]: [
    Permission.BRAND_READ,
    Permission.BRAND_CREATE,
    Permission.BRAND_UPDATE,
    Permission.INTEGRATION_READ,
    Permission.INTEGRATION_CREATE,
    Permission.INTEGRATION_UPDATE,
    Permission.CAMPAIGN_READ,
    Permission.CAMPAIGN_CREATE,
    Permission.CAMPAIGN_UPDATE,
  ],
  [UserRole.USER]: [
    Permission.BRAND_READ,
    Permission.INTEGRATION_READ,
    Permission.CAMPAIGN_READ,
  ],
  [UserRole.VIEWER]: [
    Permission.BRAND_READ,
    Permission.INTEGRATION_READ,
    Permission.CAMPAIGN_READ,
  ],
};

// Middleware configuration
export interface MiddlewareConfig {
  // Authentication
  auth?: AuthOptions;

  // Rate limiting
  rateLimit?: RateLimitOptions;

  // CORS
  cors?: {
    origins?: string[];
    methods?: string[];
    headers?: string[];
    credentials?: boolean;
  };

  // Request logging
  logging?: {
    enabled?: boolean;
    level?: 'error' | 'warn' | 'info' | 'debug';
    includeBody?: boolean;
    includeHeaders?: boolean;
  };
}

// Session information
export interface SessionInfo {
  sessionId: string;
  userId: string;
  expiresAt: Date;
  isActive: boolean;
  lastActivity: Date;
  ipAddress?: string;
  userAgent?: string;
}

// Authentication event types
export interface AuthEvent {
  type: 'login' | 'logout' | 'session_expired' | 'token_refresh' | 'permission_denied';
  userId: string;
  sessionId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// JWT token payload
export interface JWTPayload {
  sub: string; // user ID
  email: string;
  role: UserRole;
  permissions: Permission[];
  iat: number; // issued at
  exp: number; // expiration
  sessionId: string;
}

// Authentication configuration
export interface AuthConfig {
  // JWT settings
  jwtSecret: string;
  jwtExpiresIn?: string;
  jwtRefreshExpiresIn?: string;

  // Session settings
  sessionTimeout?: number;
  maxSessions?: number;

  // Password settings
  passwordMinLength?: number;
  passwordRequireUppercase?: boolean;
  passwordRequireNumbers?: boolean;
  passwordRequireSymbols?: boolean;

  // Security settings
  maxLoginAttempts?: number;
  lockoutDuration?: number;
  requireEmailVerification?: boolean;

  // Rate limiting
  rateLimiting?: {
    enabled: boolean;
    windowMs: number;
    maxAttempts: number;
  };
}

// API route handler type
export type AuthenticatedApiHandler<T extends any[] = []> = (
  request: Request,
  session: Session,
  ...args: T
) => Promise<Response>;

// Optional auth API handler type
export type OptionalAuthApiHandler<T extends any[] = []> = (
  request: Request,
  session: Session | null,
  ...args: T
) => Promise<Response>;

// Type guard for checking user roles
export function hasRole(session: any, role: string): boolean {
  if (!session || !session.user) return false;
  return (session.user as any).role === role;
}

// Type guard for checking user permissions
export function hasPermission(session: any, permission: string): boolean {
  if (!session || !session.user) return false;
  const userRole = (session.user as any).role as UserRole;
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission as Permission);
}

// Get user permissions from session
export function getUserPermissions(session: any): Permission[] {
  const userRole = (session.user as any).role as UserRole;
  return ROLE_PERMISSIONS[userRole] || [];
}

// Check if user has any of the specified permissions
export function hasAnyPermission(session: any, permissions: Permission[]): boolean {
  if (!session || !session.user) return false;
  const userPermissions = getUserPermissions(session);
  return permissions.some(permission => userPermissions.includes(permission));
}

// Check if user has all of the specified permissions
export function hasAllPermissions(session: any, permissions: Permission[]): boolean {
  if (!session || !session.user) return false;
  const userPermissions = getUserPermissions(session);
  return permissions.every(permission => userPermissions.includes(permission));
}