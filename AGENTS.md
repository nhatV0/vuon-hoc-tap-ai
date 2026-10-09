# Repository Development Rules & Architectural Standards

## 1. Path Aliases & Imports (STRICTLY ENFORCED)
- **NO RELATIVE PARENT IMPORTS**: NEVER use `../`, `../../`, or `../../../` anywhere in the codebase.
- **ALWAYS USE PATH ALIASES (`@/*`)**:
  - In Backend: `@/*` maps to `src/*` (e.g. `@/db/client`, `@/common/utils`, `@/modules/auth/auth.service`).
  - In Frontend: `@/*` maps to `src/*` (e.g. `@/shared/api/auth-client`, `@/features/garden/GardenPage`, `@/shared/components/ui/button`).
- Any PR or commit containing `../` in imports must be rejected.

## 2. File Size & Modular Design (STRICTLY ENFORCED)
- **200-Line Maximum File Limit**: Every TypeScript/React file must be under 200 lines.
- Split complex views into dedicated sub-components, custom hooks, and utility modules.
- Naming convention: Use meaningful `kebab-case` for file names (e.g., `step-grade-subject.tsx`, `daily-checkin-modal.tsx`).

## 3. Git Workflow & Feature Pull Request Mandate (STRICTLY ENFORCED)
- **ALWAYS DEVELOP NEW FEATURES IN ISOLATED FEATURE BRANCHES**:
  - For any new feature, bug fix, or refactor, create a dedicated branch (e.g. `feat/academic-ai-features`, `fix/auth-flow`).
  - Create a GitHub Pull Request (PR) against `main`.
- **PRE-MERGE MANDATE**:
  - A PR MUST NOT be merged into `main` until:
    1. All automated tests (`bun test`) pass 100% with zero failures.
    2. Frontend production build (`bun run build` / `npm run build`) compiles cleanly without type or bundling errors.
    3. Security audit & verification checks (BOLA/IDOR, RBAC, Zod validation, zero parent imports, zero emojis) are completed.
  - Only when all tests and audits pass can the PR be merged into `main`.

## 4. Testing & Verification Mandate (CRITICAL & REQUIRED)
- **THOROUGH TESTING IS MANDATORY**: You MUST test thoroughly before concluding any work session.
- **NEVER DELIVER WITHOUT RUNNING TESTS**:
  - Must write and maintain automated test suites (`bun test` on backend, `npm run build` & typechecks on frontend).
  - Must cover happy paths, boundary edge cases, and unexpected failure inputs.
  - When modifying APIs or business logic, you MUST write corresponding test cases verifying regression safety.
- **API Security Testing & Penetration Check**:
  - Verify **Broken Object Level Authorization (BOLA/IDOR)**: Ensure users cannot view or manipulate resources belonging to other users.
  - Verify **Broken Function Level Authorization (RBAC)**: Ensure non-admin/non-teacher users are blocked from management endpoints.
  - Verify **Mass Assignment Protection**: Prevent privilege escalation via injected fields (e.g., `role: "admin"`).
  - Verify **Input Validation**: All request bodies must be parsed and strictly validated with Zod.

## 5. UI, Icons & Aesthetics (CRITICAL)
- **ABSOLUTELY NO EMOJIS**: NEVER use emojis (🌻, 🟢, 🟡, 🔴, ⚡, 📖, etc.) in code, markup, buttons, tabs, empty states, or UI components.
- **VECTOR SVG ICONS ONLY**: Use Lucide SVG icons (`lucide-react`) exclusively.
- **Shadcn UI & Tailwind CSS**: Use Shadcn UI primitives located in `@/shared/components/ui/` (`Button`, `Card`, `Dialog`, `Input`, `Badge`, `Progress`, `Tabs`).
- Design Style: Calm, neo-modern, accessible, soft rounded radii (`rounded-2xl` / `rounded-3xl`), warm honey/amber and stone palette.

## 6. Architecture & Design Patterns
- **Backend (Hono + Bun + SQLite + Better Auth)**:
  - Vertical Feature Slices: `src/modules/<feature>/` containing `.routes.ts`, `.service.ts`, `.repository.ts`, `.schemas.ts`.
  - Layered Architecture: Handlers parse and validate DTOs with Zod -> Service applies business logic -> Repository interacts with database.
  - State Machines & Gamification: Maintain deterministic state transitions in `garden.state-machine.ts`.
- **Frontend (React 18 + Vite + React Router v6 + Tailwind)**:
  - Feature-Based Folders: `src/features/<feature>/` (e.g., `landing`, `auth`, `onboarding`, `garden`, `planning`, `teacher`).
  - Shared Layer: `src/shared/` containing reusable UI primitives, hooks, API client, types, context.
  - Role-based Protected Routes: Use `ProtectedRoute` component with `allowedRoles` guard.

## 7. Code Quality & Security
- Use type-safe schemas (Zod) for all external input validation.
- Zero unchecked type assertions (`any` is forbidden).
- Secrets and tokens must never be hardcoded or committed to git.
