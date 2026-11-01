# Frontend — Suncare

Read root `AGENTS.md`, relevant UI task, and `docs/implementation/UI_CONVENTIONS.md` before touching UI code.

- React + Vite **JavaScript/JSX**; Tailwind CSS v4 with the official Vite plugin if creating a new frontend. No TypeScript, Next.js, server components or unexplained libraries.
- shadcn/ui can be used with JavaScript via `components.json` containing `"tsx": false` and `"rsc": false`. Add only components needed; keep `src/components/ui` for unmodified primitives, wrappers in `src/components/common`.
- Treat the application as two UX contexts: calm, accessible patient self-service and efficient, readable clinical-staff workspaces. Distinct purposeful design, not a generic gradient dashboard. Vietnamese UI text; consistent business vocabulary.
- Organize by feature (`features/auth`, `features/patient`, `features/admin`, `features/scheduling`, `features/booking`, `features/encounter`, `features/lab`, `features/billing`, `features/reports`); shared router/layout/auth/API and design tokens live under `src/app`, `src/components`, `src/lib`.
- All server state comes from REST clients with centralized error handling, authenticated route layouts, loading/empty/error/success states and sensible retries. No hardcoded patient/payment/medical content in real screens; test fixtures only in test/mock paths.
- Route visibility/disabled buttons are UX only: never assume client checks replace backend permissions. Do not send arbitrary status, assigned doctor for onsite, fabricated prices or account/department scope.
- Display VND decimal strings safely; convert timestamps from UTC to specified Asia/Saigon local date, avoid local midnight off-by-one. Never put authentication tokens in URLs; do not expose medical asset URLs except authorized short-lived links.
- Design system: tokens/typography/spacing/colors; accessible contrast, keyboard focus, form labels, error descriptions and responsive layout. Keep motion minimal for task-heavy medical screens.
- Add React Testing Library/Vitest tests for forms/permissions/errors as needed; run `npm run lint`, `npm test -- --run` if configured, and `npm run build`. Do not claim a visual QA pass without viewing the screen in a browser.

## Mandatory UI/UX Design Standards — Suncare

These rules apply to ALL frontend implementation and modification tasks.

### 1. Production-Quality UI

- Build a professional healthcare management application, NOT a technical demonstration or documentation website.
- Every screen must look and behave like a real product used by patients or hospital employees.
- Prioritize usability, visual hierarchy, consistency, accessibility, and maintainability.
- Avoid generic AI-generated layouts, excessive cards, unnecessary borders, and text-heavy screens.
- Never sacrifice UI quality merely to make tests pass.

### 2. NEVER Expose Internal Documentation

Do NOT display any of the following in user-facing interfaces:

- Task identifiers (T00–T22), checkpoints, acceptance test IDs.
- API endpoints, database structures, internal architecture.
- AGENTS.md, ROADMAP.md, implementation status or developer instructions.
- Technical explanations of authentication, RBAC, SQL transactions, or internal business rules.
- Debug information or development-only status messages.

Internal specifications guide implementation; they are NOT website content.

All user-facing text must be natural, concise Vietnamese appropriate for healthcare users.

### 3. Visual Design System

- Stack: React + JavaScript/JSX + Tailwind CSS v4.
- Primary colors: professional teal, white, and neutral grays.
- Use consistent typography, spacing, radius, shadows, and iconography.
- Centralize reusable design tokens instead of repeating arbitrary styles.
- Maintain clear heading hierarchy and sufficient whitespace.
- Use a consistent icon library already supported by the project.
- Prefer simple, elegant, functional design over decorative complexity.
- Do not introduce new UI libraries without a clear benefit.

### 4. Separate User Experiences

Public website:
- Patient-oriented, welcoming, trustworthy.
- Clear navigation and primary actions.
- Explain services briefly using language patients understand.

Patient portal:
- Simple, accessible, mobile-friendly.
- Focus on appointments, booking, medical records, and personal information.
- Only implement functionality permitted by the current task.

Staff workspace:
- Professional SaaS-style application layout.
- Sidebar navigation, topbar, clear page titles, structured work areas.
- Navigation and content appropriate to the authenticated role.
- Tables, forms, filters, and status indicators where appropriate.

Never use the public landing page as a substitute for an actual application dashboard.

### 5. No Fake Functionality

- Never fabricate patient records, doctor availability, appointments, revenue, or medical statistics.
- Never create buttons that appear functional but do nothing.
- Never simulate successful backend operations in production UI.
- Use real APIs for implemented features.
- For unavailable features, hide the action or clearly mark it unavailable.
- Do not implement features outside the current task merely to populate a screen.
### 6. UX and Accessibility

Every applicable screen must support:

- Responsive layouts for mobile, tablet, and desktop.
- Clear loading, empty, success, and error states.
- Accessible labels, keyboard navigation, and visible focus indicators.
- Appropriate form validation and actionable error messages.
- Proper 401/403 handling and role-aware navigation.
- Readable contrast and touch-friendly interactive elements.

Frontend route guards do NOT replace backend authorization.

### 7. Component Architecture

- Prefer small, reusable React components.
- Separate layout, presentation, API integration, and state management.
- Avoid giant JSX files and repeated UI patterns.
- Reuse existing components and design tokens.
- Preserve existing authentication and API contracts.
- Do not change backend or database outside authorized task scope.

### 8. Mandatory Visual Quality Gate

Before marking any frontend task DONE:

1. Run lint, relevant tests, and production build.
2. Verify the actual rendered interface when browser tooling is available.
3. Check desktop and mobile layouts.
4. Check alignment, spacing, text wrapping, overflow, and visual hierarchy.
5. Verify that interactive controls perform their intended actions.
6. Confirm no developer-facing information appears in production UI.
7. Confirm no fabricated data or fake functionality was introduced.
8. Record any visual or runtime checks that could not be performed.

Compilation success does NOT mean UI/UX acceptance.

### 9. Scope and Token Efficiency

- Read only relevant design rules, components, and task requirements.
- Reuse existing patterns rather than redesigning unrelated screens.
- Avoid unnecessary dependencies and repeated full-project analysis.
- Implement the smallest complete, visually polished user experience.

**Core principle: Build Suncare as a real healthcare product, not as a visualization of its requirements.**
