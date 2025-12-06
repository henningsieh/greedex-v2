import type { auth } from "@/lib/better-auth";

/**
 * Full session response from Better Auth
 * Includes both session and user objects
 */
export type SessionResponse = typeof auth.$Infer.Session;
export type Organization = typeof auth.$Infer.Organization;
export type Invitation = typeof auth.$Infer.Invitation;
export type Member = typeof auth.$Infer.Member;

/**
 * Just the session object portion
 */
export type Session = SessionResponse["session"];

/**
 * Just the user object portion
 */
export type User = SessionResponse["user"];

