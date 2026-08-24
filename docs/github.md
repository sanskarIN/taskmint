# TaskMint GitHub Repository Operations

This document describes recommended GitHub repository settings and maintenance policy for TaskMint. The actual workflow definitions live in `.github/workflows/`; CI/release behavior is documented in `operations.md`.

## 1. Protect `main`

The default branch should be protected so release-quality expectations cannot be bypassed casually.

Recommended rules:

- require a pull request before merge;
- require required status checks;
- require the branch to be current/up to date before merge when supported by the chosen ruleset;
- require conversation resolution;
- prevent force pushes;
- prevent branch deletion;
- restrict bypass permissions to maintainers who genuinely need emergency recovery capability.

Repository capabilities/plan can affect which GitHub ruleset controls are available. Use the strongest practical configuration without claiming an unavailable setting exists.

## 2. Required checks

For ordinary code/release-candidate changes, the expected hosted checks are:

- CI;
- E2E;
- CodeQL.

Names/status contexts should match the actual workflows/jobs configured in GitHub.

Do not treat:

- queued;
- pending;
- in progress;
- cancelled;
- missing;
- stale older-SHA success

as a successful current check.

## 3. Exact-head verification

Before merge/release decisions:

1. read the current PR head SHA;
2. inspect workflow runs associated with that exact SHA;
3. require explicit successful conclusions;
4. if a new commit lands, discard old results as release evidence;
5. repeat verification on the new head.

This matters especially for documentation-only commits too: a docs change still changes the source tree/tag candidate and can affect repository checks such as formatting/docs links/secrets.

## 4. Mergeable is not verified

GitHub can report a PR as mergeable when the Git graph has no blocking merge conflict.

That does **not** mean:

- tests passed;
- E2E passed;
- CodeQL passed;
- audit passed;
- release prerequisites exist.

Keep verification state and merge-conflict state conceptually separate.

## 5. Merge policy

Prefer a merge method that preserves a readable history and the intended commit discipline.

For small single-purpose contributor PRs, squash merge can be appropriate and the squash title should preserve Conventional Commit semantics.

For a large intentionally granular engineering branch, maintainers may choose a method that preserves meaningful atomic commits when that history has value.

Whichever merge method is used, verify the resulting exact `main` SHA after merge when release evidence depends on the final tree.

## 6. Pull request template

`.github/PULL_REQUEST_TEMPLATE.md` is the default contributor checklist.

PR descriptions should explain:

- problem/goal;
- implementation scope;
- tests added/changed;
- documentation changed;
- accessibility/privacy/security impact;
- data migration/import/export impact;
- release risk when relevant.

Avoid a PR body that simply says “done” for a change that affects persistence or release behavior.

## 7. Issue templates

Current issue forms:

- `.github/ISSUE_TEMPLATE/bug_report.yml`
- `.github/ISSUE_TEMPLATE/feature_request.yml`
- `.github/ISSUE_TEMPLATE/config.yml`

Use bug reports for reproducible defects and feature requests for product proposals.

Sensitive vulnerabilities belong in the private reporting path described by `../SECURITY.md`, not a public bug issue.

## 8. Discussions

GitHub Discussions can be enabled when maintainers want a lower-pressure space for:

- usage questions;
- ideas;
- project showcases;
- community conversation.

Keep reproducible implementation defects in Issues and security disclosures private.

## 9. Recommended labels

Useful labels include:

- `bug`
- `enhancement`
- `documentation`
- `accessibility`
- `security`
- `privacy`
- `performance`
- `dependencies`
- `ci`
- `pwa`
- `data-portability`
- `good first issue`
- `help wanted`
- `release`

Labels should improve triage rather than become a second uncontrolled taxonomy.

## 10. Milestones

Use roadmap-aligned milestones such as:

- `v0.1`
- `v0.2`
- `v0.3`

A GitHub milestone should summarize delivery scope and open work; `ROADMAP.md` remains the public durable roadmap.

## 11. Dependabot

`.github/dependabot.yml` configures automated update proposals.

Dependabot PRs are not self-approving. Review:

- changelog/release notes of the dependency;
- runtime/security impact;
- Node/browser compatibility;
- build/PWA implications;
- lockfile changes once the lockfile exists;
- CI/E2E/CodeQL conclusions.

## 12. GitHub Actions security

Workflow permissions should stay minimal.

Current broad pattern:

