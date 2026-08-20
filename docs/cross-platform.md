# Cross-platform support

TaskMint uses one React/TypeScript application core across web, desktop, and mobile. The browser/PWA build remains a first-class target, while Tauri 2 provides native application shells for Windows, macOS, Linux, Android, and iOS/iPadOS.

## Platform matrix

| Platform | Delivery | Status | Primary runtime |
| --- | --- | --- | --- |
| Web | Browser | Supported | Modern evergreen browser |
| PWA | Installable web app | Supported | Browser service worker + IndexedDB |
| ChromeOS | PWA | Supported | Chrome/PWA |
| Windows | Native Tauri app | Supported source target | WebView2 + Rust/Tauri |
| macOS | Native Tauri app | Supported source target | WKWebView + Rust/Tauri |
| Linux | Native Tauri app | Supported source target | WebKitGTK + Rust/Tauri |
| Android | Native Tauri app | Supported source target | Android WebView + Rust/Tauri |
| iOS/iPadOS | Native Tauri app | Supported source target | WKWebView + Rust/Tauri |

“Supported source target” means the repository contains the native shell, capabilities, platform adapters, build scripts, application icons, and CI build lane. Store publishing still requires the signing identities, developer accounts, and release credentials owned by the publisher.

## Shared application behavior

The following code is shared instead of being forked per platform:

- task CRUD and lifecycle rules;
- recurrence, priorities, dates, projects, tags, filters, ordering, and statistics;
- Dexie/IndexedDB persistence and schema migration;
- JSON backup/restore and CSV import/export validation;
- onboarding, themes, reduced motion, accessibility, and responsive UI;
- user-safe validation and error handling.

This keeps platform differences at the boundary rather than duplicating product logic.

## Platform adapters

`src/platform/` contains the runtime boundary.

### Runtime detection

`runtime.ts` detects whether TaskMint is executing inside Tauri. Browser/PWA behavior is the default when it is not.

### File import and export

`files.ts` provides portable text-file operations:

- Browser/PWA: Blob download plus the existing browser file picker.
- Native: Tauri system open/save dialogs plus scoped filesystem reads/writes.
- Native imports call `stat` before reading and enforce the same `TASK_LIMITS.importBytes` limit as browser imports.

The native capability files grant only the required dialog, metadata, text-read, and text-write commands rather than broad filesystem access.

### Notifications

- Browser/PWA: the Web Notifications API is requested only after explicit user action.
- Native: the Tauri notification plugin requests system permission and sends system notifications.

TaskMint currently checks due reminders while the application is running. It does not claim OS-level background scheduling while the app is fully terminated. Adding background scheduling later requires platform-specific lifecycle design, privacy review, and tests.

### External links

Browser/PWA builds use normal anchors. Native builds intercept external `http:`, `https:`, `mailto:`, and `tel:` links and open them through the operating system using Tauri's opener plugin.

### Updates

The PWA service-worker update prompt runs only in browser/PWA builds. Native shells do not register that updater; native packages are updated through their distribution channel. Reload in native Settings refreshes only the current application session.

## Tauri layout

```text
src-tauri/
├── Cargo.toml
├── build.rs
├── capabilities/
│   ├── desktop.json
│   └── mobile.json
├── icons/
│   ├── 32x32.png
│   ├── 128x128.png
│   ├── 128x128@2x.png
│   ├── icon.png
│   ├── icon.icns
│   └── icon.ico
├── src/
│   ├── lib.rs
│   └── main.rs
└── tauri.conf.json
```

`src-tauri/src/lib.rs` is the shared Tauri entry point. The `#[cfg_attr(mobile, tauri::mobile_entry_point)]` attribute allows the same Rust application setup to be used by mobile targets, while `src-tauri/src/main.rs` is the desktop executable entry point.

## Common requirements

TaskMint pins its JavaScript package-manager behavior so local and hosted builds use the same dependency resolver. Use a Node.js version compatible with the `engines.node` range in `package.json`; the hosted workflows currently use Node.js `22.23.2` and npm `12.0.2`. The `packageManager` field is the authoritative npm version for this release candidate.

You also need:

