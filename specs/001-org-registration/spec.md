# Feature Specification: Organization Registration & Dashboard

**Feature Branch**: `001-org-registration`  
**Created**: November 7, 2025  
**Status**: Draft  
**Input**: User description: "Organization registration for verified users with dashboard, team management, and project overview"

## Clarifications

### Session 2025-11-07

- Q: Organization slug length constraints for URL compatibility and database efficiency? → A: Min: 3 chars, Max: 50 chars
- Q: Organization name length constraints for consistency and validation? → A: Min: 3 chars, Max: 50 chars
- Q: Dashboard tab persistence behavior (session, database, URL-based, or none)? → A: URL-based by URL parameter using nuqs library
- Q: Team table member display limit for initial release? → A: Display all members, no pagination for MVP
- Q: Empty state messaging style for Projects tab? → A: Instructional with shadcn Empty component
- Q: How to handle performance acceptance criteria and testing? → A: No performance testing in scope; remove timing SLAs from success criteria.
- Q: What accessibility scope applies for the MVP? → A: Rely on shadcn/ui default semantics only; no additional accessibility audit or custom a11y work in MVP.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - First Organization Creation (Priority: P1)

A newly registered user with a verified email address needs to create their first organization before accessing any features. This is the entry point for all verified users.

**Why this priority**: This is the foundational requirement. Without the ability to create an organization, users cannot access any other features. It's the minimum viable product that gates all subsequent functionality.

**Independent Test**: Can be fully tested by completing user registration, verifying email, logging in, and successfully creating an organization with a unique name and slug. Delivers immediate value by allowing the user to establish their workspace.

**Acceptance Scenarios**:

1. **Given** a user has registered and verified their email address, **When** they log in for the first time, **Then** they are redirected to an organization creation screen with no other navigation options available
2. **Given** a user is on the organization creation screen, **When** they provide an organization name and slug, **Then** the organization is created and they become the owner with full permissions
3. **Given** a user submits an organization creation form, **When** the slug is already taken, **Then** they receive a clear error message indicating the slug must be unique
4. **Given** a user successfully creates their first organization, **When** the creation completes, **Then** they are redirected to the main dashboard with full navigation enabled

---

### User Story 2 - Dashboard Navigation & Organization Context (Priority: P2)

Once an organization is created, users need to view their organization dashboard with clear navigation to access different sections (Dashboard stats, Team members, Projects).

**Why this priority**: After creating an organization, users need to understand their workspace and access its features. This provides the structure for all organization-related activities.

**Independent Test**: Can be tested by creating an organization and verifying that the dashboard displays with three accessible tabs (Dashboard, Team, Projects). Each tab should be navigable and display appropriate content or empty states.

**Acceptance Scenarios**:

1. **Given** a user has created an organization, **When** they access the dashboard, **Then** they see a top tab navigation with three options: Dashboard, Team, and Projects
2. **Given** a user is on the dashboard, **When** they view the Dashboard tab, **Then** they see a statistics section (currently empty with a placeholder for future implementation)
3. **Given** a user is on the dashboard, **When** they switch between tabs, **Then** the active tab is visually indicated and the corresponding content is displayed
4. **Given** a user is viewing a specific tab, **When** the URL contains a tab parameter, **Then** the corresponding tab is displayed and the URL reflects the current tab selection

---

### User Story 3 - Team Members Overview (Priority: P2)

Organization owners need to see all members belonging to their organization, starting with themselves as the owner, to understand who has access to their workspace.

**Why this priority**: Visibility into team membership is essential for collaboration and access control. This provides the foundation for future team management features like inviting members or managing permissions.

**Independent Test**: Can be tested by accessing the Team tab and verifying that a table displays with at least one row showing the organization owner's information (name, email, role as "owner", join date).

**Acceptance Scenarios**:

1. **Given** a user is viewing their organization dashboard, **When** they navigate to the Team tab, **Then** they see a table displaying all organization members
2. **Given** a user is viewing the Team tab immediately after creating an organization, **When** the table loads, **Then** it shows exactly one member (themselves) with the role "owner"
3. **Given** a user is viewing the Team members table, **When** they review the displayed information, **Then** each member entry shows: user name, email address, role, and join date
4. **Given** a user has just created an organization, **When** they view the Team tab, **Then** their join date reflects the organization creation timestamp

---

### User Story 4 - Projects Grid View (Priority: P3)

Organization owners need to view all projects associated with their organization in a visual grid layout to understand their active work and quickly access project details.

**Why this priority**: Projects are a key deliverable of organizations, but the feature is lower priority than organization setup and team visibility. An empty state initially is acceptable as long as the structure is in place for future project creation.

**Independent Test**: Can be tested by accessing the Projects tab and verifying that either a grid of project cards displays (if projects exist) or an empty state component appears with appropriate messaging encouraging project creation.

**Acceptance Scenarios**:

1. **Given** a user is viewing their organization dashboard, **When** they navigate to the Projects tab, **Then** they see a grid layout for displaying projects
2. **Given** a user has no projects in their organization, **When** they view the Projects tab, **Then** they see an empty state component with a message indicating no projects exist
3. **Given** projects exist in the organization, **When** the Projects tab loads, **Then** each project is displayed as a card in the grid showing project name, description, and status
4. **Given** a user is viewing the Projects tab, **When** the content loads, **Then** the layout is responsive and adapts to different screen sizes

