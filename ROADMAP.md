# TaskMint Roadmap

The roadmap favors coherent improvements over feature count.

## v0.1 — Local-first foundation

- [x] Core task lifecycle
- [x] Projects, tags, priorities, notes, due dates, reminders, recurrence
- [x] Search, smart views, filters, sorting, and manual reordering
- [x] Global search/new-task keyboard shortcuts with modal/typing safeguards
- [x] Date-sensitive views/statistics refresh while the app remains open
- [x] IndexedDB persistence and schema migration
- [x] Atomic multi-task writes for imports, recurring completion, and reordering
- [x] JSON/CSV portability and local deletion
- [x] Lossless versioned CSV tag encoding with legacy import compatibility
- [x] Spreadsheet-formula neutralization for user-controlled CSV text fields
- [x] Strict shared limits and malformed import rejection
- [x] Stable typed validation/import error codes and safe unknown-error UI fallbacks
- [x] Locale-independent canonical tag normalization
- [x] Responsive themes and accessibility baseline
- [x] Externalized English product string catalog
- [x] Progressive large-list rendering
- [x] PWA configuration
- [x] Production CSP separated from Vite development-only relaxations
- [x] Automated unit/component/parser-stress/property/download/CSP/repository/migration/offline/backup/keyboard/accessibility/pagination tests
- [x] Repeatable 10,000-task filtering/statistics benchmark harness
- [x] Deterministic documentation-link and secret-pattern repository checks
- [x] CI, E2E, CodeQL, Dependabot, release, and repository-governance automation baseline
- [x] Release workflow quality/audit/E2E gates and SHA-256 artifact checksum
- [x] Fail-closed tag/version/lockfile release readiness guard
- [ ] Complete clean-network dependency installation and browser verification in hosted CI
- [ ] Capture real screenshots from a verified release build
- [ ] Generate and commit the npm lockfile from a successful real registry resolution
- [ ] Tag `v0.1.0` only after all release gates are green

## v0.2 — Reliability and polish

- [ ] Bulk selection/actions with strong keyboard support
- [ ] Import preview and duplicate-resolution workflow
- [ ] Additional locale packs using the v0.1 externalized string/error-code architecture
- [ ] More migration fixtures and corrupted-record recovery scenarios
- [ ] Extend measured benchmarks to 1k/50k/100k tasks and IndexedDB operations; adopt indexed-query, virtualization, or worker optimizations only if measurement justifies them

## v0.3 — Optional desktop evaluation

- [ ] Evaluate Tauri only if native reminders, startup integration, or filesystem backup materially improve the product
- [ ] Keep the web/PWA build fully functional without a desktop wrapper
