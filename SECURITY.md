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
- GitHub CodeQL and dependency auditing are included in repository automation.
- `.env` files and common local artifacts are ignored.

## Limitations

Local browser storage is not encrypted by TaskMint. Anyone with access to the same unlocked operating-system/browser profile may be able to inspect browser storage. Device-level account security and disk encryption remain important.
