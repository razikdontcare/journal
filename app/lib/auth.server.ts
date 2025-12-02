import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "./db/schema";
import { eq } from "drizzle-orm";
import type { UserRole } from "./db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:5173"],
});

export type Auth = typeof auth;

// Extended session type with role
export interface SessionWithRole {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    role: UserRole;
  };
  session: {
    id: string;
    token: string;
    expiresAt: Date;
  };
}

// Helper to get session from request
export async function getSession(request: Request) {
  return await auth.api.getSession({
    headers: request.headers,
  });
}

// Helper to get session with user role
export async function getSessionWithRole(
  request: Request
): Promise<SessionWithRole | null> {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return null;
  }

  // Get user role from database
  const userResult = await db
    .select({ role: schema.users.role })
    .from(schema.users)
    .where(eq(schema.users.id, session.user.id))
    .limit(1);

  const role = (userResult[0]?.role as UserRole) || "author";

  return {
    user: {
      ...session.user,
      role,
    },
    session: session.session,
  };
}

// Helper to require authentication - throws redirect if not authenticated
export async function requireAuth(request: Request) {
  const session = await getSession(request);
  if (!session) {
    throw new Response(null, {
      status: 302,
      headers: { Location: "/login" },
    });
  }
  return session;
}

// Helper to require authentication with role info
export async function requireAuthWithRole(
  request: Request
): Promise<SessionWithRole> {
  const session = await getSessionWithRole(request);
  if (!session) {
    throw new Response(null, {
      status: 302,
      headers: { Location: "/login" },
    });
  }
  return session;
}

// Check if user has admin role
export function isAdmin(role: UserRole): boolean {
  return role === "admin";
}

// Check if user has editor or admin role
export function isEditorOrAdmin(role: UserRole): boolean {
  return role === "admin" || role === "editor";
}

// Get user by ID
export async function getUserById(id: string) {
  const result = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, id))
    .limit(1);
  return result[0];
}

// Update user role (admin only)
export async function updateUserRole(userId: string, role: UserRole) {
  const result = await db
    .update(schema.users)
    .set({ role, updatedAt: new Date() })
    .where(eq(schema.users.id, userId))
    .returning();
  return result[0];
}

// Get all users (admin only)
export async function getAllUsers() {
  return await db
    .select({
      id: schema.users.id,
      name: schema.users.name,
      email: schema.users.email,
      role: schema.users.role,
      image: schema.users.image,
      createdAt: schema.users.createdAt,
    })
    .from(schema.users)
    .orderBy(schema.users.createdAt);
}

// Update user profile (name and image)
export async function updateUserProfile(
  userId: string,
  data: { name: string; image: string | null }
) {
  const result = await db
    .update(schema.users)
    .set({
      name: data.name,
      image: data.image,
      updatedAt: new Date(),
    })
    .where(eq(schema.users.id, userId))
    .returning();
  return result[0];
}
