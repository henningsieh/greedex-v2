import {
  inferAdditionalFields,
  magicLinkClient,
  organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { env } from "@/env";
import type { auth } from "@/lib/better-auth";
import { ac, admin, member, owner } from "@/lib/better-auth/permissions";

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: env.NEXT_PUBLIC_BASE_URL,
  plugins: [
    organizationClient({
      ac,
      roles: {
        owner,
        admin,
        member,
      },
    }),
    magicLinkClient(),
    inferAdditionalFields<typeof auth>(),
  ],
});
