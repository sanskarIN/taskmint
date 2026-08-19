# Security Policy

## Supported versions

Security fixes are applied to the latest release line and `main` during active development.

## Reporting a vulnerability

Please report suspected vulnerabilities privately to `sanskarin@outlook.in` or `supportramsandesh@gmail.com`. Include the affected version, reproduction steps, impact, and a minimal proof of concept that does not expose other people's data.

Do not publish secrets, private task content, exploit details that could put users at risk, or third-party credentials in a public issue.

## Security design

- No required backend, authentication system, or production API credentials.
- Local IndexedDB storage uses explicit versioned migrations.
- JSON and CSV imports enforce file-size and structural validation.
- Content Security Policy limits executable/resource origins to the application origin.
- Development logs redact common sensitive field names and never intentionally log task titles or notes.
- GitHub CodeQL and dependency auditing are included in repository automation.
- `.env` files and common local artifacts are ignored.

## Limitations

Local browser storage is not encrypted by TaskMint. Anyone with access to the same unlocked operating-system/browser profile may be able to inspect browser storage. Device-level account security and disk encryption remain important.
