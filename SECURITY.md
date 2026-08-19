# Security Policy

## Supported versions

Security fixes are applied to the latest release line and `main` during active development.

## Reporting a vulnerability

Please report suspected vulnerabilities privately to `sanskarin@outlook.in` or `supportramsandesh@gmail.com`. Include the affected version, reproduction steps, impact, and a minimal proof of concept that does not expose other people's data.

Do not publish secrets, private task content, exploit details that could put users at risk, or third-party credentials in a public issue.

## Security design

- No required backend, authentication system, or production API credentials.
- Local IndexedDB storage uses explicit versioned migrations.
- JSON and CSV imports enforce shared file-size/task-count boundaries.
- JSON restore rejects malformed/duplicate task identifiers, invalid enums, impossible dates, malformed timestamps, invalid status/timestamp combinations, invalid numeric order values, and oversized task fields before replacing local data.
- CSV import requires the complete expected header set, rejects duplicate headers, validates enum/date/task constraints row by row, and rejects unterminated quoted fields rather than silently coercing malformed input.
- Imported data is rendered through React text contexts; TaskMint does not inject imported task text as HTML.
- Content Security Policy limits executable/resource origins to the application origin.
- Development logs redact common sensitive field names and never intentionally log task titles or notes.
- Persistence failures are caught before optimistic React state mutation for task lifecycle operations.
- `npm run secrets:check` scans tracked text paths for common private-key and credential-token formats as a deterministic defense-in-depth CI gate.
- GitHub CodeQL and high-severity npm dependency auditing are included in repository automation.
- `.env` files and common local artifacts are ignored.

## Secret-handling rule

The repository secret-pattern guard is not a substitute for GitHub secret scanning, manual review, or credential rotation. If a real credential is ever committed, treat it as compromised: revoke/rotate it through its provider and remove it from active configuration rather than relying only on a later Git history edit.

Never add a real secret to test the scanner. Use synthetic fixtures that do not authenticate to any service.

## Limitations

Local browser storage is not encrypted by TaskMint. Anyone with access to the same unlocked operating-system/browser profile may be able to inspect browser storage. Device-level account security and disk encryption remain important.
