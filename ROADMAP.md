# TaskMint Roadmap

The roadmap favors coherent improvements over feature count.

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
