# Master Development Prompt — TaskMint

> Paste this entire prompt into a capable coding agent when you want it to create or continue this repository.

## 1. Mission

Act as a principal software engineer, product designer, QA engineer, security reviewer, DevOps engineer, technical writer, and release engineer. Build **TaskMint**, a production-quality **Simple To-Do List** project that is much more complete than a classroom demo.

The project must be implemented completely, incrementally, and professionally. Do not stop after scaffolding. Do not leave core features as TODO placeholders. Do not knowingly ship broken builds, failing tests, unresolved lint/type errors, or security-critical defects.

If the complete scope is too large for one chat/session, divide the work into **phases, parts, milestones, or versions** and continue from the repository state in later chats without rewriting completed work unnecessarily. Maintain `what_changed.md` so the next chat can resume precisely.

## 2. Repository Identity

- **Project name:** TaskMint
- **Project type:** Simple To-Do List
- **Suggested repository:** `https://github.com/sanskarIN/taskmint`
- **GitHub profile:** `https://github.com/sanskarIN`
- **Repository visibility:** **PUBLIC**
- **Source model:** **OPEN SOURCE**
- **License:** **MIT**
- **Primary implementation:** TypeScript + React + IndexedDB; optional Tauri desktop wrapper
- **Target platforms:** Web/PWA, Windows, macOS, Linux
- **Required visible watermark/credit:** **Made by the Sanskar**
- **Git author/commit email:** `sanskarin@outlook.in`

If the repository already exists, inspect and continue it safely rather than replacing working code. Preserve useful history and backwards compatibility where reasonable.

## 3. Contact, Support, and Funding

Include these details in appropriate places such as `README.md`, `SUPPORT.md`, About/Settings UI, project website/footer if applicable, release notes template, and documentation:

- Business email: `sanskarin@outlook.in`
- Business email: `sanskarin.business@gmail.com`
- Support email: `supportramsandesh@gmail.com`
- GitHub: `https://github.com/sanskarIN`
- Buy Me a Coffee: `https://buymeacoffee.com/sanskarIN`

