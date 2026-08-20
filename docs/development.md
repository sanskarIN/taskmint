# Development

## Important commands

- `npm run dev` — Vite web/PWA development server
- `npm run tauri:dev` — native desktop development through Tauri
- `npm run tauri:build` — native desktop build/bundle for the current host OS
- `npm run tauri:android:init` / `npm run tauri:android:dev` / `npm run tauri:android:build` — Android initialization, development, and build commands
- `npm run tauri:ios:init` / `npm run tauri:ios:dev` / `npm run tauri:ios:build` — iOS initialization, development, and build commands; iOS tooling requires macOS
- `npm run native:check` — Rust/Tauri compile check for the current native host
- `npm run format` / `npm run format:check` — formatting and deterministic text invariants
- `npm run docs:check` — verify repository-relative Markdown links resolve inside the repository
- `npm run secrets:check` — scan tracked text paths for common committed-secret patterns
- `npm run lint` — strict type-aware ESLint
- `npm run typecheck` — TypeScript project checks, including benchmarks
- `npm test` — Vitest unit/component/property tests
- `npm run bench` — non-gating 10,000-task Vitest 4 domain benchmarks
- `npm run test:e2e` — Playwright Chromium journey tests
- `npm run build` — production web/PWA build
- `npm run check` — complete local web quality suite, including formatting, docs, secret guard, lint, types, tests, and build

See [cross-platform.md](cross-platform.md) before working on native targets.

## Architecture rules

- Put business rules in `src/domain/` rather than event handlers.
- Route persistent changes through `TaskRepository`.
- Put browser/native integration differences behind `src/platform/`; do not fork task-domain or React feature logic by operating system.
- Keep Tauri initialization and capability declarations in `src-tauri/`; do not call unrestricted shell/process APIs from product code.
- Validate imported data and persisted IndexedDB rows as untrusted input before they enter application state.
- Keep strict timestamp parsing in `src/domain/datetime.ts`; never rely on JavaScript `Date` normalization to validate calendar input.
- Keep all manual-order comparison/allocation/normalization in `src/domain/order.ts`. Order values must remain safe integers, and duplicate persisted slots must preserve deterministic visible order while becoming uniquely writable.
- Keep shared task/import limits in `src/domain/limits.ts`; do not duplicate magic length/count limits in UI/import code.
- Put visible product copy in `src/i18n/en.ts` instead of scattering independent strings across components. Domain/debug-only messages may remain internal, but user-facing controls/status copy belongs in the catalog.
- Keep global keyboard shortcuts in the pure resolver at `src/utils/keyboard.ts` and protect editable/modal contexts before adding new bindings.
- Development diagnostics must not log arbitrary exception messages or task content. Use stable error codes/coarse error kinds.
- Do not add network tracking or account requirements without an ADR and privacy review.
- Keep UI actions keyboard accessible and usable at narrow widths and on touch-first devices.
- Keep task-card rendering bounded for large datasets; do not remove progressive pagination without replacing it with measured virtualization/pagination.
- Keep reminder delivery bounded; do not replace aggregation with unbounded per-task notification loops.
- Do not claim background reminder scheduling unless an OS-level implementation has been added and tested for the affected native target.
- Add regression coverage with bug fixes.

## Cross-platform boundary rules

- `src/platform/runtime.ts` is the canonical Tauri-runtime check.
- Browser/PWA behavior remains the fallback when the app is not running inside Tauri.
- Native file access must continue to use system dialogs plus scoped Tauri filesystem permissions. Do not grant broad directory or filesystem scopes for import/export convenience.
- Check native import metadata/size before reading file contents so `TASK_LIMITS.importBytes` remains enforced on every platform.
- Native external `http:`, `https:`, `mailto:`, and `tel:` navigation must use the operating-system opener integration.
- The PWA service-worker updater must not run inside a native Tauri shell.
- Native notifications must remain permission-gated and best-effort, preserving reminder retry behavior when delivery fails.
- Keep desktop and mobile Tauri capabilities separate when permissions differ or may diverge later.
- Treat generated Android/iOS projects as platform build products that must be initialized with the pinned Tauri CLI and reviewed before release-specific customization.

## PWA update rules

- Keep `vite-plugin-pwa` in `registerType: 'prompt'` mode while TaskMint has unsaved form input.
- Do not switch to `autoUpdate` unless the product first gains a reliable draft-persistence/restore design and corresponding tests.
- The user-facing update action must activate the waiting worker through `virtual:pwa-register/react` and `updateServiceWorker(true)`; a plain page reload is not the update protocol.
- Keep `workbox-window` explicitly pinned because the React registration helper depends on it.
- Update failures must use safe product copy and must not alter local task data.
- Keep the PWA update component disabled inside Tauri; native package updating belongs to the platform distribution path.

## Data portability rules

- JSON is the full-fidelity backup/restore format.
- CSV is a human-readable interchange format and does not preserve original completion/archive timestamps.
- New CSV exports encode tags as a `json:`-prefixed JSON array under the `safe-text-v1` TaskMint encoding marker so valid tag text such as `ci|cd` round-trips without delimiter loss.
- Continue accepting unmarked legacy pipe-separated tag cells for backwards compatibility.
- Do not interpret `json:` as structured tags in an unmarked legacy row.
- Reject unknown non-empty TaskMint CSV encoding versions instead of falling back silently.
- Reject malformed structured CSV tag payloads, invalid quote placement, unterminated quoted fields, malformed enums, impossible dates, and invalid timestamps instead of silently coercing them.
- Keep spreadsheet-formula neutralization reversible only for TaskMint-marked rows; legacy CSV text must not be reinterpreted.
- Validate an entire JSON backup before replacing current IndexedDB data.
- Keep import byte/task-count limits aligned with `TASK_LIMITS` on both browser and native file paths.

## Persistence/recovery rules

- Multi-task writes must remain inside explicit read-write transactions.
- React state must change only after the corresponding persistent write succeeds.
- Startup read validation failures are fail-closed: show recovery UI and do not expose normal editing controls against an empty-looking state.
- Do not automatically delete, rewrite, or repair malformed local records during a failed startup. Recovery tooling, if added later, must be explicit and separately tested.

## Native CI rules

`.github/workflows/native.yml` is intentionally separate from the web quality workflow:

- desktop checks run on Ubuntu, Windows, and macOS;
- Android CI initializes a generated project and builds an ARM64 debug target;
- iOS CI runs on macOS, initializes the project, and builds for the runner-compatible simulator architecture.

Do not replace native build jobs with configuration-only checks. If a platform job must temporarily be disabled, document the reason and restore it before claiming that target is release-validated.

## Repository hygiene

`docs:check` validates local Markdown targets only. External URLs are intentionally not fetched during this deterministic repository check; review important external links during release preparation.

`secrets:check` is a defense-in-depth pattern guard for common credential formats and private keys. It does not replace GitHub secret scanning, credential rotation, or manual security review. Never commit a real secret merely to test the scanner.

Native signing keys, certificates, provisioning profiles, Android keystores, Apple credentials, and store secrets must never be committed. Use protected repository/environment secrets for signed release workflows.

## Dependency/workflow policy

Top-level JavaScript and Rust dependencies are exact-version pinned. Dependency updates are proposed/reviewed separately and should be merged only after web/native CI verification. Real npm- and Cargo-generated lockfiles remain required before a reproducible release; never fabricate either by hand.

Core GitHub workflows should stay on current supported action majors, with monthly Dependabot coverage for GitHub Actions. Tagged web releases have no dependency-install fallback and must continue using `npm ci` after the release guard confirms a committed npm lockfile.
