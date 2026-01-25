/**
 * Auth client configuration
 * Provides utilities for creating auth clients
 */
import {
  lastLoginMethodClient,
  magicLinkClient,
  organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient as createBetterAuthClient } from "better-auth/react";

/**
 * Configuration for creating an auth client
 */
export interface AuthClientConfig {
  baseURL: string;
  ac: any; // Access control object
  roles: {
    owner: any;
    admin: any;
    member: any;
  };
}

/**
 * Create an authenticated client for the given configuration
 */
export function createAuthClient(config: AuthClientConfig) {
  return createBetterAuthClient({
    baseURL: config.baseURL,
    plugins: [
      organizationClient({
        ac: config.ac,
        roles: config.roles,
      }),
      magicLinkClient(),
      lastLoginMethodClient(),
    ],
  });
}
