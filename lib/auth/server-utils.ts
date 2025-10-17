import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/config";
import { getDb } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  fullName?: string;
  country?: string;
}

export interface AuthResult {
  success: boolean;
  user?: AuthenticatedUser;
  error?: string;
  status?: number;
}

/**
 * Authenticate request using better-auth session
 * This is the primary authentication method to use in API routes
 */
export async function authenticateRequest(
  request: NextRequest,
): Promise<AuthResult> {
  try {
    // First try to get session from better-auth
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (session && session.user) {
      return {
        success: true,
        user: {
          id: session.user.id,
          email: session.user.email,
          role: session.user.role || "USER",
          fullName: session.user.fullName,
          country: session.user.country,
        },
      };
    }

    // Fallback: check for user ID in headers (set by middleware)
    const userId = request.headers.get("x-user-id");
    const userEmail = request.headers.get("x-user-email");
    const userRole = request.headers.get("x-user-role");

    if (userId && userEmail) {
      return {
        success: true,
        user: {
          id: userId,
          email: userEmail,
          role: userRole || "USER",
        },
      };
    }

    return {
      success: false,
      error: "No valid session found",
      status: 401,
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return {
      success: false,
      error: "Authentication failed",
      status: 401,
    };
  }
}

/**
 * Authenticate request and verify user has admin role
 */
export async function authenticateAdmin(
  request: NextRequest,
): Promise<AuthResult> {
  const authResult = await authenticateRequest(request);

  if (!authResult.success) {
    return authResult;
  }

  if (authResult.user?.role !== "ADMIN") {
    return {
      success: false,
      error: "Admin access required",
      status: 403,
    };
  }

  return authResult;
}

/**
 * Get user's trading account from database
 */
export async function getUserAccount(userId: string) {
  try {
    const db = await getDb();
    const account = await db.collection("accounts").findOne({
      userId: new ObjectId(userId),
      status: "ACTIVE",
    });

    return account;
  } catch (error) {
    console.error("Error fetching user account:", error);
    return null;
  }
}

/**
 * Verify user owns the resource by checking userId field
 */
export async function verifyResourceOwnership(
  collectionName: string,
  resourceId: string,
  userId: string,
): Promise<boolean> {
  try {
    const db = await getDb();
    const resource = await db.collection(collectionName).findOne({
      _id: new ObjectId(resourceId),
      userId: new ObjectId(userId),
    });

    return !!resource;
  } catch (error) {
    console.error("Error verifying resource ownership:", error);
    return false;
  }
}

/**
 * Create audit log entry
 */
export async function createAuditLog(
  userId: string,
  action: string,
  resource: string,
  resourceId?: string,
  changes?: any,
  metadata?: any,
) {
  try {
    const db = await getDb();
    await db.collection("audit_logs").insertOne({
      userId: new ObjectId(userId),
      action,
      resource,
      resourceId,
      changes,
      metadata,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("Error creating audit log:", error);
  }
}

/**
 * Standardized error responses
 */
export const AuthErrors = {
  UNAUTHORIZED: { error: "Unauthorized", status: 401 },
  FORBIDDEN: { error: "Forbidden", status: 403 },
  INVALID_SESSION: { error: "Invalid session", status: 401 },
  ADMIN_REQUIRED: { error: "Admin access required", status: 403 },
  ACCOUNT_NOT_FOUND: { error: "Trading account not found", status: 400 },
  INSUFFICIENT_PERMISSIONS: { error: "Insufficient permissions", status: 403 },
} as const;

/**
 * Wrapper function for API routes with authentication
 * Usage example:
 *
 * export const GET = withAuth(async (request, { user }) => {
 *   // Your authenticated API logic here
 *   return NextResponse.json({ user });
 * });
 */
export function withAuth<T extends any[]>(
  handler: (
    request: NextRequest,
    context: { user: AuthenticatedUser },
    ...args: T
  ) => Promise<Response>,
) {
  return async (request: NextRequest, ...args: T): Promise<Response> => {
    const authResult = await authenticateRequest(request);

    if (!authResult.success || !authResult.user) {
      const status = authResult.status || 401;
      return new Response(JSON.stringify({ error: authResult.error }), {
        status,
        headers: { "Content-Type": "application/json" },
      });
    }

    return handler(request, { user: authResult.user }, ...args);
  };
}

/**
 * Wrapper function for API routes with admin authentication
 */
export function withAdminAuth<T extends any[]>(
  handler: (
    request: NextRequest,
    context: { user: AuthenticatedUser },
    ...args: T
  ) => Promise<Response>,
) {
  return async (request: NextRequest, ...args: T): Promise<Response> => {
    const authResult = await authenticateAdmin(request);

    if (!authResult.success || !authResult.user) {
      const status = authResult.status || 401;
      return new Response(JSON.stringify({ error: authResult.error }), {
        status,
        headers: { "Content-Type": "application/json" },
      });
    }

    return handler(request, { user: authResult.user }, ...args);
  };
}

/**
 * Get user session from request (for server components)
 */
export async function getServerSession(request?: NextRequest) {
  try {
    if (request) {
      return await auth.api.getSession({ headers: request.headers });
    }

    // For server components without request - return null
    return null;
  } catch (error) {
    console.error("Error getting server session:", error);
    return null;
  }
}

/**
 * Validate user permissions for specific actions
 */
export function hasPermission(
  user: AuthenticatedUser,
  permission: string,
): boolean {
  const rolePermissions = {
    ADMIN: ["*"], // Admin has all permissions
    USER: [
      "read:own_profile",
      "update:own_profile",
      "read:own_orders",
      "create:orders",
      "cancel:own_orders",
      "read:own_positions",
      "close:own_positions",
      "read:own_trades",
      "read:own_account",
      "update:own_account",
      "read:market_data",
      "manage:own_watchlist",
    ],
    DEMO: [
      "read:own_profile",
      "read:market_data",
      "create:demo_orders",
      "read:own_demo_positions",
    ],
  };

  const userPermissions =
    rolePermissions[user.role as keyof typeof rolePermissions] || [];

  return userPermissions.includes("*") || userPermissions.includes(permission);
}
