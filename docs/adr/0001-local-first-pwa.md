# ADR 0001: Local-first PWA architecture

- Status: Accepted
- Date: 2026-08-19

## Context

TaskMint should work without an account and keep normal task operations available offline across desktop operating systems.

## Decision

Use a React/Vite Progressive Web App with IndexedDB as the primary product. Do not require a backend or desktop wrapper for core functionality.

## Consequences

- Privacy and offline behavior remain straightforward.
- Web installation can cover Windows, macOS, and Linux where supported.
- Reliable closed-app scheduled reminders vary by browser/OS, so TaskMint documents that limitation rather than adding a server dependency solely for notifications.
- A Tauri wrapper may be reconsidered only for clear native value.
