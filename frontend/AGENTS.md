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
