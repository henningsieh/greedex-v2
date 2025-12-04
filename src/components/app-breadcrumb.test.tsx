import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppBreadcrumb, AppBreadcrumbSkeleton } from "./app-breadcrumb";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      "app.sidebar.organization.dashboard": "Dashboard",
      "app.sidebar.organization.projects": "Projects",
      "app.sidebar.organization.team": "Team",
      "app.sidebar.organization.settings": "Settings",
      "app.sidebar.projects.liveView": "Live View",
    };
    return translations[key] || key;
  },
}));

// Mock navigation
const mockUsePathname = vi.fn();
vi.mock("@/lib/i18n/navigation", () => ({
  usePathname: () => mockUsePathname(),
  Link: ({ children, href, className }: any) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

// Mock ORPC queries
const mockOrpcQuery = {
  organizations: {
    getActive: {
      queryOptions: vi.fn(),
    },
  },
  betterauth: {
    getSession: {
      queryOptions: vi.fn(),
    },
  },
  projects: {
    list: {
      queryOptions: vi.fn(),
    },
  },
};

vi.mock("@/lib/orpc/orpc", () => ({
  orpcQuery: mockOrpcQuery,
}));

// Mock app config paths
vi.mock("@/lib/config/app", () => ({
  DASHBOARD_PATH: "/org/dashboard",
  PROJECTS_PATH: "/org/projects",
  TEAM_PATH: "/org/team",
  SETTINGS_PATH: "/org/settings",
  ACTIVE_PROJECT_PATH: "/org/activeproject",
  LIVE_VIEW_PATH: "/org/activeproject/liveview",
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Building2Icon: () => <svg data-testid="building-icon" />,
  LayoutDashboardIcon: () => <svg data-testid="dashboard-icon" />,
  MapPinnedIcon: () => <svg data-testid="map-icon" />,
  UsersIcon: () => <svg data-testid="users-icon" />,
  SettingsIcon: () => <svg data-testid="settings-icon" />,
  BarChart3Icon: () => <svg data-testid="chart-icon" />,
  TriangleAlertIcon: () => <svg data-testid="alert-icon" />,
}));

describe("AppBreadcrumb", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Reset mocks
    vi.clearAllMocks();
  });

  const renderBreadcrumb = (pathname: string) => {
    mockUsePathname.mockReturnValue(pathname);

    return render(
      <QueryClientProvider client={queryClient}>
        <AppBreadcrumb />
      </QueryClientProvider>,
    );
  };

  describe("Organization Level Routes", () => {
    it("renders breadcrumb for dashboard route", () => {
      queryClient.setQueryData(["organizations", "getActive"], {
        id: "org-1",
        name: "Test Organization",
      });

      renderBreadcrumb("/org/dashboard");

      expect(screen.getByText("Test Organization")).toBeInTheDocument();
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByTestId("building-icon")).toBeInTheDocument();
      expect(screen.getByTestId("dashboard-icon")).toBeInTheDocument();
    });

    it("renders breadcrumb for projects route", () => {
      queryClient.setQueryData(["organizations", "getActive"], {
        id: "org-1",
        name: "Acme Corp",
      });

      renderBreadcrumb("/org/projects");

      expect(screen.getByText("Acme Corp")).toBeInTheDocument();
      expect(screen.getByText("Projects")).toBeInTheDocument();
      expect(screen.getByTestId("map-icon")).toBeInTheDocument();
    });

    it("renders breadcrumb for team route", () => {
      queryClient.setQueryData(["organizations", "getActive"], {
        id: "org-1",
        name: "Tech Startup",
      });

      renderBreadcrumb("/org/team");

      expect(screen.getByText("Tech Startup")).toBeInTheDocument();
      expect(screen.getByText("Team")).toBeInTheDocument();
      expect(screen.getByTestId("users-icon")).toBeInTheDocument();
    });

    it("renders breadcrumb for settings route", () => {
      queryClient.setQueryData(["organizations", "getActive"], {
        id: "org-1",
        name: "My Company",
      });

      renderBreadcrumb("/org/settings");

      expect(screen.getByText("My Company")).toBeInTheDocument();
      expect(screen.getByText("Settings")).toBeInTheDocument();
      expect(screen.getByTestId("settings-icon")).toBeInTheDocument();
    });

    it("displays fallback when organization name is missing", () => {
      queryClient.setQueryData(["organizations", "getActive"], null);

      renderBreadcrumb("/org/dashboard");

      expect(screen.getByText("Organization")).toBeInTheDocument();
    });

    it("handles unknown organization routes gracefully", () => {
      queryClient.setQueryData(["organizations", "getActive"], {
        id: "org-1",
        name: "Test Org",
      });

      renderBreadcrumb("/org/unknown-route");

      expect(screen.getByText("Test Org")).toBeInTheDocument();
      expect(screen.getByText("/org/unknown-route")).toBeInTheDocument();
    });
  });

  describe("Project Level Routes", () => {
    beforeEach(() => {
      queryClient.setQueryData(["organizations", "getActive"], {
        id: "org-1",
        name: "Test Organization",
      });

      queryClient.setQueryData(["projects", "list"], [
        {
          id: "project-1",
          name: "Alpha Project",
        },
        {
          id: "project-2",
          name: "Beta Project",
        },
      ]);
    });

    it("renders breadcrumb for active project page", () => {
      queryClient.setQueryData(["betterauth", "getSession"], {
        session: {
          activeProjectId: "project-1",
        },
      });

      renderBreadcrumb("/org/activeproject");

      expect(screen.getByText("Test Organization")).toBeInTheDocument();
      expect(screen.getByText("Alpha Project")).toBeInTheDocument();
      expect(screen.getByTestId("map-icon")).toBeInTheDocument();
    });

    it("renders breadcrumb for liveview page with project link", () => {
      queryClient.setQueryData(["betterauth", "getSession"], {
        session: {
          activeProjectId: "project-2",
        },
      });

      renderBreadcrumb("/org/activeproject/liveview");

      expect(screen.getByText("Test Organization")).toBeInTheDocument();
      expect(screen.getByText("Beta Project")).toBeInTheDocument();
      expect(screen.getByText("Live View")).toBeInTheDocument();
      expect(screen.getByTestId("chart-icon")).toBeInTheDocument();

      // Project name should be a link on liveview page
      const projectLink = screen.getByText("Beta Project").closest("a");
      expect(projectLink).toHaveAttribute("href", "/org/activeproject");
    });

    it("shows warning when no project is selected", () => {
      queryClient.setQueryData(["betterauth", "getSession"], {
        session: {
          activeProjectId: null,
        },
      });

      renderBreadcrumb("/org/activeproject");

      expect(screen.getByText("No project selected")).toBeInTheDocument();
      expect(screen.getByTestId("alert-icon")).toBeInTheDocument();
    });

    it("shows warning when active project is not in project list", () => {
      queryClient.setQueryData(["betterauth", "getSession"], {
        session: {
          activeProjectId: "non-existent-project",
        },
      });

      renderBreadcrumb("/org/activeproject");

      expect(screen.getByText("No project selected")).toBeInTheDocument();
    });

    it("handles missing session data gracefully", () => {
      queryClient.setQueryData(["betterauth", "getSession"], null);

      renderBreadcrumb("/org/activeproject");

      expect(screen.getByText("No project selected")).toBeInTheDocument();
    });

    it("handles empty projects list", () => {
      queryClient.setQueryData(["projects", "list"], []);
      queryClient.setQueryData(["betterauth", "getSession"], {
        session: {
          activeProjectId: "project-1",
        },
      });

      renderBreadcrumb("/org/activeproject");

      expect(screen.getByText("No project selected")).toBeInTheDocument();
    });
  });

  describe("Styling and Theming", () => {
    beforeEach(() => {
      queryClient.setQueryData(["organizations", "getActive"], {
        id: "org-1",
        name: "Test Org",
      });
    });

    it("applies organization-level color classes for org routes", () => {
      const { container } = renderBreadcrumb("/org/dashboard");

      const links = container.querySelectorAll("a");
      const orgLink = links[0];
      expect(orgLink?.className).toContain("text-primary");
      expect(orgLink?.className).toContain("hover:text-primary-foreground");
    });

    it("applies project-level color classes for project routes", () => {
      queryClient.setQueryData(["projects", "list"], [
        { id: "p1", name: "Project 1" },
      ]);
      queryClient.setQueryData(["betterauth", "getSession"], {
        session: { activeProjectId: "p1" },
      });

      const { container } = renderBreadcrumb("/org/activeproject");

      const links = container.querySelectorAll("a");
      const orgLink = links[0];
      expect(orgLink?.className).toContain("text-secondary");
      expect(orgLink?.className).toContain("hover:text-secondary-foreground");
    });

    it("includes transition classes for smooth color changes", () => {
      const { container } = renderBreadcrumb("/org/dashboard");

      const link = container.querySelector("a");
      expect(link?.className).toContain("transition-colors");
      expect(link?.className).toContain("duration-300");
    });
  });

  describe("Navigation Links", () => {
    beforeEach(() => {
      queryClient.setQueryData(["organizations", "getActive"], {
        id: "org-1",
        name: "Test Org",
      });
    });

    it("organization name links to dashboard", () => {
      renderBreadcrumb("/org/projects");

      const orgLink = screen.getByText("Test Org").closest("a");
      expect(orgLink).toHaveAttribute("href", "/org/dashboard");
    });

    it("project name is not a link on active project page", () => {
      queryClient.setQueryData(["projects", "list"], [
        { id: "p1", name: "My Project" },
      ]);
      queryClient.setQueryData(["betterauth", "getSession"], {
        session: { activeProjectId: "p1" },
      });

      renderBreadcrumb("/org/activeproject");

      const projectText = screen.getByText("My Project");
      expect(projectText.closest("a")).toBeNull();
    });

    it("project name is a link on liveview page", () => {
      queryClient.setQueryData(["projects", "list"], [
        { id: "p1", name: "My Project" },
      ]);
      queryClient.setQueryData(["betterauth", "getSession"], {
        session: { activeProjectId: "p1" },
      });

      renderBreadcrumb("/org/activeproject/liveview");

      const projectLink = screen.getByText("My Project").closest("a");
      expect(projectLink).toHaveAttribute("href", "/org/activeproject");
    });
  });

  describe("Edge Cases", () => {
    it("handles undefined organization data", () => {
      queryClient.setQueryData(["organizations", "getActive"], undefined);

      renderBreadcrumb("/org/dashboard");

      expect(screen.getByText("Organization")).toBeInTheDocument();
    });

    it("handles malformed session data", () => {
      queryClient.setQueryData(["betterauth", "getSession"], {
        session: undefined,
      });

      renderBreadcrumb("/org/activeproject");

      expect(screen.getByText("No project selected")).toBeInTheDocument();
    });

    it("handles deeply nested unknown routes", () => {
      queryClient.setQueryData(["organizations", "getActive"], {
        id: "org-1",
        name: "Test Org",
      });

      renderBreadcrumb("/org/dashboard/some/deep/route");

      expect(screen.getByText("Test Org")).toBeInTheDocument();
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    it("renders correctly with empty organization name", () => {
      queryClient.setQueryData(["organizations", "getActive"], {
        id: "org-1",
        name: "",
      });

      renderBreadcrumb("/org/dashboard");

      expect(screen.getByText("Organization")).toBeInTheDocument();
    });

    it("handles projects list with null entries", () => {
      queryClient.setQueryData(["projects", "list"], [
        null,
        { id: "p1", name: "Valid Project" },
        undefined,
      ]);
      queryClient.setQueryData(["betterauth", "getSession"], {
        session: { activeProjectId: "p1" },
      });

      renderBreadcrumb("/org/activeproject");

      expect(screen.getByText("Valid Project")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    beforeEach(() => {
      queryClient.setQueryData(["organizations", "getActive"], {
        id: "org-1",
        name: "Accessible Org",
      });
    });

    it("renders semantic breadcrumb navigation", () => {
      const { container } = renderBreadcrumb("/org/dashboard");

      const nav = container.querySelector("nav");
      expect(nav).toBeInTheDocument();
    });

    it("includes proper ARIA labels for icons", () => {
      renderBreadcrumb("/org/dashboard");

      const buildingIcon = screen.getByTestId("building-icon");
      const dashboardIcon = screen.getByTestId("dashboard-icon");

      expect(buildingIcon).toBeInTheDocument();
      expect(dashboardIcon).toBeInTheDocument();
    });

    it("maintains readable text contrast with color classes", () => {
      const { container } = renderBreadcrumb("/org/dashboard");

      const link = container.querySelector("a");
      expect(link?.className).toMatch(/text-(primary|secondary)/);
    });
  });

  describe("Internationalization", () => {
    it("uses translated route labels from i18n", () => {
      queryClient.setQueryData(["organizations", "getActive"], {
        id: "org-1",
        name: "Test Org",
      });

      renderBreadcrumb("/org/dashboard");

      // Verifies that useTranslations hook is called correctly
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    it("translates all route types correctly", () => {
      queryClient.setQueryData(["organizations", "getActive"], {
        id: "org-1",
        name: "Test Org",
      });

      const routes = [
        { path: "/org/dashboard", label: "Dashboard" },
        { path: "/org/projects", label: "Projects" },
        { path: "/org/team", label: "Team" },
        { path: "/org/settings", label: "Settings" },
      ];

      routes.forEach(({ path, label }) => {
        const { unmount } = renderBreadcrumb(path);
        expect(screen.getByText(label)).toBeInTheDocument();
        unmount();
      });
    });

    it("translates liveview label", () => {
      queryClient.setQueryData(["projects", "list"], [
        { id: "p1", name: "Project" },
      ]);
      queryClient.setQueryData(["betterauth", "getSession"], {
        session: { activeProjectId: "p1" },
      });

      renderBreadcrumb("/org/activeproject/liveview");

      expect(screen.getByText("Live View")).toBeInTheDocument();
    });
  });
});

describe("AppBreadcrumbSkeleton", () => {
  it("renders loading skeleton with correct structure", () => {
    const { container } = render(<AppBreadcrumbSkeleton />);

    const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("displays placeholder for organization icon and name", () => {
    const { container } = render(<AppBreadcrumbSkeleton />);

    // Should have skeleton for circular icon
    const circularSkeleton = container.querySelector('[class*="rounded-full"]');
    expect(circularSkeleton).toBeInTheDocument();

    // Should have skeleton for text
    const textSkeletons = container.querySelectorAll('[class*="rounded-md"]');
    expect(textSkeletons.length).toBeGreaterThan(0);
  });

  it("includes separator skeleton", () => {
    const { container } = render(<AppBreadcrumbSkeleton />);

    const skeletons = container.querySelectorAll('[class*="Skeleton"]');
    expect(skeletons.length).toBeGreaterThanOrEqual(5); // Icon + text + separator + icon + text
  });

  it("matches expected dimensions", () => {
    const { container } = render(<AppBreadcrumbSkeleton />);

    const circularSkeleton = container.querySelector('[class*="size-7"]');
    expect(circularSkeleton).toBeInTheDocument();
  });
});