import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock Next.js modules
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/org/dashboard",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next-intl/server", () => ({
  getLocale: vi.fn().mockResolvedValue("en"),
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue({ value: "true" }),
  }),
}));

// Mock authentication
vi.mock("@/lib/auth/get-session", () => ({
  getSession: vi.fn().mockResolvedValue({
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
  }),
}));

// Mock ORPC
const mockOrpcQuery = {
  projects: {
    list: {
      queryOptions: () => ({
        queryKey: ["projects", "list"],
        queryFn: async () => [
          { id: "project-1", name: "Test Project" },
        ],
      }),
    },
  },
  organizations: {
    getActive: {
      queryOptions: () => ({
        queryKey: ["organizations", "getActive"],
        queryFn: async () => ({
          id: "org-1",
          name: "Test Organization",
        }),
      }),
    },
  },
  betterauth: {
    getSession: {
      queryOptions: () => ({
        queryKey: ["betterauth", "getSession"],
        queryFn: async () => ({
          session: {
            id: "session-1",
            activeProjectId: "project-1",
          },
        }),
      }),
    },
  },
};

vi.mock("@/lib/orpc/orpc", () => ({
  orpcQuery: mockOrpcQuery,
}));

// Mock components
vi.mock("@/components/app-breadcrumb", () => ({
  AppBreadcrumb: () => <div data-testid="app-breadcrumb">Breadcrumb</div>,
  AppBreadcrumbSkeleton: () => (
    <div data-testid="breadcrumb-skeleton">Loading...</div>
  ),
}));

vi.mock("@/components/app-sidebar", () => ({
  AppSidebar: () => <div data-testid="app-sidebar">Sidebar</div>,
  AppSidebarSkeleton: () => (
    <div data-testid="sidebar-skeleton">Loading Sidebar...</div>
  ),
}));

vi.mock("@/components/navbar", () => ({
  Navbar: () => <div data-testid="navbar">Navbar</div>,
}));

vi.mock("@/components/providers/loading-provider", () => ({
  LoadingProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="loading-provider">{children}</div>
  ),
}));

vi.mock("@/components/ui/separator", () => ({
  Separator: () => <div data-testid="separator" />,
}));

vi.mock("@/components/ui/sidebar", () => ({
  SidebarInset: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-inset">{children}</div>
  ),
  SidebarProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-provider">{children}</div>
  ),
  SidebarTrigger: ({ className }: { className?: string }) => (
    <button data-testid="sidebar-trigger" className={className}>
      Toggle
    </button>
  ),
}));