- Rust stable compatible with the version declared in `src-tauri/Cargo.toml`;
- the operating-system dependencies required by Tauri;
- Android SDK/NDK/JDK tooling for Android builds;
- macOS with Xcode/CocoaPods for iOS/iPadOS builds.

Confirm the JavaScript toolchain before installing dependencies:

```bash
node --version
npm --version
```

Install JavaScript dependencies:

```bash
npm install
```

Run the web application:

```bash
npm run dev
```

Build the web/PWA application:

```bash
npm run build
```

## Windows

Install the Microsoft C++ build tools and WebView2 prerequisites required by Tauri, then run:

```bash
npm run tauri:dev
npm run tauri:build
```

The configured bundle icon includes `src-tauri/icons/icon.ico`.

## macOS

Install Xcode or the Xcode command-line tools for desktop development, then run:

```bash
npm run tauri:dev
npm run tauri:build
```

The configured bundle icon includes `src-tauri/icons/icon.icns`.

A signed/notarized public release requires the publisher's Apple signing/notarization setup; those credentials must never be committed.

## Linux

Install the Tauri system packages for your distribution. On Debian/Ubuntu, the required development set includes WebKitGTK 4.1 and the other packages listed in the official Tauri prerequisites. Then run:

```bash
npm run tauri:dev
npm run tauri:build
```

Linux package formats and availability depend on the build host and enabled Tauri bundle targets.

## Android

Android development requires Android Studio/JDK, Android SDK Platform, Platform-Tools, Build-Tools, Command-line Tools, an NDK, the Android environment variables, and Rust Android targets.

Initialize the generated Android project on the development machine once:

```bash
npm run tauri:android:init
```

Development:

```bash
npm run tauri:android:dev
```

Build:

```bash
npm run tauri:android:build
```

The native CI workflow also initializes the generated project in the runner and builds an ARM64 debug package. Release AAB/APK signing is intentionally not stored in the repository.

## iOS and iPadOS

iOS tooling is available only on macOS and requires full Xcode. Tauri's mobile prerequisites also include the iOS Rust targets and CocoaPods.

Initialize the generated iOS project on the Mac once:

```bash
npm run tauri:ios:init
```

Development:

```bash
npm run tauri:ios:dev
```

Build:

```bash
npm run tauri:ios:build
```

The native CI workflow initializes the generated iOS project and performs a debug simulator build, selecting the simulator architecture from the macOS runner architecture. Physical-device/App Store builds require the publisher's Apple signing configuration.

## ChromeOS

ChromeOS is supported through the web/PWA distribution. This avoids depending on Linux-container availability and keeps the normal ChromeOS installation path identical to other PWA-capable Chromium environments.

## Native security model

TaskMint uses separate Tauri capability files for desktop and mobile and grants a least-privilege command set:

- core defaults;
- open/save dialogs;
- file metadata (`stat`);
- text file reads/writes scoped through selected dialog paths;
- notifications;
- operating-system URL opening.

The native window uses an explicit Content Security Policy and prototype freezing. Do not broaden filesystem, shell, process, or network permissions merely for convenience.

## Vite mobile development

`vite.config.ts` reads `TAURI_DEV_HOST` when Tauri needs a development server reachable by a physical mobile device. The server keeps a fixed port, configures HMR for that host, ignores `src-tauri` in Vite file watching, and preserves the normal web configuration when Tauri variables are absent.

## CI coverage

`.github/workflows/native.yml` contains:

1. desktop Rust/native checks on Ubuntu, Windows, and macOS;
2. Android project initialization plus an ARM64 debug build on Ubuntu;
3. iOS project initialization plus a simulator debug build on macOS.

The quality, E2E, and native workflows pin the Node/npm pair instead of relying on the npm version bundled by a changing runner image. The existing `ci.yml` continues to run formatting, documentation, secret scanning, lint, TypeScript, tests, web/PWA build, and npm audit.

## Release boundaries

Cross-platform source support does not remove platform-vendor requirements. Public native distribution may require code signing, store accounts, provisioning profiles, certificates, notarization, package metadata, screenshots, and store review. Secrets and signing material belong in protected CI/release configuration, never in Git.

A real npm-generated `package-lock.json` and Cargo-generated `src-tauri/Cargo.lock` should be committed before a reproducible release. Neither lockfile should be fabricated manually.
