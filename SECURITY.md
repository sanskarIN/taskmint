# Security Policy

## Supported versions

Security fixes are applied to the latest release line and `main` during active development.

Before the first stable/tagged release, the current development branch/PR may contain additional unreleased hardening. A package version string or mergeable PR is not proof that a release has passed security/quality gates.

## Reporting a vulnerability

Please report suspected vulnerabilities privately to:

- `sanskarin@outlook.in`
- `supportramsandesh@gmail.com`

Include:

- affected version/commit when known;
- reproduction steps;
- security impact;
- minimal proof of concept that does not expose other people's data;
- browser/OS context when relevant.

Do not publish secrets, private task content, third-party credentials, or exploit details that could put users at risk in a public issue.

## Security design

### Minimal remote attack surface

- No required TaskMint backend.
- No required authentication/account service.
- No production API credential requirement.
- Normal task operations use local browser IndexedDB.

This reduces server-side attack surface but does not make browser-local data automatically trusted or encrypted.

### Persisted-data trust boundary

TaskMint validates persisted task/settings rows before they enter application state.

If local records cannot be validated:

- startup fails closed;
- normal editor/settings actions are not presented;
- TaskMint does not silently delete or rewrite the stored records;
- the user receives a recovery/reload path.

Repository writes are also validated before persistence. This prevents malformed runtime values from being written merely because TypeScript/UI validation was bypassed.

Complete batch/replacement arrays are validated before write/destructive transactions begin.

### Transactional writes

Multi-task persistence uses explicit Dexie read-write transactions so bulk failures cannot leave a successful-looking partial set.

This applies to persistence-sensitive flows such as:

- imports;
- recurring completion with a generated next occurrence;
- reordering.

### Backup restore preflight

JSON restore validates/normalizes the complete backup before the destructive clear/write transaction opens.

Malformed backup content therefore cannot clear valid current tasks before its invalidity is discovered.

### Duplicate identifiers and ordering

- backup task IDs must be unique;
- repository bulk task batches must not contain duplicate IDs;
- task order values must be safe integers;
- duplicate safe persisted/restored order slots are normalized deterministically;
- recurring next occurrences and CSV appends receive collision-free allocated order slots.

### Import size/count limits

JSON and CSV input are bounded by shared limits.

Current key bounds include:

- 100,000 tasks;
- 25 MB import input cap;
- field/tag length/count limits.

Blank CSV records do not consume the task-count quota but remain covered by the independent total input-size cap.

### Strict JSON validation

JSON backup restore rejects conditions including:

- wrong app/schema envelope;
- malformed or duplicate task IDs;
- invalid enum values;
- impossible calendar dates/timestamps;
- incompatible status/timestamp combinations;
- unsafe/non-integer order values;
- oversized fields/tags;
- malformed settings.

Unknown backup schema versions are rejected rather than guessed.

### Strict/versioned CSV

CSV import:

- requires all expected task columns;
- rejects duplicate headers;
- validates enums/dates/timestamps/tasks row by row;
- rejects unknown non-empty TaskMint encoding versions;
- rejects malformed structured tag payloads;
- rejects invalid quote placement and unterminated quotes;
- preserves original source row numbers even after blank records are skipped.

Current TaskMint exports mark:

```text
taskmintEncoding = safe-text-v1
```

and use `json:` structured tag arrays so tags containing the legacy `|` separator round-trip losslessly.

Unmarked legacy pipe-separated tag imports remain supported without reinterpreting literal legacy `json:` text.

### Spreadsheet formula neutralization

Current TaskMint CSV exports reversibly neutralize user-controlled title/notes/project text beginning with spreadsheet formula prefixes:

- `=`
- `+`
- `-`
- `@`

including values where the prefix follows leading whitespace/control characters.

The TaskMint encoding marker allows its own importer to reverse that protection without applying new decoding semantics to legacy unmarked files.

This is formula-injection defense in depth; CSV remains readable data, not encrypted data.

### React text rendering

Imported task data is rendered through React text/attribute contexts. TaskMint does not intentionally inject imported task content as raw HTML.

### Content Security Policy

Committed production HTML uses restrictive directives including:

- `script-src 'self'`
- `style-src 'self'`
- `connect-src 'self'`
- `object-src 'none'`
- `base-uri 'self'`
- `form-action 'self'`

