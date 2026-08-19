# TaskMint Roadmap

The roadmap favors coherent improvements over feature count.

## v0.1 — Local-first foundation

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
- [x] Strict calendar/timestamp parsing without JavaScript rollover acceptance
- [x] Strict shared limits and malformed import rejection
- [x] Stable typed validation/import error codes and safe unknown-error UI fallbacks
- [x] Locale-independent canonical tag normalization
- [x] Development diagnostics that omit arbitrary exception messages and redact unknown event metadata by default
- [x] Bounded browser-reminder delivery with count-only aggregation for excess due reminders
- [x] Serialized task composer, task-row, onboarding, Settings, and PWA update actions to prevent duplicate pending mutations
- [x] Responsive themes and accessibility baseline
- [x] Active smart-view/project `aria-current`, named filter grouping, and complete Sidebar navigation landmark semantics
- [x] Externalized English product string catalog
- [x] Progressive large-list rendering
- [x] PWA configuration with explicit waiting/update prompt instead of automatic draft-destructive reloads
- [x] Production CSP separated from Vite development-only relaxations
- [x] Automated unit/component/parser-stress/property/download/CSP/repository/datetime/PWA/migration/corrupt-data/offline/backup/keyboard/accessibility/pagination tests
- [x] Component regression coverage for duplicate submission/mutation/update locks, cross-row exclusivity, navigation semantics, and safe error states
- [x] Repeatable 10,000-task filtering/statistics benchmark harness using the pinned Vitest 4 API
- [x] Deterministic documentation-link and secret-pattern repository checks
- [x] CI, E2E, CodeQL, Dependabot, release, and repository-governance automation baseline
- [x] Core GitHub workflows upgraded to current supported action majors
- [x] Release workflow quality/audit/E2E gates and SHA-256 artifact checksum
- [x] Fail-closed tag/version/lockfile release readiness guard
- [ ] Complete clean-network dependency installation and browser verification in hosted CI
- [ ] Capture real screenshots from a verified release build
- [ ] Generate and commit the npm lockfile from a successful real registry resolution
- [ ] Complete the manual keyboard/zoom/theme/offline/reminder/import/update release checklist on the verified build
- [ ] Tag `v0.1.0` only after all release gates are green

## v0.2 — Reliability and polish

- [ ] Bulk selection/actions with strong keyboard support
- [ ] Import preview and duplicate-resolution workflow
- [ ] Explicit user-controlled corrupted-record inspection/recovery tooling, if real-world need justifies it
- [ ] Additional locale packs using the v0.1 externalized string/error-code architecture
- [ ] More historical migration fixtures beyond the existing v1-to-v2 browser migration
- [ ] Extend measured benchmarks to 1k/50k/100k tasks and IndexedDB operations; adopt indexed-query, virtualization, or worker optimizations only if measurement justifies them

## v0.3 — Optional desktop evaluation

- [ ] Evaluate Tauri only if native reminders, startup integration, or filesystem backup materially improve the product
- [ ] Keep the web/PWA build fully functional without a desktop wrapper
