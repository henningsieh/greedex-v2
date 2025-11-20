import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import {
  lastLoginMethod,
  magicLink,
  organization as organizationPlugin,
} from "better-auth/plugins";
import { desc, eq } from "drizzle-orm";
import { env } from "@/env";
import {
  ac,
  admin,
  member as memberRole,
  owner,
} from "@/lib/better-auth/permissions";
import { db } from "@/lib/drizzle/db";
import * as schema from "@/lib/drizzle/schema";
import { member } from "@/lib/drizzle/schema";
import {
  sendEmailVerificationEmail,
  sendPasswordResetEmail,
} from "@/lib/email";
import { sendEmail } from "@/lib/email/nodemailer";

export const auth = betterAuth({
  appName: "Next WebSocket Server",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true, // Must be true to block login until verified
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail({ user, url });
    },
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignUp: true, // This triggers email verification on signup
    sendOnSignIn: false, // Don't send on every sign-in, only on signup
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmailVerificationEmail({ user, url });
    },
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
    discord: {
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    },
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
  },
  session: {
    cookieCache: {
      enabled: false,
      // maxAge: 60, // 1 minute
    },
    additionalFields: {
      activeProjectId: {
        type: "string",
      },
    },
  },
  plugins: [
    organizationPlugin({
      ac,
      roles: {
        owner,
        admin,
        member: memberRole,
      },
    }),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendEmail({
          to: email,
          subject: "Sign in to your account",
          html: `<p>Click the link below to sign in:</p><a href="${url}">Sign in</a>`,
          text: `Click the link below to sign in: ${url}`,
        });
      },
    }),
    lastLoginMethod({
      customResolveMethod: (ctx) => {
        // Track magic link authentication
        if (ctx.path === "/magic-link/verify") {
          return "magic-link";
        }
        // Return null to use default logic
        return null;
      },
    }),
    nextCookies(),
  ],

  databaseHooks: {
    session: {
      create: {
        before: async (userSession) => {
          const membership = await db.query.member.findFirst({
            where: eq(member.userId, userSession.userId),
            orderBy: desc(member.createdAt),
            columns: { organizationId: true },
          });

          return {
            data: {
              ...userSession,
              activeOrganizationId: membership?.organizationId,
            },
          };
        },
      },
    },
  },
});
