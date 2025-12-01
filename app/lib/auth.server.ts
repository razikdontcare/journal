import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "./db/schema";

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

// Helper to get session from request
export async function getSession(request: Request) {
  return await auth.api.getSession({
    headers: request.headers,
  });
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
