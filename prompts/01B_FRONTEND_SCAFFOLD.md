# FRONTEND SCAFFOLD — T02 only

Act as Suncare React frontend owner. Read root and `frontend/AGENTS.md`, T00 architecture, T02 on `tasks/ROADMAP.md`, and the completed T01 report. Do not modify backend, database or other protected docs.

1. Inspect `frontend/` and `git status`. If a Vite app already exists, repair it incrementally; no blind overwrite. Otherwise initialize React **JavaScript/JSX**, not TypeScript, with Vite.
2. Install/configure Tailwind CSS v4 via `@tailwindcss/vite` and `@import "tailwindcss"` using official docs. Build `frontend/src/app` minimal router and shell, shared centralized API client with base URL from `.env.example`, and basic accessible placeholder home with no fake hospital KPIs. Add `jsconfig.json` for aliases when needed.
3. Set npm scripts for build, lint and Vitest/React Testing Library as appropriate; dev proxy/CORS must be documented. Do not copy all shadcn components; if initialized now, set `components.json` `"tsx": false` and `"rsc": false`, ensure JSX output.
4. Record exact dependency versions, scripts, package-lock, and security/secret configuration. Run `npm run build`, `npm run lint` and tests when available. If npm install fails because network is blocked, report exact failure; do not mark a failed build passed.
5. Update `docs/implementation/PROGRESS.md` for T02 with evidence and next eligible T03. **No login feature or clinical UI in this task. STOP after T02.**
