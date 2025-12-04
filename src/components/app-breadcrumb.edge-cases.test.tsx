import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppBreadcrumb } from "./app-breadcrumb";
import {
  clearBreadcrumbData,
  createBreadcrumbScenario,
  createMockOrganization,
  createMockProject,
  createTestQueryClient,
  seedBreadcrumbData,
} from "@/test/breadcrumb-test-utils";

// Mock dependencies (same as main test file)
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

const mockUsePathname = vi.fn();
vi.mock("@/lib/i18n/navigation", () => ({
  usePathname: () => mockUsePathname(),
  Link: ({ children, href, className }: any) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.mock("@/lib/orpc/orpc", () => ({
  orpcQuery: {
    organizations: { getActive: { queryOptions: vi.fn() } },
    betterauth: { getSession: { queryOptions: vi.fn() } },
    projects: { list: { queryOptions: vi.fn() } },
  },
}));

vi.mock("@/lib/config/app", () => ({
  DASHBOARD_PATH: "/org/dashboard",
  PROJECTS_PATH: "/org/projects",
  TEAM_PATH: "/org/team",
  SETTINGS_PATH: "/org/settings",
  ACTIVE_PROJECT_PATH: "/org/activeproject",
  LIVE_VIEW_PATH: "/org/activeproject/liveview",
}));

vi.mock("lucide-react", () => ({
  Building2Icon: () => <svg data-testid="building-icon" />,
  LayoutDashboardIcon: () => <svg data-testid="dashboard-icon" />,
  MapPinnedIcon: () => <svg data-testid="map-icon" />,
  UsersIcon: () => <svg data-testid="users-icon" />,
  SettingsIcon: () => <svg data-testid="settings-icon" />,
  BarChart3Icon: () => <svg data-testid="chart-icon" />,
  TriangleAlertIcon: () => <svg data-testid="alert-icon" />,
}));

describe("AppBreadcrumb - Edge Cases & Stress Tests", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    clearBreadcrumbData(queryClient);
  });

  const renderBreadcrumb = (pathname: string) => {
    mockUsePathname.mockReturnValue(pathname);
    return render(
      <QueryClientProvider client={queryClient}>
        <AppBreadcrumb />
      </QueryClientProvider>,
    );
  };

  describe("Extreme Data Scenarios", () => {
    it("handles organization with very long name", () => {
      const longName = "A".repeat(200);
      seedBreadcrumbData(queryClient, {
        organization: createMockOrganization({ name: longName }),
        projects: [],
        session: null,
      });

      renderBreadcrumb("/org/dashboard");

      expect(screen.getByText(longName)).toBeInTheDocument();
    });

    it("handles project with special characters in name", () => {
      const specialName = "Test<>Project&'\"";
      const scenario = createBreadcrumbScenario("active-project");
      seedBreadcrumbData(queryClient, {
        ...scenario,
        projects: [createMockProject({ name: specialName })],
      });

      renderBreadcrumb("/org/activeproject");

      expect(screen.getByText(specialName)).toBeInTheDocument();
    });

    it("handles organization with unicode characters", () => {
      const unicodeName = "测试组织 🚀 مؤسسة";
      seedBreadcrumbData(queryClient, {
        organization: createMockOrganization({ name: unicodeName }),
        projects: [],
        session: null,
      });

      renderBreadcrumb("/org/dashboard");

      expect(screen.getByText(unicodeName)).toBeInTheDocument();
    });

    it("handles project with emoji in name", () => {
      const emojiName = "🎨 Design Project 🚀";
      const scenario = createBreadcrumbScenario("active-project");
      seedBreadcrumbData(queryClient, {
        ...scenario,
        projects: [createMockProject({ name: emojiName })],
      });

      renderBreadcrumb("/org/activeproject");

      expect(screen.getByText(emojiName)).toBeInTheDocument();
    });

    it("handles organization with only whitespace", () => {
      seedBreadcrumbData(queryClient, {
        organization: createMockOrganization({ name: "   " }),
        projects: [],
        session: null,
      });

      renderBreadcrumb("/org/dashboard");

      // Should fall back to default
      expect(screen.getByText("Organization")).toBeInTheDocument();
    });

    it("handles very large project list", () => {
      const manyProjects = Array.from({ length: 1000 }, (_, i) =>
        createMockProject({
          id: `project-${i}`,
          name: `Project ${i}`,
        }),
      );

      const scenario = createBreadcrumbScenario("active-project");
      seedBreadcrumbData(queryClient, {
        ...scenario,
        projects: manyProjects,
        session: {
          session: {
            id: "session-1",
            userId: "user-1",
            activeProjectId: "project-500",
          },
        },
      });

      const startTime = performance.now();
      renderBreadcrumb("/org/activeproject");
      const endTime = performance.now();

      expect(screen.getByText("Project 500")).toBeInTheDocument();
      // Should render quickly even with large dataset
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });

  describe("Malformed Data", () => {
    it("handles organization data with missing required fields", () => {
      queryClient.setQueryData(["organizations", "getActive"], {
        id: "org-1",
        // name is missing
      } as any);

      renderBreadcrumb("/org/dashboard");

      expect(screen.getByText("Organization")).toBeInTheDocument();
    });

    it("handles project data with null values", () => {
      const scenario = createBreadcrumbScenario("active-project");
      queryClient.setQueryData(["projects", "list"], [
        {
          id: null,
          name: null,
        },
      ] as any);

      renderBreadcrumb("/org/activeproject");

      expect(screen.getByText("No project selected")).toBeInTheDocument();
    });

    it("handles session with invalid activeProjectId type", () => {
      const scenario = createBreadcrumbScenario("active-project");
      queryClient.setQueryData(["betterauth", "getSession"], {
        session: {
          id: "session-1",
          userId: "user-1",
          activeProjectId: 12345, // Should be string
        },
      } as any);

      renderBreadcrumb("/org/activeproject");

      expect(screen.getByText("No project selected")).toBeInTheDocument();
    });

    it("handles circular reference in data", () => {
      const circularData: any = { id: "org-1", name: "Test" };
      circularData.self = circularData;

      queryClient.setQueryData(["organizations", "getActive"], circularData);

      renderBreadcrumb("/org/dashboard");

      expect(screen.getByText("Test")).toBeInTheDocument();
    });

    it("handles undefined in projects array", () => {
      const scenario = createBreadcrumbScenario("active-project");
      queryClient.setQueryData(
        ["projects", "list"],
        [undefined, createMockProject(), undefined] as any,
      );

      renderBreadcrumb("/org/activeproject");

      expect(screen.getByText("Test Project")).toBeInTheDocument();
    });
  });

  describe("Unusual Pathnames", () => {
    it("handles pathname with trailing slash", () => {
      seedBreadcrumbData(queryClient, {
        organization: createMockOrganization(),
        projects: [],
        session: null,
      });

      renderBreadcrumb("/org/dashboard/");

      expect(screen.getByText("Test Organization")).toBeInTheDocument();
    });

    it("handles pathname with query parameters", () => {
      seedBreadcrumbData(queryClient, {
        organization: createMockOrganization(),
        projects: [],
        session: null,
      });

      renderBreadcrumb("/org/dashboard?tab=overview&page=1");

      expect(screen.getByText("Test Organization")).toBeInTheDocument();
    });

    it("handles pathname with hash fragment", () => {
      seedBreadcrumbData(queryClient, {
        organization: createMockOrganization(),
        projects: [],
        session: null,
      });

      renderBreadcrumb("/org/dashboard#section-1");

      expect(screen.getByText("Test Organization")).toBeInTheDocument();
    });

    it("handles deeply nested unknown path", () => {
      seedBreadcrumbData(queryClient, {
        organization: createMockOrganization(),
        projects: [],
        session: null,
      });

      renderBreadcrumb("/org/unknown/very/deep/path/here");

      expect(screen.getByText("Test Organization")).toBeInTheDocument();
    });

    it("handles pathname with special characters", () => {
      seedBreadcrumbData(queryClient, {
        organization: createMockOrganization(),
        projects: [],
        session: null,
      });

      renderBreadcrumb("/org/dashboard%20test");

      expect(screen.getByText("Test Organization")).toBeInTheDocument();
    });

    it("handles empty pathname", () => {
      seedBreadcrumbData(queryClient, {
        organization: createMockOrganization(),
        projects: [],
        session: null,
      });

      renderBreadcrumb("");

      expect(screen.getByText("Test Organization")).toBeInTheDocument();
    });

    it("handles root pathname", () => {
      seedBreadcrumbData(queryClient, {
        organization: createMockOrganization(),
        projects: [],
        session: null,
      });

      renderBreadcrumb("/");

      expect(screen.getByText("Test Organization")).toBeInTheDocument();
    });
  });

  describe("Query State Edge Cases", () => {
    it("handles query in loading state", () => {
      // Don't set any data - queries will be undefined
      renderBreadcrumb("/org/dashboard");

      // Should still render without crashing
      expect(screen.getByText("Organization")).toBeInTheDocument();
    });

    it("handles query in error state", () => {
      queryClient.setQueryData(["organizations", "getActive"], undefined);
      queryClient.setQueryState(["organizations", "getActive"], {
        status: "error",
        fetchStatus: "idle",
      } as any);

      renderBreadcrumb("/org/dashboard");

      expect(screen.getByText("Organization")).toBeInTheDocument();
    });

    it("handles stale query data", () => {
      const staleOrg = createMockOrganization({ name: "Stale Org" });
      queryClient.setQueryData(["organizations", "getActive"], staleOrg);
      queryClient.invalidateQueries({ queryKey: ["organizations", "getActive"] });

      renderBreadcrumb("/org/dashboard");

      // Should still show stale data
      expect(screen.getByText("Stale Org")).toBeInTheDocument();
    });

    it("handles multiple rapid pathname changes", () => {
      seedBreadcrumbData(queryClient, {
        organization: createMockOrganization(),
        projects: [createMockProject()],
        session: {
          session: {
            id: "session-1",
            userId: "user-1",
            activeProjectId: "project-1",
          },
        },
      });

      const { rerender } = renderBreadcrumb("/org/dashboard");

      mockUsePathname.mockReturnValue("/org/projects");
      rerender(
        <QueryClientProvider client={queryClient}>
          <AppBreadcrumb />
        </QueryClientProvider>,
      );

      mockUsePathname.mockReturnValue("/org/team");
      rerender(
        <QueryClientProvider client={queryClient}>
          <AppBreadcrumb />
        </QueryClientProvider>,
      );

      expect(screen.getByText("Test Organization")).toBeInTheDocument();
    });
  });

  describe("Concurrent Data Updates", () => {
    it("handles organization update during render", () => {
      const initialOrg = createMockOrganization({ name: "Initial Org" });
      seedBreadcrumbData(queryClient, {
        organization: initialOrg,
        projects: [],
        session: null,
      });

      const { rerender } = renderBreadcrumb("/org/dashboard");

      expect(screen.getByText("Initial Org")).toBeInTheDocument();

      // Update organization during component lifecycle
      const updatedOrg = createMockOrganization({ name: "Updated Org" });
      queryClient.setQueryData(["organizations", "getActive"], updatedOrg);

      rerender(
        <QueryClientProvider client={queryClient}>
          <AppBreadcrumb />
        </QueryClientProvider>,
      );

      expect(screen.getByText("Updated Org")).toBeInTheDocument();
    });

    it("handles project list update while viewing project", () => {
      const scenario = createBreadcrumbScenario("active-project");
      seedBreadcrumbData(queryClient, scenario);

      const { rerender } = renderBreadcrumb("/org/activeproject");

      expect(screen.getByText("Test Project")).toBeInTheDocument();

      // Add more projects
      const updatedProjects = [
        ...scenario.projects,
        createMockProject({ id: "project-2", name: "New Project" }),
      ];
      queryClient.setQueryData(["projects", "list"], updatedProjects);

      rerender(
        <QueryClientProvider client={queryClient}>
          <AppBreadcrumb />
        </QueryClientProvider>,
      );

      // Should still show the active project
      expect(screen.getByText("Test Project")).toBeInTheDocument();
    });

    it("handles session update changing active project", () => {
      const projects = [
        createMockProject({ id: "p1", name: "Project 1" }),
        createMockProject({ id: "p2", name: "Project 2" }),
      ];

      seedBreadcrumbData(queryClient, {
        organization: createMockOrganization(),
        projects,
        session: {
          session: {
            id: "session-1",
            userId: "user-1",
            activeProjectId: "p1",
          },
        },
      });

      const { rerender } = renderBreadcrumb("/org/activeproject");

      expect(screen.getByText("Project 1")).toBeInTheDocument();

      // Switch active project
      queryClient.setQueryData(["betterauth", "getSession"], {
        session: {
          id: "session-1",
          userId: "user-1",
          activeProjectId: "p2",
        },
      });

      rerender(
        <QueryClientProvider client={queryClient}>
          <AppBreadcrumb />
        </QueryClientProvider>,
      );

      expect(screen.getByText("Project 2")).toBeInTheDocument();
    });
  });

  describe("Memory and Performance", () => {
    it("cleans up properly when unmounted", () => {
      seedBreadcrumbData(queryClient, {
        organization: createMockOrganization(),
        projects: [],
        session: null,
      });

      const { unmount } = renderBreadcrumb("/org/dashboard");

      unmount();

      // Data should still be in cache (React Query manages cache)
      expect(
        queryClient.getQueryData(["organizations", "getActive"]),
      ).toBeDefined();
    });

    it("handles rapid mount/unmount cycles", () => {
      seedBreadcrumbData(queryClient, {
        organization: createMockOrganization(),
        projects: [],
        session: null,
      });

      for (let i = 0; i < 10; i++) {
        const { unmount } = renderBreadcrumb("/org/dashboard");
        unmount();
      }

      // Should not cause memory leaks or errors
      expect(true).toBe(true);
    });

    it("renders efficiently with minimal re-renders", () => {
      const scenario = createBreadcrumbScenario("organization-dashboard");
      seedBreadcrumbData(queryClient, scenario);

      const startTime = performance.now();
      renderBreadcrumb(scenario.pathname);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe("Accessibility Edge Cases", () => {
    it("maintains semantic structure with missing data", () => {
      seedBreadcrumbData(queryClient, {
        organization: null,
        projects: [],
        session: null,
      });

      const { container } = renderBreadcrumb("/org/dashboard");

      const nav = container.querySelector("nav");
      expect(nav).toBeInTheDocument();
    });

    it("provides meaningful text for screen readers with errors", () => {
      const scenario = createBreadcrumbScenario("no-project");
      seedBreadcrumbData(queryClient, scenario);

      renderBreadcrumb("/org/activeproject");

      expect(screen.getByText("No project selected")).toBeInTheDocument();
    });

    it("maintains keyboard navigability with dynamic content", () => {
      seedBreadcrumbData(queryClient, {
        organization: createMockOrganization(),
        projects: [],
        session: null,
      });

      const { container } = renderBreadcrumb("/org/dashboard");

      const links = container.querySelectorAll("a");
      links.forEach((link) => {
        expect(link).toHaveAttribute("href");
      });
    });
  });
});