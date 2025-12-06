// Centralized app configuration constants
// This file consolidates various app-wide settings for better maintainability

// Import Next.js generated route types
// Path resolves to .next/dev/types/routes in dev, .next/types/routes in production
import type { AppRoutes } from "#next-routes/routes";

// Transform generated routes to remove locale prefix for next-intl compatibility
// Uses distributive conditional types to properly handle the union
type StripLocale<T> = T extends `/${string}/${infer R}`
  ? `/${R}`
  : T extends "/[locale]"
    ? "/"
    : T;

// Export the application route type after stripping locale prefix
export type AppRoute = StripLocale<AppRoutes>;

// Exported route constants - use with next-intl Link component
// The Link component from next-intl automatically adds locale prefix
export const DASHBOARD_PATH: AppRoute = "/org/dashboard";
export const ACTIVE_PROJECT_PATH: AppRoute = "/org/activeproject";
export const LIVE_VIEW_PATH: AppRoute = "/org/activeproject/liveview";
export const PROJECTS_PATH: AppRoute = "/org/projects";
export const TEAM_PATH: AppRoute = "/org/team";
export const SETTINGS_PATH: AppRoute = "/org/settings";
export const CREATE_PROJECT_PATH: AppRoute = "/org/create-project";
export const CREATE_ORG_PATH: AppRoute = "/org/create";

// Dynamic route - use getProjectDetailPath helper for parameterized routes
export const PROJECT_DETAIL_PATH: AppRoute = "/org/projects/[id]";

// Auth routes
export const HOME_PATH: AppRoute = "/";
export const LOGIN_PATH: AppRoute = "/login";
export const SIGNUP_PATH: AppRoute = "/signup";
export const FORGOT_PASSWORD_PATH: AppRoute = "/forgot-password";
export const RESET_PASSWORD_PATH: AppRoute = "/reset-password";
export const VERIFY_EMAIL_PATH: AppRoute = "/verify-email";

// Other routes
export const LIBRARY_PATH: AppRoute = "/library";
export const TIPS_AND_TRICKS_PATH: AppRoute = "/tips-and-tricks";
export const ORPC_TEST_PATH: AppRoute = "/orpc-test";
export const ABOUT_PATH: AppRoute = "/about";
export const E_FOREST_PATH: AppRoute = "/e+forest";

// Anchor links (not actual routes)
export const WORKSHOPS_ANCHOR = "/#workshops";

