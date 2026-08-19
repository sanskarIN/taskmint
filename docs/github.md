# GitHub Repository Operations

## Branch protection

Protect `main` in repository settings. Require pull requests, successful CI, E2E, and CodeQL checks, conversation resolution, and a current branch before merge. Prevent force pushes and branch deletion for `main`.

Do not treat a mergeable pull request as release-ready while a required check is queued, pending, skipped unexpectedly, cancelled without replacement, or failing.

## Discussions

Enable GitHub Discussions when the maintainer wants a lower-pressure place for usage questions, ideas, and showcase posts. Keep reproducible defects in Issues and sensitive security reports private according to `SECURITY.md`.

## Labels

Recommended labels include `bug`, `enhancement`, `documentation`, `accessibility`, `security`, `performance`, `dependencies`, `good first issue`, `help wanted`, and `release`.

## Milestones

Use release-oriented milestones such as `v0.1`, `v0.2`, and `v0.3`. A milestone should reflect the public roadmap rather than becoming a duplicate task tracker.

## Merge policy

Prefer squash merge for small single-purpose pull requests and preserve Conventional Commit wording in the squash title. Require the pull request checklist and relevant tests before merging.

For release-candidate verification PRs, keep the PR open until CI, E2E, and CodeQL have explicit successful conclusions. If source changes land on `main` after a verification branch was created, resynchronize the branch and require fresh checks before using its results as release evidence.