- CI/E2E: read repository contents;
- CodeQL: read contents + write security events;
- Release: write contents because it creates GitHub Release assets.

Do not add broad `write-all` permissions for convenience.

Third-party actions should be reviewed before introduction or major upgrade.

## 13. Workflow action versions

Core workflows currently use supported action majors such as:

- `actions/checkout@v6`
- `actions/setup-node@v6`
- `actions/upload-artifact@v7`
- `github/codeql-action@v4`

Dependabot should continue monitoring GitHub Actions.

An action-major upgrade requires the same review as a dependency upgrade; “latest” is not automatically safe.

## 14. Workflow concurrency

CI, E2E, and CodeQL use ref-scoped concurrency cancellation.

Purpose:

- newer commits supersede older work;
- avoid wasting runner capacity on stale candidates.

Even if an old run is not immediately cancelled by GitHub, treat it as stale after the head changes.

## 15. CI workflow expectations

`.github/workflows/ci.yml` should remain aligned with `package.json` quality commands and currently covers:

- dependency installation;
- format invariants;
- documentation links;
- secret patterns;
- lint;
- typecheck;
- Vitest;
- production build;
- high-severity npm audit.

If a new mandatory quality guard is introduced, decide whether it belongs in `npm run check`, CI, release, or all relevant layers and document the decision.

## 16. E2E workflow expectations

`.github/workflows/e2e.yml` runs Chromium Playwright against built/previewed output.

On failure it uploads `playwright-report/` for diagnosis.

Inspect that artifact instead of guessing at browser failures.

## 17. CodeQL expectations

`.github/workflows/codeql.yml` analyzes JavaScript/TypeScript on PR/main and scheduled cadence.

Do not disable CodeQL to work around a real finding or workflow problem without an explicit documented security decision.

## 18. Release workflow expectations

`.github/workflows/release.yml` is tag-triggered and intentionally fail-closed.

It requires:

- exact release guard;
- committed lockfile;
- `npm ci`;
- quality suite;
- audit;
- Chromium E2E;
- artifact packaging;
- SHA-256 checksum.

Do not create a manual GitHub Release that falsely implies the automated release gates succeeded if they did not.

## 19. Repository secrets

TaskMint's current application does not require a deployment/application API secret.

If GitHub Actions secrets are ever introduced:

- scope them minimally;
- use environment protection where appropriate;
- avoid exposing them to untrusted fork code;
- never echo them;
- document why the secret is required;
- update `SECURITY.md` and operations documentation.

## 20. Funding

`.github/FUNDING.yml` configures the repository funding surface.

Funding links should remain clearly separate from application functionality and must not affect TaskMint's local-first/privacy guarantees.

## 21. Releases/tags

Use annotated/repository tags only after the release checklist passes.

Never move/reuse a published version tag to point at different code merely to avoid issuing a new version.

Release artifacts/checksums must correspond to the tagged source.

## 22. Branch cleanup

After a PR is merged/closed and no longer needed, stale feature/verification branches can be removed according to maintainer policy.

Do not delete a branch if it is still the only convenient reference for unmerged work/handoff evidence.

## 23. Archived verification PRs

When a newer hardening/verification PR supersedes an older one:

- close the old PR if appropriate;
- clearly note it is superseded/not release evidence;
- do not merge both accidentally;
- retain enough handoff/history to understand why it was replaced.

## 24. Documentation and GitHub UI

Repository settings are partly outside Git, so important expected settings must remain documented here.

When a maintainer changes branch protection/rulesets, required checks, issue/discussion policy, or merge methods, update this file if the change affects contributor/release expectations.

## 25. Suggested protected-branch review checklist

Periodically verify in GitHub UI:

- default branch is `main`;
- force push disabled;
- deletion disabled;
- PR requirement enabled;
- intended required checks are selected;
- stale status checks are not accidentally accepted;
- bypass actors are minimal;
- Actions are permitted to run necessary workflows;
- security analysis/CodeQL settings align with workflow expectations;
- Dependabot/security alerts are enabled as intended.

## 26. Related docs

- `operations.md` — workflow internals/exact-SHA verification.
- `release.md` — release promotion checklist.
- `testing.md` — test layers.
- `development.md` — contributor implementation rules.
- `repository-reference.md` — all GitHub files and repository map.
- `../SECURITY.md` — vulnerability policy.
- `../CONTRIBUTING.md` — contributor workflow.