---

### Edge Cases

- What happens when a user tries to access the dashboard without having created an organization? The user should be redirected to the organization creation screen with all other navigation disabled.
- What happens when an organization slug contains invalid characters or exceeds length limits? The form should validate and display specific error messages guiding the user to correct the input.
- What happens when a user's email verification status changes after they've started creating an organization? The system should re-verify email status before allowing organization creation to complete.
- What happens when the organization creation process fails partway through (network error, database issue)? The system should roll back any partial changes and present a clear error message allowing the user to retry.
- What happens when a user navigates directly to a dashboard URL without being authenticated? The system should redirect to the login page with a return URL to bring them back after authentication.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST verify that a user's email address is verified before allowing organization creation *(satisfied by Better Auth configuration: requireEmailVerification: true)*
- **FR-002**: System MUST enforce that only authenticated users can create organizations *(satisfied by Better Auth session management)*
- **FR-003**: System MUST require a unique organization slug that serves as a URL-friendly identifier
- **FR-004**: System MUST automatically assign the "owner" role to the user who creates an organization
- **FR-005**: System MUST redirect unauthenticated users attempting to access the dashboard to the login page
- **FR-006**: System MUST redirect users without any organizations to the organization creation screen
- **FR-007**: System MUST display an organization creation form as the only available action for users with verified emails but no organizations
- **FR-008**: System MUST persist organization data including name (minimum 3 characters, maximum 50 characters), slug, owner, and creation timestamp
- **FR-009**: System MUST display a tabbed navigation interface with three sections: Dashboard, Team, and Projects
- **FR-010**: System MUST show at least one member (the owner) in the Team members table immediately after organization creation
- **FR-011**: System MUST display member information including name, email, role, and join date in the Team table (display all members without pagination for MVP)
- **FR-012**: System MUST render a grid layout for displaying project cards in the Projects tab
- **FR-013**: System MUST display an empty state component when no projects exist in an organization using the shadcn Empty component with instructional messaging and future action guidance
- **FR-014**: System MUST validate organization slugs to ensure they are URL-safe (alphanumeric characters and hyphens only, minimum 3 characters, maximum 50 characters)
- **FR-015**: System MUST provide clear error messages when organization creation fails (e.g., slug already taken, validation errors)
- **FR-016**: System MUST maintain the user's active organization context across page navigation
- **FR-017**: System MUST use URL parameters to manage and persist the active dashboard tab selection (no session or database persistence required)
- **FR-018**: System MUST visually indicate which tab is currently active in the dashboard navigation
- **FR-019**: System MUST store the relationship between users and organizations in the member table with appropriate role assignments

### Key Entities

- **Organization**: Represents a workspace or team container. Key attributes include unique identifier, name (3-50 characters), URL-friendly slug (3-50 characters, alphanumeric and hyphens only), optional logo, creation timestamp, and metadata. Each organization has one owner initially.
- **Member**: Represents the relationship between a user and an organization. Key attributes include unique identifier, user reference, organization reference, role (owner/admin/member), and join timestamp. The member who creates the organization receives the "owner" role.
- **User**: Represents an authenticated person. Must have verified email address. Related to organizations through member relationships.
- **Project**: Represents work items or initiatives within an organization. Key attributes include unique identifier, organization reference, name, description, and status. Displayed as cards in the Projects tab grid.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-002**: [has become obsolete, already implemented]
- **SC-002**: 100% of users with verified email addresses are presented with the organization creation screen when they have no organizations
- **SC-003**: Organization creation succeeds with valid input and fails gracefully with clear error messages for invalid input
 - **SC-004**: Dashboard loads with all three tabs (Dashboard, Team, Projects) accessible after organization creation
 - **SC-005**: Team table displays the organization owner's information accurately upon navigating to the Team tab
- **SC-006**: Users can navigate between all three dashboard tabs without page reloads or errors
- **SC-007**: Empty state is displayed in Projects tab when no projects exist, providing clear guidance to users
- **SC-008**: (has become obsolete!)
- **SC-009**: All organization slugs remain unique across the system with zero conflicts
- **SC-010**: Users understand their organization context and membership status by viewing the Team tab

## Assumptions

1. Better Auth organization plugin is fully configured and database migrations have been applied
2. User registration and email verification flows are already implemented and working
3. Session management maintains authentication state across page navigation
4. The application uses Next.js App Router with React components
5. UI components from shadcn/ui library (Table, Card, Tabs, Empty) are already installed and configured
6. The nuqs library is used for URL-based state management (tab persistence via URL parameters)
7. Organization slugs will be manually entered by users (no auto-generation from organization name)
8. Logo upload for organizations is optional and can be added later
9. The Dashboard statistics tab can remain empty initially with a placeholder
10. Projects functionality will be implemented in a future phase; this feature only needs to display the Projects tab with an empty state
11. Only single organization ownership is supported initially; multi-organization support can be added later
12. No formal performance targets; no performance testing is in scope for MVP
13. Users access the application through modern web browsers (Chrome, Firefox, Safari, Edge - last 2 versions)
