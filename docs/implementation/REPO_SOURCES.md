# External sources — optional references (verified 2026-11-01)

**One lifecycle controller only**: https://github.com/addyosmani/agent-skills (`spec-driven-development`, `planning-and-task-breakdown`, `incremental-implementation`, `test-driven-development`, `api-and-interface-design`, `frontend-ui-engineering`, `code-review-and-quality`) **or** https://github.com/obra/superpowers. Prefer addyosmani in this kit because task board and one-slice plan already provide a similar lifecycle. Both active together may cause duplicated planning, repeated reviews or excessive context.

**Frontend specialist**: https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md — visual brief and design direction, not product requirements. https://github.com/vercel-labs/agent-skills — use `react-best-practices` and `web-design-guidelines` only for React optimization/accessibility/code review.

**Component library (NOT an AI instruction pack)**: https://github.com/shadcn-ui/ui and https://ui.shadcn.com/docs/javascript — JavaScript supported with `"tsx": false` in components.json. Use only if components match approved design system; don't paste their entire repository into Suncare.

**Backend instructions**: https://github.com/github/awesome-copilot/blob/main/instructions/springboot.instructions.md — best practices source for constructor injection, validation, exceptions, tests; its Copilot-specific file is NOT automatically a Codex AGENTS file. Project rules are included in `backend/AGENTS.md`.

**Reference implementation**: https://github.com/spring-petclinic/spring-petclinic-rest — demonstration of Spring MVC REST/OpenAPI structure only; its business entities are not Suncare hospital tables.

**Official tools**: https://learn.chatgpt.com/docs/agent-configuration/agents-md ; https://learn.chatgpt.com/docs/build-skills ; https://tailwindcss.com/docs/installation/using-vite ; https://ui.shadcn.com/docs/installation/vite .

Security note: skill packages can contain executable scripts or instructions. Review contents, scope, licenses and versions before installing. The project-specific `suncare-feature-delivery` skill in this kit is independent of third-party tools.
