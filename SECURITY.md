# Security Policy

## Supported versions

Security fixes are applied to the latest release line and `main` during active development.

## Reporting a vulnerability

Please report suspected vulnerabilities privately to `sanskarin@outlook.in` or `supportramsandesh@gmail.com`. Include the affected version, reproduction steps, impact, and a minimal proof of concept that does not expose other people's data.

Do not publish secrets, private task content, exploit details that could put users at risk, or third-party credentials in a public issue.

## Security design

- No required backend, authentication system, or production API credentials.
- Local IndexedDB storage uses explicit versioned migrations.
- Persisted task/settings rows are validated before entering application state. If local records cannot be validated, TaskMint fails closed and blocks normal editing without deleting or rewriting the stored data.
- Multi-task persistence uses an explicit Dexie read-write transaction so bulk failures abort the batch instead of leaving a partially written task set.
- JSON and CSV imports enforce shared file-size/task-count boundaries.
- JSON restore rejects malformed/duplicate task identifiers, invalid enums, impossible calendar dates/timestamps, invalid status/timestamp combinations, unsafe/non-integer order values, and oversized task fields before replacing local data.
- Duplicate safe manual-order slots from restored/local data are normalized deterministically while preserving their visible order, so later keyboard/drag moves remain writable.
- CSV import requires the complete expected header set, rejects duplicate headers, validates enum/date/task constraints row by row, rejects unsupported TaskMint CSV encoding versions, rejects malformed structured tag payloads, and rejects invalid/unterminated quote placement rather than silently coercing malformed input.
- New CSV exports encode tags with an explicit `json:` structured representation under TaskMint's `safe-text-v1` row marker so valid tag text containing the legacy `|` separator round-trips losslessly; unmarked legacy pipe-separated imports remain supported.
- New CSV exports reversibly neutralize user-controlled title, notes, and project values beginning with spreadsheet-formula prefixes (`=`, `+`, `-`, or `@`), including whitespace-prefixed formula text. TaskMint marks the export encoding so its own re-import restores the intended normalized task text without applying that decoding to legacy CSV files.
- Imported data is rendered through React text contexts; TaskMint does not inject imported task text as HTML.
- The committed production Content Security Policy uses `script-src 'self'`, `style-src 'self'`, and `connect-src 'self'`, with `object-src 'none'`, `base-uri 'self'`, and `form-action 'self'`.
- Vite development-only inline-style/WebSocket allowances are injected only while serving the development app and are not present in the committed production HTML policy.
- Known validation/import failures use typed `TaskMintError` codes. UI error formatting exposes those safe validation messages but replaces unknown browser/IndexedDB infrastructure errors with generic product copy.
- Development event logging redacts common sensitive field names. Development error logging records only a coarse error kind or stable `TaskMintError` code and does not print arbitrary exception messages.
- Persistence failures are caught before optimistic React state mutation for task lifecycle operations.
- Browser reminder delivery is bounded to a small individual batch plus a title-free summary notification for excess due reminders, preventing large imported datasets from generating an unbounded notification burst.
- PWA updates use an explicit prompt/waiting lifecycle. TaskMint does not automatically reload a tab over unsaved task input; activation occurs only after the user chooses the update action.
- `npm run secrets:check` scans tracked text paths, including benchmark sources, for common private-key and credential-token formats as a deterministic defense-in-depth CI gate.
- GitHub CodeQL and high-severity npm dependency auditing are included in repository automation. Core hosted workflows use current supported action majors and Dependabot checks GitHub Actions monthly.
- Tagged releases fail closed unless the Git tag exactly matches `package.json` and a real committed `package-lock.json` is present; release installation uses `npm ci`.
- `.env` files and common local artifacts are ignored.

## Secret-handling rule

The repository secret-pattern guard is not a substitute for GitHub secret scanning, manual review, or credential rotation. If a real credential is ever committed, treat it as compromised: revoke/rotate it through its provider and remove it from active configuration rather than relying only on a later Git history edit.

Never add a real secret to test the scanner. Use synthetic fixtures that do not authenticate to any service.

## Limitations

Local browser storage is not encrypted by TaskMint. Anyone with access to the same unlocked operating-system/browser profile may be able to inspect browser storage. Device-level account security and disk encryption remain important.
