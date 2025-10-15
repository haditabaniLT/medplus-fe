# Testing Strategy for MePlusAI

This document outlines the testing approach for the MePlusAI application, following the requirements from the Overall MePlusAI Web Application document.

## End-to-End Testing with Cypress

### Setup

```bash
npm install --save-dev cypress @testing-library/cypress
npx cypress open
```

### Test Suites

#### 1. Authentication Flow
- **Location**: `cypress/e2e/auth.cy.ts`
- **Coverage**:
  - User signup with email/password
  - User login with valid credentials
  - Login failure with invalid credentials
  - Logout functionality
  - Session persistence

#### 2. Onboarding Flow
- **Location**: `cypress/e2e/onboarding.cy.ts`
- **Coverage**:
  - Complete onboarding wizard (all steps)
  - Step validation and navigation
  - Data persistence between steps
  - Skip functionality
  - Confetti animation on completion

#### 3. Task Generation
- **Location**: `cypress/e2e/task-generation.cy.ts`
- **Coverage**:
  - Generate task with text input
  - Generate task with voice input (mocked)
  - Category selection
  - Tone selection
  - Loading state (Fusing spinner)
  - Success state with confetti
  - Error handling
  - Quota validation (Base vs Pro)

#### 4. Template Management
- **Location**: `cypress/e2e/templates.cy.ts`
- **Coverage**:
  - Save task as template
  - Apply template to generate task
  - Edit template
  - Delete template
  - Starter templates (Pro only)

#### 5. Export Functionality
- **Location**: `cypress/e2e/export.cy.ts`
- **Coverage**:
  - Export to PDF (Base plan)
  - Export to Canva (Pro plan)
  - Export to Gamma (Pro plan)
  - Export modal interactions
  - Download verification

#### 6. Upgrade Modal
- **Location**: `cypress/e2e/upgrade.cy.ts`
- **Coverage**:
  - Modal triggered on locked category click
  - Modal triggered on Pro feature access
  - Modal triggered on quota exceeded
  - Pricing display
  - Stripe checkout redirect

### Visual Regression Testing

Use Cypress visual testing plugin to prevent Look & Feel regressions:

```bash
npm install --save-dev @percy/cypress
```

**Key snapshots**:
- Dashboard (dark mode)
- Task Generator card
- Task Detail page
- Templates page
- Onboarding steps
- Modals (Upgrade, Export, Save Template)

### Mocking Strategy

#### API Mocking
Mock all AI generation and external API calls:

```typescript
// cypress/support/commands.ts
Cypress.Commands.add('mockTaskGeneration', () => {
  cy.intercept('POST', '**/api/tasks/generate', {
    statusCode: 200,
    body: {
      title: 'Test Task',
      category: 'Decision Mastery',
      summary: 'Test summary',
      steps: ['Step 1', 'Step 2'],
      content: 'Test content',
    },
    delay: 2000, // Simulate network delay
  }).as('generateTask');
});
```

#### User State Mocking
Mock authentication and user plan states:

```typescript
Cypress.Commands.add('loginAsBaseUser', () => {
  cy.window().then((win) => {
    win.localStorage.setItem('user', JSON.stringify({
      id: 'test-user-id',
      email: 'base@test.com',
      plan: 'base',
      tasksUsed: 5,
    }));
  });
});

Cypress.Commands.add('loginAsProUser', () => {
  cy.window().then((win) => {
    win.localStorage.setItem('user', JSON.stringify({
      id: 'test-user-id',
      email: 'pro@test.com',
      plan: 'pro',
      tasksUsed: 20,
    }));
  });
});
```

### Accessibility Testing

Include `cypress-axe` for automated accessibility testing:

```bash
npm install --save-dev cypress-axe axe-core
```

Add accessibility checks to all tests:

```typescript
describe('Dashboard Accessibility', () => {
  beforeEach(() => {
    cy.visit('/dashboard');
    cy.injectAxe();
  });

  it('should have no accessibility violations', () => {
    cy.checkA11y();
  });

  it('should be keyboard navigable', () => {
    cy.get('body').tab();
    cy.focused().should('have.attr', 'role', 'button');
  });
});
```

## Running Tests

### Local Development
```bash
# Open Cypress Test Runner (interactive)
npm run cypress:open

# Run all tests (headless)
npm run cypress:run

# Run specific test suite
npm run cypress:run -- --spec "cypress/e2e/auth.cy.ts"
```

### CI/CD Integration
```yaml
# .github/workflows/test.yml
name: E2E Tests
on: [push, pull_request]
jobs:
  cypress:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: cypress-io/github-action@v5
        with:
          build: npm run build
          start: npm run preview
          wait-on: 'http://localhost:4173'
```

## Test Coverage Goals

- **Auth Flow**: 100%
- **Core User Journeys**: 100%
- **Edge Cases**: 80%
- **Visual Regression**: Key pages and components
- **Accessibility**: WCAG AA compliance on all pages

## Performance Testing

Monitor key metrics using Lighthouse CI:

```bash
npm install --save-dev @lhci/cli
```

**Target Metrics**:
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 90

## Maintenance

- Update tests when features change
- Review and update mocks quarterly
- Run visual regression tests before each release
- Monitor flaky tests and fix immediately
