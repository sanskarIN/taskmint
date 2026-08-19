# TaskMint Roadmap

The roadmap favors coherent improvements over feature count.

## v0.1 — Local-first foundation

- [x] Core task lifecycle
- [x] Projects, tags, priorities, notes, due dates, reminders, recurrence
- [x] Search, smart views, filters, sorting, and manual reordering
- [x] Global search/new-task keyboard shortcuts with modal/typing safeguards
- [x] IndexedDB persistence and schema migration
- [x] JSON/CSV portability and local deletion
- [x] Strict shared limits and malformed import rejection
- [x] Responsive themes and accessibility baseline
- [x] Externalized English product string catalog
- [x] Progressive large-list rendering
- [x] PWA configuration
- [x] Automated unit/component/parser-stress/migration/offline/backup/keyboard/accessibility/pagination tests
- [x] CI, E2E, CodeQL, Dependabot, release, and repository-governance automation baseline
- [ ] Complete clean-network dependency installation and browser verification in hosted CI
- [ ] Capture real screenshots from a verified release build
- [ ] Generate and commit the npm lockfile from a successful real registry resolution
- [ ] Tag `v0.1.0` only after all release gates are green

## v0.2 — Reliability and polish

- [ ] Bulk selection/actions with strong keyboard support
- [ ] Import preview and duplicate-resolution workflow
- [ ] Additional locale packs using the v0.1 externalized string architecture
- [ ] More migration fixtures and corrupted-record recovery scenarios
- [ ] Benchmark 1k/10k/50k/100k task filtering and IndexedDB operations; adopt indexed-query or worker optimizations if measurement justifies them

## v0.3 — Optional desktop evaluation

- [ ] Evaluate Tauri only if native reminders, startup integration, or filesystem backup materially improve the product
- [ ] Keep the web/PWA build fully functional without a desktop wrapper
