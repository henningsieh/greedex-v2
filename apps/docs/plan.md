# Fumadocs Documentation Setup Plan for Greendex Calculator

## Overview

This plan outlines the setup of a comprehensive Fumadocs documentation site for the Greendex Carbon Footprint Calculator app. The documentation will cover all areas of the application with industry-standard layout (left sidebar navigation + right "on this page" scroll indicator).

## App Structure Analysis

### 1. Landing Page Area (`(landingpage)`)

- **Home** (`/`) - Main landing page with hero, globe section, workshops
- **About** (`/about`) - Partners, Erasmus funding info
- **Workshops** (`/workshops`) - Workshop guides (moment, deal, day types)
- **Library** (`/library`) - Resource library
- **E+ Forest** (`/e-forest`) - Environmental initiative page
- **Tips & Tricks** (`/tips-and-tricks`) - Helpful tips

### 2. Authentication Area (`(auth)`)

- **Login** (`/login`) - User login with social providers
- **Signup** (`/signup`) - Account creation
- **Forgot Password** (`/forgot-password`) - Password reset request
- **Reset Password** (`/reset-password`) - Password reset with token
- **Verify Email** (`/verify-email`) - Email verification flow

### 3. Organization Setup Area (`(org-setup)`)

- **Create Organization** (`/org/create`) - First-time org creation

### 4. App Core Area (`(app)`) - Protected Routes

- **Dashboard** (`/org/dashboard`) - Organization overview, stats, projects
- **Projects** (`/org/projects`) - Project list and management
- **Project Details** (`/org/projects/[id]`) - Individual project view with tabs
- **Create Project** (`/org/create-project`) - New project creation form
- **Projects Archive** (`/org/projects-archive`) - Archived projects
- **Participants** (`/org/participants`) - Project participants list
- **Team** (`/org/team`) - Organization team members
- **Settings** (`/org/settings`) - Organization settings
- **Live View** (`/org/activeproject/liveview`) - Real-time project monitoring
- **User Settings** (`/user/settings`) - User profile and preferences
- **Accept Invitation** (`/accept-invitation/[invitationId]`) - Team invitation acceptance flow (see Team Invitations section below)

### 5. Public Participation Area (`(public participation)`)

- **Participate Form** (`/project/[id]/participate`) - Public carbon footprint form

## Team Invitation Flow (Cross-Cutting Feature)

The team invitation system spans multiple components and pages:

### 1. Sending Invitations (Team Management)

- **Location**: Team page (`/org/team`) via InviteEmployeeDialog component
- **Process**:
  - Organization owners/employees can invite new team members
  - Enter email, name, and select role (Owner, Employee, or Participant)
  - Invitation email sent to the recipient
  - Pending invitations appear in the team list

### 2. Accepting Invitations

- **Entry Point**: Email link → `/accept-invitation/[invitationId]`
- **Authentication Check**:
  - If user is not logged in → redirect to signup/login with `nextPageUrl` parameter
  - After authentication → redirect back to invitation acceptance page
- **Acceptance Flow**:
  - Logged-in user visits invitation URL
  - System validates the invitation
  - User clicks "Accept Invitation" button
  - User is added to the organization with the specified role
  - Redirect to Dashboard

### 3. Role-Based Access

- **Owner**: Full organization control, can invite any role
- **Employee**: Can invite Participants, view team and participants
- **Participant**: Cannot invite, limited access to projects

## Documentation Structure

```
content/docs/
├── index.mdx                    # Introduction / Getting Started
├── getting-started/
│   ├── index.mdx               # Quick Start
│   ├── installation.mdx        # Installation guide
│   └── configuration.mdx       # Configuration options
├── landing-page/
│   ├── index.mdx               # Landing Page Overview
│   ├── home.mdx                # Home Page
│   ├── about.mdx               # About Page
│   ├── workshops.mdx           # Workshops Guide
│   ├── library.mdx             # Library
│   ├── e-forest.mdx            # E+ Forest
│   └── tips-and-tricks.mdx     # Tips & Tricks
├── authentication/
│   ├── index.mdx               # Authentication Overview
│   ├── login.mdx               # Login
│   ├── signup.mdx              # Sign Up
│   ├── forgot-password.mdx     # Forgot Password
│   ├── reset-password.mdx      # Reset Password
│   └── verify-email.mdx        # Verify Email
├── organization/
│   ├── index.mdx               # Organization Overview
│   ├── create.mdx              # Create Organization
│   ├── settings.mdx            # Organization Settings
│   ├── team.mdx                # Team Management
│   └── invitations.mdx         # Team Invitations (send & accept flow)
├── projects/
│   ├── index.mdx               # Projects Overview
│   ├── dashboard.mdx           # Dashboard
│   ├── list.mdx                # Project List
│   ├── create.mdx              # Create Project
│   ├── details.mdx             # Project Details
│   ├── archive.mdx             # Project Archive
│   └── live-view.mdx           # Live View
├── participants/
│   ├── index.mdx               # Participants Overview
│   └── management.mdx          # Participant Management
├── user/
│   ├── index.mdx               # User Overview
│   └── settings.mdx            # User Settings
├── participation/
│   ├── index.mdx               # Public Participation Overview
│   └── participate-form.mdx    # Participation Form
└── api/
    └── index.mdx               # API Reference (if needed)
```

## Technical Implementation

### Required Files

1. **source.config.ts** - Fumadocs MDX configuration
2. **next.config.ts** - Updated with MDX plugin
3. **tsconfig.json** - Path alias for fumadocs-mdx
4. **lib/source.ts** - Content source integration
5. **lib/layout.shared.tsx** - Shared layout options
6. **mdx-components.tsx** - MDX component mapping
7. **src/app/layout.tsx** - Root layout with RootProvider
8. **src/app/docs/layout.tsx** - Docs layout with sidebar
9. **src/app/docs/[[...slug]]/page.tsx** - Dynamic docs pages
10. **src/app/api/search/route.ts** - Search endpoint
11. **src/app/globals.css** - Global styles with fumadocs

### Layout Features

- **Left Sidebar**: Main navigation with collapsible sections
- **Right Sidebar**: "On this page" scroll indicator showing current heading
- **Top Navigation**: Logo, search, theme toggle
- **Breadcrumbs**: Navigation trail
- **Search**: Full-text search powered by Orama

## Content Guidelines

Each documentation page should include:

- Clear title and description
- Overview/introduction section
- Step-by-step instructions where applicable
- Screenshots or diagrams (placeholder for now)
- Related links and next steps
- Code examples where relevant
