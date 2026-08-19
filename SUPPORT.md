# TaskMint Support

TaskMint is an open-source local-first project. This page explains where to look first and where to report different kinds of problems.

## Self-service documentation

Before reporting an ordinary usage/setup issue, check:

- `README.md` — project overview and quick start.
- `docs/README.md` — complete documentation index.
- `docs/user-guide.md` — full user behavior/features.
- `docs/setup.md` — development installation/build/PWA setup.
- `docs/troubleshooting.md` — symptom-based recovery guide.
- `docs/data-model.md` — JSON/CSV/persisted data formats.
- `docs/release.md` — release verification/process.

## Usage help and project questions

Contact:

- Support: `supportramsandesh@gmail.com`
- Business/project: `sanskarin@outlook.in`
- Business/project: `sanskarin.business@gmail.com`
- GitHub profile: https://github.com/sanskarIN

For reproducible public software bugs, a GitHub bug issue is generally more useful than private email because maintainers/contributors can track the fix publicly—unless the report contains security-sensitive/private information.

## Useful bug report information

Include when relevant:

- TaskMint version/commit/branch;
- browser and version;
- operating system;
- whether running dev server, production preview, deployed site, or installed PWA;
- exact steps to reproduce;
- expected behavior;
- observed behavior;
- whether the issue happens after reload/offline/update/import;
- safe console/workflow errors with private task content removed;
- minimal fictional fixture file if an import bug requires data.

Never attach a private real task backup publicly just to demonstrate an issue.

## Import/export help

For JSON/CSV problems, first read:

- `docs/data-model.md`
- relevant sections in `docs/troubleshooting.md`

When sharing a reproduction file, create a minimal synthetic file containing no private titles, notes, personal identifiers, credentials, or confidential project data.

## Local-data recovery

If TaskMint displays the fail-closed local-data recovery screen, do not immediately clear browser site data if the records matter.

See the recovery section in `docs/troubleshooting.md` and preserve/inspect the browser profile before destructive action.

TaskMint's current recovery state intentionally does not auto-delete malformed local records.

## Notifications/PWA help

Reminder delivery and installed-PWA behavior vary across browsers/operating systems.

When reporting a problem include:

- browser/OS;
- installed PWA vs browser tab;
- notification permission state;
- whether TaskMint was open;
- service-worker/update state when relevant.

Remember that TaskMint does not claim portable closed-app background reminder scheduling on every browser/OS.

## Security vulnerabilities

Do **not** post sensitive vulnerability details publicly.

Follow `SECURITY.md` and report privately when disclosure could put users at risk.

Do not include:

- real credentials;
- private user task content;
- third-party secrets;
- unnecessary exploit data involving other users.

## Privacy questions

Read `PRIVACY.md` for the local data/network/export/notification model.

Privacy questions can be sent to:

- `sanskarin@outlook.in`
- `supportramsandesh@gmail.com`

## Contributions

For development/contribution work see:

- `CONTRIBUTING.md`
- `docs/development.md`
- `docs/repository-reference.md`
- `docs/file-index.md`
- `docs/test-matrix.md`

## Funding

If TaskMint is useful to you, optional support is available through Buy Me a Coffee. Donations are never required to use the product.

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-sanskarIN-FFDD00?logo=buy-me-a-coffee&logoColor=000000)](https://buymeacoffee.com/sanskarIN)

**Made by the Sanskar**