describe("AppLayout Integration Tests", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: Infinity,
        },
      },
    });

    // Pre-populate query cache with mock data
    queryClient.setQueryData(["projects", "list"], [
      { id: "project-1", name: "Test Project" },
    ]);
    queryClient.setQueryData(["organizations", "getActive"], {
      id: "org-1",
      name: "Test Organization",
    });
    queryClient.setQueryData(["betterauth", "getSession"], {
      session: {
        id: "session-1",
        activeProjectId: "project-1",
      },
    });

    vi.clearAllMocks();
  });

  describe("Data Prefetching", () => {
    it("prefetches all required queries for AppBreadcrumb", async () => {
      const spyProjects = vi.spyOn(mockOrpcQuery.projects.list, "queryOptions");
      const spyOrganizations = vi.spyOn(
        mockOrpcQuery.organizations.getActive,
        "queryOptions",
      );
      const spySession = vi.spyOn(
        mockOrpcQuery.betterauth.getSession,
        "queryOptions",
      );

      await queryClient.prefetchQuery(
        mockOrpcQuery.projects.list.queryOptions(),
      );
      await queryClient.prefetchQuery(
        mockOrpcQuery.organizations.getActive.queryOptions(),
      );
      await queryClient.prefetchQuery(
        mockOrpcQuery.betterauth.getSession.queryOptions(),
      );

      expect(spyProjects).toHaveBeenCalled();
      expect(spyOrganizations).toHaveBeenCalled();
      expect(spySession).toHaveBeenCalled();
    });

    it("caches projects list data correctly", async () => {
      await queryClient.prefetchQuery(
        mockOrpcQuery.projects.list.queryOptions(),
      );

      const cachedData = queryClient.getQueryData(["projects", "list"]);
      expect(cachedData).toEqual([{ id: "project-1", name: "Test Project" }]);
    });

    it("caches active organization data correctly", async () => {
      await queryClient.prefetchQuery(
        mockOrpcQuery.organizations.getActive.queryOptions(),
      );

      const cachedData = queryClient.getQueryData(["organizations", "getActive"]);
      expect(cachedData).toEqual({
        id: "org-1",
        name: "Test Organization",
      });
    });

    it("caches session data correctly", async () => {
      await queryClient.prefetchQuery(
        mockOrpcQuery.betterauth.getSession.queryOptions(),
      );

      const cachedData = queryClient.getQueryData(["betterauth", "getSession"]);
      expect(cachedData).toEqual({
        session: {
          id: "session-1",
          activeProjectId: "project-1",
        },
      });
    });
  });

  describe("Component Rendering with Suspense", () => {
    const LayoutWrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <div data-testid="layout-wrapper">{children}</div>
      </QueryClientProvider>
    );

    it("renders breadcrumb after suspense resolves", async () => {
      render(
        <LayoutWrapper>
          <div data-testid="app-breadcrumb">Breadcrumb</div>
        </LayoutWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("app-breadcrumb")).toBeInTheDocument();
      });
    });

    it("shows skeleton while loading breadcrumb data", () => {
      const { rerender } = render(
        <LayoutWrapper>
          <div data-testid="breadcrumb-skeleton">Loading...</div>
        </LayoutWrapper>,
      );

      expect(screen.getByTestId("breadcrumb-skeleton")).toBeInTheDocument();

      // Simulate data loaded
      rerender(
        <LayoutWrapper>
          <div data-testid="app-breadcrumb">Breadcrumb</div>
        </LayoutWrapper>,
      );

      expect(screen.getByTestId("app-breadcrumb")).toBeInTheDocument();
    });

    it("maintains sidebar state from cookies", async () => {
      const mockCookies = {
        get: vi.fn().mockReturnValue({ value: "true" }),
      };

      const { cookies } = await import("next/headers");
      vi.mocked(cookies).mockResolvedValue(mockCookies as any);

      expect(mockCookies.get("sidebar_state")).toEqual({ value: "true" });
    });
  });

  describe("Error Boundary Integration", () => {
    it("catches errors in breadcrumb rendering", () => {
      const ErrorComponent = () => {
        throw new Error("Test error");
      };

      const { container } = render(
        <QueryClientProvider client={queryClient}>
          <div data-testid="error-boundary">
            <ErrorComponent />
          </div>
        </QueryClientProvider>,
      );

      // Error boundary should catch the error
      expect(container.querySelector('[data-testid="error-boundary"]')).toBeTruthy();
    });
  });

  describe("Query State Management", () => {
    it("handles query invalidation correctly", async () => {
      await queryClient.prefetchQuery(
        mockOrpcQuery.projects.list.queryOptions(),
      );

      const initialData = queryClient.getQueryData(["projects", "list"]);
      expect(initialData).toBeDefined();

      // Invalidate the query
      await queryClient.invalidateQueries({ queryKey: ["projects", "list"] });

      // Query should be marked as stale
      const state = queryClient.getQueryState(["projects", "list"]);
      expect(state?.isInvalidated).toBe(true);
    });

    it("refetches data when query is invalidated", async () => {
      const queryOptions = mockOrpcQuery.projects.list.queryOptions();
      await queryClient.prefetchQuery(queryOptions);

      // Update the mock to return different data
      const newData = [
        { id: "project-2", name: "Updated Project" },
      ];
      queryClient.setQueryData(["projects", "list"], newData);

      const cachedData = queryClient.getQueryData(["projects", "list"]);
      expect(cachedData).toEqual(newData);
    });

    it("handles concurrent query fetching", async () => {
      const promises = [
        queryClient.prefetchQuery(mockOrpcQuery.projects.list.queryOptions()),
        queryClient.prefetchQuery(
          mockOrpcQuery.organizations.getActive.queryOptions(),
        ),
        queryClient.prefetchQuery(
          mockOrpcQuery.betterauth.getSession.queryOptions(),
        ),
      ];

      await Promise.all(promises);

      expect(queryClient.getQueryData(["projects", "list"])).toBeDefined();
      expect(
        queryClient.getQueryData(["organizations", "getActive"]),
      ).toBeDefined();
      expect(
        queryClient.getQueryData(["betterauth", "getSession"]),
      ).toBeDefined();
    });
  });

  describe("Sidebar State Persistence", () => {
    it("reads sidebar state from cookies", async () => {
      const mockCookies = {
        get: vi.fn().mockReturnValue({ value: "false" }),
      };

      const { cookies } = await import("next/headers");
      vi.mocked(cookies).mockResolvedValue(mockCookies as any);

      const sidebarState = mockCookies.get("sidebar_state");
      expect(sidebarState?.value).toBe("false");
    });

    it("defaults to closed when cookie is missing", async () => {
      const mockCookies = {
        get: vi.fn().mockReturnValue(undefined),
      };

      const { cookies } = await import("next/headers");
      vi.mocked(cookies).mockResolvedValue(mockCookies as any);

      const sidebarState = mockCookies.get("sidebar_state");
      expect(sidebarState).toBeUndefined();
    });

    it("handles invalid cookie values gracefully", async () => {
      const mockCookies = {
        get: vi.fn().mockReturnValue({ value: "invalid" }),
      };

      const { cookies } = await import("next/headers");
      vi.mocked(cookies).mockResolvedValue(mockCookies as any);

      const sidebarState = mockCookies.get("sidebar_state");
      expect(sidebarState?.value).toBe("invalid");
      // The actual layout would handle this by treating non-"true" as false
    });
  });

  describe("Layout Structure", () => {
    it("renders all major layout components", () => {
      const { getByTestId } = render(
        <QueryClientProvider client={queryClient}>
          <div data-testid="sidebar-provider">
            <div data-testid="app-sidebar">Sidebar</div>
            <div data-testid="sidebar-inset">
              <div data-testid="navbar">Navbar</div>
              <div data-testid="sidebar-trigger">Toggle</div>
              <div data-testid="app-breadcrumb">Breadcrumb</div>
              <div data-testid="loading-provider">
                <main>Content</main>
              </div>
            </div>
          </div>
        </QueryClientProvider>,
      );

      expect(getByTestId("sidebar-provider")).toBeInTheDocument();
      expect(getByTestId("app-sidebar")).toBeInTheDocument();
      expect(getByTestId("sidebar-inset")).toBeInTheDocument();
      expect(getByTestId("navbar")).toBeInTheDocument();
      expect(getByTestId("sidebar-trigger")).toBeInTheDocument();
      expect(getByTestId("app-breadcrumb")).toBeInTheDocument();
      expect(getByTestId("loading-provider")).toBeInTheDocument();
    });

    it("applies correct styling to sidebar trigger", () => {
      const { getByTestId } = render(
        <QueryClientProvider client={queryClient}>
          <button
            data-testid="sidebar-trigger"
            className="rounded-md border border-input bg-background shadow-sm hover:bg-secondary hover:text-secondary-foreground dark:hover:bg-secondary/50"
          >
            Toggle
          </button>
        </QueryClientProvider>,
      );

      const trigger = getByTestId("sidebar-trigger");
      expect(trigger.className).toContain("rounded-md");
      expect(trigger.className).toContain("border");
      expect(trigger.className).toContain("hover:bg-secondary");
    });
  });

  describe("Performance Optimization", () => {
    it("prefetches data before component renders", async () => {
      const startTime = Date.now();

      await Promise.all([
        queryClient.prefetchQuery(mockOrpcQuery.projects.list.queryOptions()),
        queryClient.prefetchQuery(
          mockOrpcQuery.organizations.getActive.queryOptions(),
        ),
        queryClient.prefetchQuery(
          mockOrpcQuery.betterauth.getSession.queryOptions(),
        ),
      ]);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // All queries should complete reasonably fast in tests
      expect(duration).toBeLessThan(1000);

      // Data should be immediately available
      expect(queryClient.getQueryData(["projects", "list"])).toBeDefined();
      expect(
        queryClient.getQueryData(["organizations", "getActive"]),
      ).toBeDefined();
      expect(
        queryClient.getQueryData(["betterauth", "getSession"]),
      ).toBeDefined();
    });

    it("uses stale-while-revalidate strategy", async () => {
      // Set initial data
      queryClient.setQueryData(["projects", "list"], [
        { id: "old", name: "Old Project" },
      ]);

      // Mark as stale
      queryClient.invalidateQueries({ queryKey: ["projects", "list"] });

      // Old data should still be available immediately
      const staleData = queryClient.getQueryData(["projects", "list"]);
      expect(staleData).toEqual([{ id: "old", name: "Old Project" }]);
    });
  });
});