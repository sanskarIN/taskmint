# TaskMint Roadmap

The roadmap favors coherent improvements over feature count. Planned versions describe intent, not already-shipped functionality. The repository package version must continue to reflect the latest actually released version rather than a future roadmap target.

## Product invariants through v1.5.0

These remain non-negotiable unless a future major-version decision explicitly changes them:

- Local-first task storage remains the default.
- No account, cloud backend, telemetry, or subscription is required for core task management.
- Web/PWA remains a first-class build alongside native applications.
- Native permissions remain least-privilege and feature-scoped.
- Import/export formats remain versioned, validated, and migration-aware.
- Destructive data operations remain explicit and recoverable where practical.
- Accessibility, keyboard operation, privacy, security, and offline behavior remain release gates rather than optional polish.
- Every release candidate must be verified from its exact source SHA; stale or queued checks are not release evidence.

## v0.1 — Local-first, cross-platform foundation

- [x] Core task lifecycle
- [x] Projects, tags, priorities, notes, due dates, reminders, recurrence
- [x] Search, smart views, filters, sorting, and deterministic manual reordering
- [x] Safe-integer task-order allocation and duplicate-order normalization
- [x] Collision-free order allocation for recurring occurrences and CSV merges
- [x] Global search/new-task keyboard shortcuts with modal/typing/pending-mutation safeguards
- [x] Date-sensitive views/statistics refresh while the app remains open
- [x] IndexedDB persistence and schema migration
- [x] Validated IndexedDB reads with fail-closed corrupt-data startup recovery
- [x] Validated IndexedDB write boundaries for tasks, settings, batches, and replacements
- [x] Full backup preflight validation before destructive restore transactions begin
- [x] Duplicate task-ID rejection before bulk persistence
- [x] Atomic multi-task writes for imports, recurring completion, and reordering
- [x] App-wide exclusive task mutation gate preventing competing cross-row/task-form writes
- [x] JSON/CSV portability and local deletion
- [x] Lossless versioned CSV tag encoding with legacy import compatibility
- [x] Spreadsheet-formula neutralization for user-controlled CSV text fields
- [x] Strict CSV encoding-version and quote-placement validation
- [x] Accurate CSV record diagnostics across skipped blank records
- [x] Blank CSV records excluded from the task-count quota while remaining input-size bounded
- [x] Strict calendar/timestamp parsing without JavaScript rollover acceptance
- [x] Strict shared limits and malformed import rejection
- [x] Stable typed validation/import error codes and safe unknown-error UI fallbacks
- [x] Locale-independent canonical tag normalization
- [x] Development diagnostics that omit arbitrary exception messages and redact unknown event metadata by default
- [x] Bounded browser/native reminder delivery with count-only aggregation for excess due reminders
- [x] Serialized task composer, task-row, onboarding, Settings, and PWA update actions to prevent duplicate pending mutations
- [x] Reliable same-file JSON/CSV import retry through immediate input-value clearing
- [x] Responsive themes and accessibility baseline
- [x] Active smart-view/project `aria-current`, named filter grouping, and complete Sidebar navigation landmark semantics
- [x] Externalized English product string catalog
- [x] Progressive large-list rendering
- [x] PWA configuration with explicit waiting/update prompt instead of automatic draft-destructive reloads
- [x] Production CSP separated from Vite development-only relaxations
- [x] Tauri 2 application shell while preserving the standalone web/PWA build
- [x] Native target configuration for Windows, Linux, macOS, Android, and iOS
- [x] Native file open/save adapters for JSON/CSV portability
- [x] Native notification permission and reminder delivery adapter
- [x] Native external-link routing with same-origin navigation kept inside the app
- [x] Mobile safe-area layout integration
- [x] Least-privilege native dialog/filesystem/notification/opener permissions
- [x] Desktop Linux/Windows/macOS hosted native checks plus Android ARM64 and iOS simulator builds
- [x] Native adapter/configuration regression coverage
- [x] Automated unit/component/parser-stress/property/download/CSP/repository/datetime/PWA/migration/corrupt-data/offline/backup/keyboard/accessibility/pagination tests
- [x] Component regression coverage for duplicate submission/mutation/update locks, cross-row exclusivity, navigation semantics, import retry, and safe error states
- [x] Repeatable 10,000-task filtering/statistics benchmark harness using the pinned Vitest 4 API
- [x] Deterministic documentation-link and secret-pattern repository checks
- [x] Complete end-user, architecture, data-model, development, testing, operations, accessibility, performance, release, troubleshooting, support, privacy, security, cross-platform, and repository-governance documentation
- [x] Machine-audited tracked-file index and exhaustive automated-test matrix
- [x] Dependency-free `docs:inventory` check wired into `npm run check` and CI so tracked files/tests cannot silently become undocumented
- [x] Architecture Decision Records for local-first PWA, Dexie repository, persistence validation, exclusive task mutations, and versioned portability
- [x] CI, E2E, CodeQL, Dependabot, release, native-validation, and repository-governance automation baseline
- [x] Release workflow quality/audit/E2E gates and SHA-256 web artifact checksum
- [x] Fail-closed tag/version/npm-lockfile release readiness guard
- [x] Pre-lockfile hosted bootstrap path that disables setup-node npm caching and preserves a genuinely generated npm lockfile artifact
- [x] Native CI preservation path for a genuinely Cargo-resolved lockfile artifact
- [ ] Complete clean-network dependency installation and exact-head browser/native verification in hosted CI
- [ ] Generate and commit the npm lockfile from a successful real registry resolution and add it to the tracked-file documentation inventory
- [ ] Review and commit the genuine Cargo lockfile generated by native validation, then add it to the tracked-file documentation inventory
- [ ] Capture real screenshots from a verified release build and add them to the tracked-file documentation inventory
- [ ] Complete the manual keyboard/zoom/theme/offline/reminder/import/update/native-dialog/native-link release checklist on verified builds
- [ ] Complete real production signing/provisioning/store packaging with external credentials where native distribution requires it
- [ ] Tag `v0.1.0` only after all release gates are green

