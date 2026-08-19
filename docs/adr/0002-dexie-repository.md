# ADR 0002: Dexie with repository boundary

- Status: Accepted
- Date: 2026-08-19

## Context

Raw IndexedDB is verbose and migration-heavy, but storage details should not leak throughout React components.

## Decision

Use Dexie for IndexedDB schema/migrations and expose application persistence through `TaskRepository`.

## Consequences

- Transactions and schema changes stay centralized.
- Domain logic remains testable without browser storage.
- Dexie becomes a small runtime dependency that must be monitored through dependency updates and security checks.