Use a clearly visible, clickable BMC badge/logo in the README and suitable documentation:

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-sanskarIN-FFDD00?logo=buy-me-a-coffee&logoColor=000000)](https://buymeacoffee.com/sanskarIN)

Do not make funding UI intrusive. The product must remain fully usable without donating.

## 4. Core Product Requirements

Implement all of the following project-specific capabilities:

- Create, edit, complete, archive, restore, and delete tasks
- Priorities, due dates, reminders, tags, projects, and notes
- Search, filters, sorting, and smart views
- Offline-first persistence
- Recurring task rules
- Drag-and-drop reordering with keyboard-accessible alternative
- Import/export JSON and CSV
- Productivity statistics without manipulative gamification
- Theme system and responsive layout
- Data backup and one-click local data deletion

## 5. Excellence-Level Feature Baseline

In addition to the project-specific features, include or prepare clean architecture for the following where relevant:

- Polished onboarding and first-run experience with sensible defaults
- Responsive layouts, dark/light/system theme, excellent typography, and consistent design tokens
- Global search or quick actions where the product benefits from them
- Settings page with privacy, data, appearance, accessibility, update, and About sections
- About page containing project identity, license, version, credits, support contacts, GitHub, BMC, and the watermark
- Keyboard accessibility on desktop/web and touch-friendly targets on mobile
- Internationalization-ready architecture; ship English first and keep strings externalized
- Structured logging with secret/PII redaction
- Graceful loading, empty, offline, success, warning, and error states
- Import/export or backup/restore where appropriate

Do not add useless features merely to increase count. Every feature should be coherent with the product, tested, documented, and maintainable.

## 6. UI/UX Standard

The interface must look like a serious modern product, not a default framework demo.

Requirements:

- Create a coherent design system with spacing scale, typography scale, radii, elevation, motion rules, icons, and reusable components.
- Support light, dark, and system theme when the platform supports them.
- Use responsive/adaptive layouts for phone, tablet, desktop, and web breakpoints as applicable.
- Ensure clear hierarchy, strong empty states, helpful validation, undo for destructive operations where practical, and confirmation only when truly necessary.
- Meet WCAG-oriented accessibility practices: keyboard navigation, focus visibility, semantic labels, contrast, scalable text, reduced motion, non-color-only status indicators, and screen-reader compatibility.
- Provide polished loading/skeleton states without fake delays.
- Avoid clutter, deceptive patterns, forced sign-in for offline functionality, or disruptive donation prompts.
- Add an About screen/page that includes **Made by the Sanskar** and the contact/funding links above.
- Create a professional app icon/logo concept, splash/launch treatment where applicable, and platform-consistent branding. Store editable source artwork in the repository when licensing permits.

## 7. Architecture and Code Quality

Use a maintainable architecture suitable for the chosen stack.

- Separate domain/business logic from UI and infrastructure.
- Prefer small cohesive modules with clear interfaces.
- Use strict compiler/linter/type-checker modes.
- Enable formatting and lint checks in CI.
- Centralize error types and user-safe error messages.
- Use dependency injection or explicit dependency wiring where beneficial.
- Do not create global mutable state without a strong reason.
- Avoid duplicated business rules.
- Document non-obvious architectural decisions in `docs/adr/`.
- Use semantic configuration and environment variables for deployment settings.
- Keep secrets out of Git.
- Pin or lock dependencies appropriately.
- Add database migrations rather than editing schemas manually after release.
- Use structured concurrency/async patterns appropriate to the language.
- Avoid premature microservices; prefer a modular monolith until scale genuinely requires separation.

## 8. Security and Privacy

Security is required even for a beginner-oriented project.

- Validate all untrusted inputs.
- Encode/escape untrusted output according to context.
- Apply least privilege for filesystem, database, network, and platform permissions.
- Use maintained security libraries rather than custom crypto/authentication primitives.
- Never log passwords, tokens, authentication headers, secrets, raw payment data, or sensitive user content.
- Use secure defaults for cookies/sessions, CORS, CSP, CSRF protection, rate limits, file uploads, and authentication when applicable.
- Provide `.env.example` containing placeholder names only.
- Add secret scanning and dependency vulnerability checks to CI where available.
- Public source code must never contain real credentials, API keys, personal user data, private production endpoints, signing secrets, or generated secrets.
- Document privacy behavior and data storage in `PRIVACY.md`.
- Provide a responsible disclosure process in `SECURITY.md`.

## 9. Data and Reliability

Where persistence is required:

- Define schemas explicitly and version them.
- Add migrations and migration tests.
- Add backup/restore or export/import flows when sensible.
- Protect against partial writes and corrupted state.
- Use transactions for multi-step state changes.
- Handle timezones, locale, Unicode, numeric precision, and date boundaries correctly.
- Add indexes based on actual queries rather than guesswork.
- Seed only clearly fictional/demo data.
- Never commit real personal information.

## 10. Testing Requirements

Create a real test strategy, not just a few placeholder tests.

Include as appropriate:

- Unit tests for domain logic.
- Component/widget/UI tests.
- Integration tests for database, filesystem, APIs, and platform adapters.
- End-to-end tests for primary user journeys.
- Regression tests for every bug fixed.
- Property-based or fuzz tests for parsers, converters, serializers, security-sensitive inputs, and edge-heavy logic where appropriate.
- Snapshot/golden tests only where they improve confidence and are kept stable.
- Performance tests or benchmarks for hot paths.
- Accessibility checks for web/UI projects.
- Test fixtures that are deterministic and do not require real production credentials.

CI must fail on test, build, lint, format, type-check, migration, or security-check failures.

## 11. Performance Standard

- Measure before optimizing.
- Establish performance budgets appropriate to the app.
- Avoid unnecessary network requests, repeated database queries, blocking UI work, and oversized bundles/assets.
- Use pagination/virtualization for large lists.
- Use caching with explicit invalidation rules.
- Profile memory and CPU for expensive workflows.
- Add benchmark notes to `docs/performance.md` for performance-sensitive modules.

## 12. Complete Documentation Set

Create and maintain at least:

- `README.md`
- `LICENSE`
- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`
- `SECURITY.md`
- `SUPPORT.md`
- `PRIVACY.md`
- `CHANGELOG.md`
- `ROADMAP.md`
- `what_changed.md`
- `.gitignore`
- `.editorconfig`
- `.gitattributes`
- environment/configuration example files where needed
- `docs/architecture.md`
- `docs/setup.md`
- `docs/development.md`
- `docs/testing.md`
- `docs/release.md`
- `docs/troubleshooting.md`
- `docs/accessibility.md`
- `docs/performance.md`
- `docs/adr/` for architecture decision records

The README must contain:

1. Project logo/title.
2. Short value proposition.
3. Screenshots or demo placeholders that are later replaced with real captures.
4. Feature overview.
5. Supported platforms.
6. Tech stack.
7. Quick start.
8. Full development setup.
9. Testing instructions.
10. Build/release instructions.
11. Architecture overview.
12. Security/privacy notes.
13. Contribution instructions.
14. License.
15. Contact/support.
16. Highly visible BMC badge linked to `https://buymeacoffee.com/sanskarIN`.
17. Credit: **Made by the Sanskar**.

## 13. GitHub Repository Quality

Configure the public repository professionally:

- Issue templates for bug reports and feature requests.
- Pull request template.
- Dependabot/Renovate-style dependency update configuration where suitable.
- GitHub Actions CI for build, format, lint, tests, and security checks.
- CodeQL or equivalent static security analysis where supported.
- Release workflow with version tags and generated artifacts where practical.
- GitHub Discussions configuration guidance.
- Labels/milestones guidance.
- Funding file pointing to the BMC profile if GitHub supports the chosen method.
- Branch protection guidance for the default branch.
- Status badges in README only for meaningful checks.
- No badges that claim passing status unless the workflow actually exists.

## 14. Commit Strategy — Maximum Meaningful Commits

Use the commit email:

`sanskarin@outlook.in`

Create the **maximum sensible number of small, atomic, meaningful commits** while preserving engineering quality. Do **not** create artificial empty commits, meaningless one-line churn, or split inseparable changes merely to inflate a number.

Examples of good commit boundaries:

- repository bootstrap
- documentation baseline
- CI configuration
- one domain model
- one database migration
- one isolated feature
- one UI screen
- one accessibility improvement
- one test suite
- one bug fix
- one refactor with no behavior change
- one performance improvement
- one security hardening change
- one documentation update
- one release preparation step

Use Conventional Commits when practical, for example:

- `feat: add ...`
- `fix: handle ...`
- `test: cover ...`
- `docs: document ...`
- `refactor: simplify ...`
- `perf: optimize ...`
- `build: configure ...`
- `ci: verify ...`
- `chore: maintain ...`

Before each commit, run the smallest relevant verification. Before a milestone/release commit, run the complete quality suite.

## 15. Work Continuity

Maintain `what_changed.md` after meaningful work. It should contain:

- current version/milestone
- completed work
- files/modules added or changed
- tests added
- commands run and results
- known limitations
- open issues
- next exact tasks
- migration notes
- release notes draft
- most recent meaningful commit hashes/messages when available

This file is the primary handoff document for continuing in another chat.

## 16. Delivery Phases

- Phase 0 — Repository bootstrap, architecture decision record, coding standards, issue templates, security policy, CI skeleton, and initial documentation.
- Phase 1 — Build the smallest clean end-to-end MVP with the core data model, primary workflows, and robust error handling.
- Phase 2 — Complete the remaining core feature set, persistence, settings, search/filtering, import/export, and accessibility.
- Phase 3 — Add advanced UX, performance work, offline behavior, security hardening, migrations, and platform integrations.
- Phase 4 — Add comprehensive automated tests, end-to-end coverage, benchmarks where useful, fuzz/property testing where appropriate, and fix every discovered defect.
- Phase 5 — Complete documentation, screenshots/demo assets, release notes, packaging, installers/build artifacts, and reproducible release workflow.
- Phase 6 — Perform final audit: build from clean checkout, run all CI tasks, dependency/security checks, documentation-link checks, and release candidate verification.

At the end of every phase, update documentation and `what_changed.md`, run relevant tests, and create one or more meaningful commits.

## 17. Definition of Done

Do not call the project complete until:

- A clean clone can be set up using documented commands.
- Production/release builds succeed on supported primary platforms.
- Lint, formatting, type checks, tests, and security checks pass.
- Primary user journeys have end-to-end coverage where feasible.
- No known blocker/critical defects remain.
- No real secrets or private data are committed.
- Database migrations work from a clean state where applicable.
- Error/empty/offline/loading states are implemented.
- Accessibility basics have been manually reviewed.
- Documentation matches the real repository.
- `CHANGELOG.md`, `ROADMAP.md`, and `what_changed.md` are current.
- The README contains contact details, the BMC link/logo, license information, and **Made by the Sanskar**.
- The repository contains enough meaningful, atomic commits to make the development history easy to review.

## 18. Working Instruction to the Coding Agent

Start by inspecting the current repository if it exists. Then create a precise implementation plan in `what_changed.md` and begin coding immediately.

Do not merely describe code that should exist—create the files and implement it. Do not skip files because the scope is large. Do not claim a bug-free state unless you have actually run the relevant build/test/lint checks. If a toolchain or external credential prevents a verification step, document the exact limitation and still complete everything that can be verified locally.

When continuing in later chats, first read `what_changed.md`, the repository tree, open issues/TODOs, and recent commits, then continue from the next unfinished task.

Build **TaskMint** into an excellent, maintainable, secure, accessible, documented, polished open-source project suitable for a strong GitHub portfolio.