## v0.2 — Reliability and polish

- [ ] Bulk selection/actions with strong keyboard support
- [ ] Import preview and duplicate-resolution workflow
- [ ] Explicit user-controlled corrupted-record inspection/recovery tooling, if real-world need justifies it
- [ ] Additional locale packs using the v0.1 externalized string/error-code architecture
- [ ] More historical migration fixtures beyond the existing v1-to-v2 browser migration
- [ ] Extend measured benchmarks to 1k/50k/100k tasks and IndexedDB operations; adopt indexed-query, virtualization, or worker optimizations only if measurement justifies them
- [ ] Add native installer/update polish only after measured user need and signed-distribution requirements are clear

## v0.3 — Optional ecosystem expansion

- [ ] Evaluate opt-in startup integration and deeper operating-system integrations without weakening the local-first/privacy model
- [ ] Evaluate store-specific update/distribution workflows after signed release automation is proven
- [ ] Keep the web/PWA build fully functional and first-class regardless of native-platform expansion

## v0.5 — Advanced local productivity

- [ ] Saved views combining search, project, tag, priority, status, and sort criteria
- [ ] Reusable task templates with explicit local storage and export support
- [ ] Multi-task editing with atomic persistence and Undo-aware behavior
- [ ] Import dry-run summary with duplicate, invalid, and skipped-row explanations before mutation
- [ ] Richer recurrence options with deterministic next-occurrence generation and migration fixtures
- [ ] Optional local command palette for keyboard-first actions
- [ ] Export/import compatibility tests spanning every supported historical schema

## v1.0.0 — Stable local-first contract

v1.0.0 is the compatibility milestone, not just a version-number jump.

- [ ] Freeze and document the supported task/settings/backup compatibility policy
- [ ] Define semantic-versioning rules for persisted schemas, backup schemas, and native capability changes
- [ ] Maintain tested migrations from every supported pre-1.0 persisted schema
- [ ] Complete signed production packaging for supported desktop/mobile stores where credentials are available
- [ ] Establish release rollback/recovery procedures for web/PWA and native channels
- [ ] Meet the full accessibility/manual release matrix on production packages
- [ ] Publish verified screenshots and release artifacts generated from the tagged source tree
- [ ] Require reproducible JavaScript and Rust lockfiles for every release candidate
- [ ] Require green CI, E2E, Native CI, CodeQL, release guard, dependency audit, and documentation inventory on the exact release SHA

