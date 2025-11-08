<!--
Sync Impact Report
- Version change: template -> 1.0.0
- Modified principles: (new) I. User Privacy & GDPR Compliance; II. Accuracy & Transparency; III. Accessibility & Inclusivity; IV. Test-First & Reproducibility; V. Simplicity & Maintainability
- Added sections: Technical & Compliance Constraints; Development Workflow & Quality Gates
- Removed sections: none
- Templates requiring updates:
	- .specify/templates/plan-template.md: ✅ reviewed
	- .specify/templates/spec-template.md: ✅ reviewed
	- .specify/templates/tasks-template.md: ✅ reviewed
	- .specify/templates/checklist-template.md: ⚠ pending — update Constitution Check rules to reference new principles
- Follow-up TODOs:
	- TODO(CHECKLIST_TEMPLATE): Align 'Constitution Check' gates with Principle IV (Test-First) and Principle I (Privacy/GDPR).
-->

# Greendex 2.0 Constitution

## Core Principles

### I. User Privacy & GDPR Compliance
All features MUST minimise collection of personal data and treat any personal
data as sensitive. Personal data storage MUST be explicit and pseudonymised
where possible; retention MUST be the minimal period required. All processing
for EU users MUST comply with GDPR. The project MUST provide mechanisms for
consent, data export, and deletion (user-facing controls and an administrative
process).

Rationale: Greendex handles mobility and travel data tied to individuals and
institutions. User privacy and legal compliance are non-negotiable.

### II. Accuracy & Transparency
All CO₂ calculations, emission factors, and dataset sources MUST be
documented, versioned, and reproducible. Any assumption or approximation used
in outputs MUST be exposed in the UI and documentation, with a link to the
dataset and its version.

Rationale: Outputs inform decisions and reporting; transparency and auditability
are essential to stakeholder trust.

### III. Accessibility & Inclusivity
UI and content MUST is simple english, as this is the common language.

Rationale: Erasmus+ serves diverse users across Europe; accessibility and
language coverage are essential for fairness and adoption.

### IV. Test-First & Reproducibility (NON-NEGOTIABLE)
All new features MUST include test specifications and contracts. The actual test
implementation is done manually by the project maintainer. AI agents MUST NOT
generate test implementation code (no Vitest, Playwright, or test runner code).
The CO₂ calculation engine MUST have deterministic test contracts that specify
expected numerical outputs for known inputs and dataset versions.

Rationale: Calculation correctness and reproducibility are central to the
project's mission and credibility. Tests are implemented manually to ensure
proper integration with the existing test infrastructure.

**AI Agent Constraints**:
- NEVER run the application (`bun run dev`, `bun run build`, `bun run start`)
- NEVER execute test commands (`bun test`, `npm test`, `vitest`, `playwright test`)
- The user maintains a running development server in the background
- Focus on code generation, not execution or testing

### V. Simplicity & Maintainability
Favor clear, well-documented solutions over premature optimisation. Modules
MUST have a clear responsibility, be well-typed, and include inline and
repository-level documentation. Code MUST pass linting and formatting checks
before merge.

Rationale: Simpler code lowers risk, aids audits (privacy/security), and eases
contribution from partner institutions.

## Entities

- **Organization**: The entity that plans and implements international
	projects. An Organization represents a legal or educational institution
	responsible for one or more Projects and for the associated administrative
	data, consent flows, and membership management.
- **Project**: A Project describes a single Erasmus+ activity or set of
	activities, including title, description, start and end dates. A Project
	logically belongs to an owning Organization and references its Participants
	and the activity dataset(s) used for CO₂ calculations.
- **Participant**: A Participant is a pupil or student participating in a
	Project. Participants travel to project locations and produce trip records
	(mode, origin, destination, date) that feed the CO₂ calculations. Personal
	data for Participants MUST be minimised and handled in compliance with
	Principle I.

All roles, membership relationships, and business logic for Organizations,
Projects, and Participants MUST be implemented using the `Better-Auth`
organization plugin (see `.github/instructions/better-auth.organizations.md.instructions.md`) and the
project's `src/lib/better-auth` configuration. Use the plugin's organization,
member, invitation and role APIs to model access control, ownership, teams,
and role-based permissions for these entities.

## Technical & Compliance Constraints

- **Stack**: Next.js 16 (App Router), custom server at `src/server.ts`,
	`Better-Auth` (Drizzle adapter) for authentication, `drizzle` + PostgreSQL for
	DB, `shadcn` + Tailwind for UI components.
- **Authentication**: Use `Better-Auth` with the Drizzle/Postgres adapter as the
	canonical auth solution. OAuth providers for institutional logins are allowed
	but MUST be configured to limit scopes and present clear privacy notices.
- **Data Handling**: Persist mobility and event records in Postgres. Separate
	personally-identifying information from analytic datasets when possible
	(pseudonymisation). Document data retention policies in `docs/privacy.md`.
- **Security**: Secrets MUST be stored in environment variables or a secrets
	manager. TLS is required in all environments exposing user data. Follow OWASP
	guidance and perform threat modeling for sensitive components.
- **Privacy by Design**: Telemetry and logs MUST avoid storing personal
	identifiers. Introduce DPIA when adding new personal-data processing features.

## Development Workflow & Quality Gates

- **Branching**: Short-lived feature branches (e.g., `feature/xxx`), PRs to
	`main` only.
- **Code Review**: Every PR MUST have at least one approving reviewer and a
	successful CI run. Changes touching auth, data models, or calculation logic
	MUST be reviewed by a core maintainer.
- **CI/Tests**: PRs MUST run lint/format (biome), unit tests, and relevant
	integration tests. Critical calculation regressions MUST be prevented by
	automated tests tied to dataset versions. Test implementation is handled
	manually by project maintainers.
- **Build / Release**: Local dev uses `bun run dev` (maintained by user).
	**AI agents MUST NOT run the application**. Production build follows
	`bun run build` -> `bun run start` and relies on compiled `out/server.js` as
	the authoritative artifact.
- **Documentation**: Specs, plans, and PR descriptions MUST reference the
	constitution when they affect privacy, calculations, accessibility, or
	governance.

## Governance

1. Proposal: Any change to this constitution or to governance-relevant policies
	 MUST be proposed via a repository pull request that includes a migration
	 plan (if applicable) and the rationale for the change.
2. Review & Approval: Constitutional amendments MUST be approved by at least
	 two core maintainers. For additions that materially change project
	 responsibilities (new principle or removal), approval MUST include a brief
	 stakeholder consultation (e-mail or issue thread) with partners.
3. Versioning Policy: The constitution follows semantic versioning for
	 governance text:
	 - MAJOR (X.0.0): Backwards-incompatible governance or principle removal/redefinition.
	 - MINOR (0.Y.0): New principle or substantive addition to governance.
	 - PATCH (0.0.Z): Clarifications, wording fixes, or editorial updates.
4. Compliance Review: Pull requests that change data handling, auth, or the
	 calculation engine MUST include a short 'Constitution Check' checklist
	 verifying applicable principles, and indicate required follow-ups (DPIA,
	 accessibility review, etc.).

**Version**: 1.0.0 | **Ratified**: 2025-11-07 | **Last Amended**: 2025-11-07
