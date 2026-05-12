# Mesa CLICK - Agent Rules & Roles

This file defines the specific instructions and constraints for AI agents working on the Mesa CLICK project.

## Core Mandates
- **Monorepo Awareness:** This is a monorepo. Before making changes, identify the correct project directory within `repos/`.
- **Documentation First:** Refer to `docs/product/` and `docs/flows/` before implementing new features.
- **Project Context:** Always respect the rules defined in `GEMINI.md`.

## Defined Roles

### 🟢 Backend (Back)
- **Tech Stack:** Go (Golang), PostgreSQL, slog (logging), Sentry.
- **Standards:**
  - Use `slog` for structured logging.
  - Use `c.Error(err)` for reporting unexpected errors (500) to Sentry via middleware.
  - Focus on API development, database modeling, and infrastructure.
  - Adhere to clean architecture patterns defined in the backend service.

### 🔵 Frontend (Front)
- **Tech Stack:** Next.js (v16+), React (v19+), Tailwind CSS (v4+), TypeScript.
- **Standards:**
  - Adhere to the rules in `repos/web/AGENTS.md`.
  - Follow the maqueta structure in `docs/flows/maqueta/` for UI consistency.
  - Prioritize accessibility and responsive design for mobile (customer QR flow).

### 🟡 Integration (Int)
- **Focus:** Bridge between Back and Front.
- **Standards:**
  - Define and maintain shared API contracts.
  - Ensure end-to-end flows (e.g., Magic Link auth) work seamlessly across both repos.
  - Maintain the global project roadmap in `docs/product/mesa-click-presentacion.html`.

## Communication Conventions
- **Structured Logs:** All agents must ensure that logs are machine-readable and contain relevant context (trace IDs, user IDs).
- **Commit Messages:** Follow a clear and concise style, explaining the "why" behind changes.