Vite development-only inline-style/WebSocket allowances are injected only in serve mode and are not part of the committed production policy.

`tests/security-config.test.ts` guards this separation.

### User-safe error boundaries

Known validation/import failures use stable typed `TaskMintError` codes/messages.

Unknown browser/IndexedDB infrastructure errors are converted to generic product copy at UI boundaries rather than exposing raw exception strings.

### Development logging privacy

Production builds do not intentionally emit TaskMint helper diagnostics because the helper exits outside development mode.

In development:

- `logError` records only a coarse error kind or stable `TaskMintError` code;
- arbitrary `Error.message` text is not logged;
- `logEvent` fails closed for string/nested metadata;
- only `null`, booleans, numbers, and narrowly validated identifier strings under approved identifier-key forms can be retained;
- sensitive-key metadata, arbitrary strings, arrays, objects, unsafe IDs, and lookalike ordinary words ending in `id` are redacted.

This is tested by `tests/logger.test.ts`.

### Persistence-first application state

Task create/edit/lifecycle/delete/Undo/reorder flows persist before applying their corresponding successful React state transition.

A failed write therefore does not intentionally leave the UI claiming the storage mutation succeeded.

### Exclusive task mutation protection

TaskMint protects persistence-sensitive user task operations at two scopes:

- local component synchronous locks suppress duplicate same-control/same-row activation;
- one App-wide synchronous task mutation gate prevents different task rows/forms from racing writes from one stale task snapshot.

The App-wide gate covers create/edit/complete/reopen/archive/restore/delete/Undo/reorder flows.

This is particularly important for recurring completion and multi-record order calculations.

### Reminder privacy/bounding

Notification permission is requested only after explicit user action.

A polling pass is bounded to:

- a small individual batch that may contain task titles;
- one title-free count summary for excess due reminders.

Failed notification delivery remains retryable.

### PWA update safety

TaskMint uses a prompt/waiting service-worker lifecycle.

It does not intentionally auto-reload a tab over unsaved task input. Update activation occurs only after the user chooses Update now, and activation itself is serialized to prevent competing calls.

### Repository secret-pattern guard

`npm run secrets:check` scans repository text for common private-key/credential-token shapes and reports file/line/category without intentionally printing the matched secret.

It is deterministic and part of CI defense in depth.

### Dependency/static analysis

Repository automation includes:

- GitHub CodeQL for JavaScript/TypeScript;
- `npm audit --audit-level=high` in CI/release;
- exact top-level dependency pinning;
- Dependabot update proposals;
- current supported workflow action majors used by the repository.

### Release fail-closed policy

Tagged releases require:

- exact Git tag == `v${package.json.version}`;
- a real committed npm-generated `package-lock.json`;
- locked `npm ci --ignore-scripts`;
- complete quality suite;
- high-severity audit;
- Chromium E2E;
- generated archive + SHA-256 checksum.

Queued/pending/cancelled/missing/stale checks are not treated as successful release evidence.

## Secret-handling rule

The secret-pattern guard is not a substitute for GitHub secret scanning, manual review, or credential rotation.

If a real credential is committed:

1. treat it as compromised;
2. revoke/rotate it at the provider immediately;
3. remove it from active configuration;
4. evaluate history-removal/disclosure needs;
5. do not simply suppress the scanner and continue using the credential.

Never add a real secret to test the scanner. Use synthetic fixtures that cannot authenticate.

## Local-data security limitations

TaskMint does not itself encrypt IndexedDB task data at rest.

Anyone with access to the same unlocked operating-system/browser profile may be able to inspect:

- task titles;
- notes;
- projects;
- tags;
- due/reminder/lifecycle metadata;
- settings.

Users should rely on appropriate device account security, browser profile security, disk encryption, and OS lock settings for local physical/profile protection.

Exported JSON/CSV files are also readable files and fall under the security of the filesystem/sync/share system where the user stores them.

## Browser notification limitation

Individual reminder notifications can expose task titles on OS/browser notification surfaces. Users handling sensitive task titles should disable TaskMint notifications or configure private notification previews at the OS/browser level.

## Architectural references

- `docs/architecture.md`
- `docs/data-model.md`
- `docs/operations.md`
- `docs/adr/0003-validation-persistence-boundaries.md`
- `docs/adr/0004-exclusive-task-mutations.md`
- `docs/adr/0005-versioned-data-portability.md`