## v1.1.0 — Faster capture and navigation

- [ ] Expanded keyboard command palette and discoverable shortcut reference
- [ ] Configurable quick-add defaults for project, priority, tags, and recurrence
- [ ] Saved-view pinning and ordering
- [ ] Recent-item navigation without collecting usage telemetry
- [ ] Optional native global quick-capture entry point where platform security models allow it

## v1.2.0 — Local workflow automation

- [ ] User-defined local rules for safe task field changes and recurring creation
- [ ] Preview-and-confirm mode for automation rules that can affect multiple tasks
- [ ] Deterministic automation execution with transaction boundaries and duplicate-run protection
- [ ] Portable/versioned automation export and validation
- [ ] Clear per-rule enable/disable controls and local-only execution history bounded by privacy/storage limits

## v1.3.0 — Deeper platform integration

- [ ] Evaluate share-target/share-sheet capture on supported web/mobile platforms
- [ ] Evaluate home-screen/widget surfaces that expose only user-approved local task data
- [ ] Evaluate optional startup/background reminder integrations with explicit permissions
- [ ] Improve signed installer/update UX without granting shell/process permissions to core TaskMint
- [ ] Keep unsupported integrations absent rather than emulating them insecurely

## v1.4.0 — Scale, performance, and resilience

- [ ] Establish benchmark budgets for 1k, 10k, 50k, and 100k task datasets
- [ ] Add measured IndexedDB read/write/index benchmarks and regression thresholds
- [ ] Introduce virtualization, worker offloading, or indexed queries only when benchmark evidence justifies them
- [ ] Add bounded recovery/export tools for large datasets and partially damaged local stores
- [ ] Expand property/fuzz testing around import, migration, recurrence, ordering, and automation boundaries
- [ ] Add release-size and startup-performance budgets for web and native builds

## v1.5.0 — Power workflows release

The v1.5.0 target combines the stable 1.x foundation into a stronger offline productivity system while keeping TaskMint usable without an account or network connection.

### Planned user capabilities

- [ ] Bulk-select, bulk-edit, archive, complete, restore, move, tag, and delete workflows with keyboard parity
- [ ] Saved smart views with custom names, filters, ordering, and portable configuration
- [ ] Reusable task and project templates
- [ ] Local command palette covering navigation, capture, filtering, data tools, and supported task actions
- [ ] Advanced recurrence with tested edge-case handling for month boundaries and timezone changes
- [ ] Local automation rules with dry-run/preview, atomic application, duplicate-run protection, and explicit disable controls
- [ ] Import preview with conflict/duplicate resolution before any write transaction begins
- [ ] User-controlled local recovery tooling for inspectable invalid/corrupt records where safe repair is possible
- [ ] Additional locale packs with complete keyboard/accessibility coverage

### Planned engineering requirements

- [ ] Backward-compatible v1.x persisted-data and backup migration suite
- [ ] Stable feature-capability boundaries shared by web, Windows, Linux, macOS, Android, and iOS
- [ ] Performance budgets and regression tests for large local datasets
- [ ] Full cross-platform accessibility/manual verification matrix for v1.5.0
- [ ] Reproducible npm/Cargo dependency locks and exact-SHA release evidence
- [ ] Signed production packages where external credentials are available
- [ ] Verified real screenshots and checksums produced from the final tagged build
- [ ] No weakening of CSP, data validation, local-first storage, logging redaction, native least-privilege permissions, or destructive-operation safety to implement new features

## Version sequencing policy

- Do not change the package/runtime version to a future roadmap version before that version is actually being released.
- Do not skip compatibility/migration work merely to reach a larger version number.
- A planned feature can move between minor versions when evidence or implementation risk justifies it.
- Security, corruption prevention, migration safety, accessibility, and release reproducibility take priority over roadmap dates or feature count.
