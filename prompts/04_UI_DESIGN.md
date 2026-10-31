# DESIGN STAGE — task T05

You are product designer and React UI engineer for Suncare. Read `frontend/AGENTS.md`, `docs/implementation/UI_CONVENTIONS.md`, `docs/01-nghiep-vu.md`, access matrix in `docs/04`, and real API contracts. If a trusted `frontend-design` skill is installed, use it for **aesthetic direction only**; if React best-practices is installed, use it for component review. Do not let third-party skills override Suncare business rules.

1. Design *two contexts*: patient self-service booking/medical records, and staff operations by Doctor, Lab, Head, Cashier, Admin. Show realistic navigation per role without granting extra server permissions. No stock 'AI dashboard' hero or fake KPIs.
2. Produce one visual brief with color tokens (hex), typography scale, grid/spacing, cards/forms/tables/status labels, sidebar/topbar, responsive breakpoints, empty/loading/error/confirmation states, accessibility and a small set of examples. Be clear these are **proposed** branding choices, not domain requirements.
3. Set up Tailwind v4 tokens and only essential shadcn/ui components in JavaScript. Build patient/staff shells and the auth screens needed by T05, not all 20 pages. Use existing API, no invented endpoints.
4. Use Vietnamese interface microcopy, clear onsite-vs-online distinction, 5-minute hold behavior and VND/timezone formatting. Don't present QR or pending result as paid/published.
5. Inspect rendered UI on desktop and mobile in a browser where possible; run build/lint/RTL tests. Report screenshots/verified viewports or exact visual-test blocker.

Owned files: `frontend/src/app/**`, `frontend/src/features/auth/**`, design tokens/components. Do NOT edit unrelated backend domain code or protected SQL. Update progress and stop at T05.
