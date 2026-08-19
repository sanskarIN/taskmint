# TaskMint Roadmap

The roadmap favors coherent improvements over feature count.

## v0.1 — Local-first foundation

- [x] Core task lifecycle
- [x] Projects, tags, priorities, notes, due dates, reminders, recurrence
- [x] Search, smart views, filters, sorting, and manual reordering
- [x] IndexedDB persistence and schema migration
- [x] JSON/CSV portability and local deletion
- [x] Responsive themes and accessibility baseline
- [x] PWA configuration
- [x] Automated test and repository automation baseline
- [ ] Complete clean-network dependency installation and browser verification in CI
- [ ] Capture real screenshots from a verified release build

## v0.2 — Reliability and polish

- [ ] Bulk selection/actions with strong keyboard support
- [ ] Import preview and duplicate-resolution workflow
- [ ] More migration fixtures and corrupted-record recovery tests
- [ ] Virtualized rendering benchmark before adopting virtualization
- [ ] Additional locale packs after string-extraction audit

## v0.3 — Optional desktop evaluation

- [ ] Evaluate Tauri only if native reminders, startup integration, or filesystem backup materially improve the product
- [ ] Keep the web/PWA build fully functional without a desktop wrapper
