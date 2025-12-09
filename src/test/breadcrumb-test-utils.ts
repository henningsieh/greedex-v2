import { QueryClient } from "@tanstack/react-query";

/**
 * Test utilities for breadcrumb component testing
 */

export interface MockOrganization {
  id: string;
  name: string;
}

export interface MockProject {
  id: string;
  name: string;
  organizationId?: string;
}

export interface MockSession {
  session: {
    id: string;
    userId: string;
    activeProjectId: string | null;
  } | null;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

/**
 * Creates a test QueryClient with sensible defaults
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
        gcTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: () => {},
      warn: () => {},
      error: () => {},
    },
  });
}

/**
 * Seeds the QueryClient with mock breadcrumb data
 */
export function seedBreadcrumbData(
  queryClient: QueryClient,
  {
    organization,
    projects = [],
    session,
  }: {
    organization?: MockOrganization | null;
    projects?: MockProject[];
    session?: MockSession | null;
  },
): void {
  if (organization !== undefined) {
    queryClient.setQueryData(["organizations", "getActive"], organization);
  }

  if (projects !== undefined) {
    queryClient.setQueryData(["projects", "list"], projects);
  }

  if (session !== undefined) {
    queryClient.setQueryData(["betterauth", "getSession"], session);
  }
}

/**
 * Creates a mock organization with sensible defaults
 */
export function createMockOrganization(
  overrides?: Partial<MockOrganization>,
): MockOrganization {
  return {
    id: "org-1",
    name: "Test Organization",
    ...overrides,
  };
}

/**
 * Creates a mock project with sensible defaults
 */
export function createMockProject(
  overrides?: Partial<MockProject>,
): MockProject {
  return {
    id: "project-1",
    name: "Test Project",
    organizationId: "org-1",
    ...overrides,
  };
}

/**
 * Creates a mock session with sensible defaults
 */
export function createMockSession(
  overrides?: Partial<MockSession>,
): MockSession {
  return {
    session: {
      id: "session-1",
      userId: "user-1",
      activeProjectId: "project-1",
    },
    user: {
      id: "user-1",
      email: "test@example.com",
      name: "Test User",
    },
    ...overrides,
  };
}

/**
 * Creates a complete breadcrumb test scenario
 */
export function createBreadcrumbScenario(
  scenario: "organization-dashboard" | "organization-projects" | "organization-team" | "organization-settings" | "active-project" | "liveview" | "no-project",
): {
  pathname: string;
  organization: MockOrganization | null;
  projects: MockProject[];
  session: MockSession | null;
} {
  const baseOrg = createMockOrganization();
  const baseProject = createMockProject();
  const baseSession = createMockSession();

  switch (scenario) {
    case "organization-dashboard":
      return {
        pathname: "/org/dashboard",
        organization: baseOrg,
        projects: [baseProject],
        session: baseSession,
      };

    case "organization-projects":
      return {
        pathname: "/org/projects",
        organization: baseOrg,
        projects: [baseProject],
        session: baseSession,
      };

    case "organization-team":
      return {
        pathname: "/org/team",
        organization: baseOrg,
        projects: [baseProject],
        session: baseSession,
      };

    case "organization-settings":
      return {
        pathname: "/org/settings",
        organization: baseOrg,
        projects: [baseProject],
        session: baseSession,
      };

    case "active-project":
      return {
        pathname: "/org/activeproject",
        organization: baseOrg,
        projects: [baseProject],
        session: baseSession,
      };

    case "liveview":
      return {
        pathname: "/org/activeproject/liveview",
        organization: baseOrg,
        projects: [baseProject],
        session: baseSession,
      };

    case "no-project":
      return {
        pathname: "/org/activeproject",
        organization: baseOrg,
        projects: [],
        session: {
          ...baseSession,
          session: {
            ...baseSession.session!,
            activeProjectId: null,
          },
        },
      };

    default:
      throw new Error(`Unknown scenario: ${scenario}`);
  }
}

/**
 * Asserts that a breadcrumb contains expected elements
 */
export function assertBreadcrumbStructure(container: HTMLElement): void {
  const nav = container.querySelector("nav");
  if (!nav) {
    throw new Error("Expected breadcrumb navigation element not found");
  }

  const list = container.querySelector("ol, ul");
  if (!list) {
    throw new Error("Expected breadcrumb list element not found");
  }
}

/**
 * Gets all breadcrumb items from the container
 */
export function getBreadcrumbItems(container: HTMLElement): HTMLElement[] {
  const items = container.querySelectorAll('[role="listitem"], li');
  return Array.from(items) as HTMLElement[];
}

/**
 * Gets all breadcrumb separators from the container
 */
export function getBreadcrumbSeparators(container: HTMLElement): HTMLElement[] {
  const separators = container.querySelectorAll('[aria-hidden="true"]');
  return Array.from(separators) as HTMLElement[];
}

/**
 * Waits for breadcrumb data to be loaded in QueryClient
 */
export async function waitForBreadcrumbData(
  queryClient: QueryClient,
): Promise<void> {
  await Promise.all([
    queryClient.ensureQueryData({
      queryKey: ["organizations", "getActive"],
    }),
    queryClient.ensureQueryData({
      queryKey: ["projects", "list"],
    }),
    queryClient.ensureQueryData({
      queryKey: ["betterauth", "getSession"],
    }),
  ]);
}

/**
 * Clears all breadcrumb-related query data
 */
export function clearBreadcrumbData(queryClient: QueryClient): void {
  queryClient.removeQueries({ queryKey: ["organizations"] });
  queryClient.removeQueries({ queryKey: ["projects"] });
  queryClient.removeQueries({ queryKey: ["betterauth"] });
}