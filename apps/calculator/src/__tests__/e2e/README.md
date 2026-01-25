# End-to-End Tests

This directory contains Playwright-based end-to-end tests for the Greedex Calculator application.

## Location

E2E tests are located at `src/__tests__/e2e/` following the colocated testing pattern where tests live close to the source code they test.

## Prerequisites

- Bun runtime installed
- PostgreSQL database running and configured
- Application dev server running on your configured `NEXT_PUBLIC_BASE_URL`

## Running E2E Tests

### 1. Start the development server

```bash
bun run dev
```

The dev server must be running before executing e2e tests.

### 2. Run the tests

```bash
# Run all e2e tests
bun run test:e2e

# Run with UI mode (interactive)
bun run test:e2e:ui

# Debug mode
bun run test:e2e:debug

# View test report
bun run test:e2e:report
```

## Test Structure

### Output Directories

- **`fixtures/test-project.ts`**: Database fixture for creating a test project with organization and activities.
- **`.playwright/report/`**: HTML test reports (generated after test runs)
- **`.playwright/results/`**: Test execution artifacts (screenshots, videos, traces)

### Global Setup

- **`global-setup.ts`**: Validates that the dev server is running before tests execute.

### Test Suites

- **`questionnaire.spec.ts`**: Comprehensive tests for the participant questionnaire form, including:
  - Valid input flow (complete questionnaire)
  - Invalid input validation
  - Conditional step logic (car questions skip)
  - Progress tracking
  - Back navigation
  - Final emissions calculation and console output

## Test Coverage

The questionnaire e2e tests validate:

- ✅ Form field validation (required fields, email format, number ranges)
- ✅ Multi-step navigation (forward/backward)
- ✅ Conditional logic (car questions skip when carKm = 0)
- ✅ Progress bar and step counter
- ✅ Impact modals after emission-affecting steps
- ✅ CO2 stats display from step 2 onwards
- ✅ Final summary with breakdown (transport, accommodation, food, project activities)
- ✅ Console logging of complete questionnaire data

## Notes

- Tests automatically create and clean up test data in the database
- Each test run creates a new project with a unique ID
- The Playwright config is set to reuse existing dev server if available
- Screenshots are captured only on test failures
- Traces are captured on first retry for debugging
