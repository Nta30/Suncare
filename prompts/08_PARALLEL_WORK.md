# OPTIONAL — Parallel workers without overlapping ownership

Prepare a **work split**, NOT permission to concurrently edit everything. Read task board, architecture and existing API contracts first. Consider Codex subagents only when the environment supports them; otherwise use separate VS Code/Codex sessions with distinct Git worktrees/branches.

Make a table for each parallel worker containing:
- Worker name (Backend, Frontend, QA) and exact bounded task ID;
- Prerequisites + single versioned API contract;
- FILES OWNED (exclusive paths) and FILES READ-ONLY;
- allowed dependencies on other workers;
- review/test command and expected handoff artifact;
- integration owner and when shared files may change.

Rules:
- Backend owns `backend/src/**/<domain>/**` and domain API contract. Frontend owns `frontend/src/features/<domain>/**` once contract is approved. QA writes test files in a separate task/branch or acts read-only.
- The shared router, build config, CI, root AGENTS, `database/*.sql`, common API client, security config and shared OpenAPI have **exactly one integrator**; no concurrent edits to them.
- A worker must not silently cherry-pick or overwrite uncommitted work. Integrator merges branches serially, resolves API mismatches and runs complete CI. No parallel DDL edits.
- If boundaries cannot be made disjoint or contracts are still changing, choose sequential work. No forced multi-agent concurrency.

First produce the ownership matrix and identify true parallel opportunities. Do not start code until the matrix is reviewed and conflicts are removed.
