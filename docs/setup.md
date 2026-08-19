# Setup

## Requirements

- Node.js 22.12 or newer
- npm
- A modern Chromium, Firefox, or WebKit-based browser

## Install

```bash
git clone https://github.com/sanskarIN/taskmint.git
cd taskmint
npm install
npm run dev
```

TaskMint has no required backend, database server, secret, or account.

## Optional PWA testing

Build and serve the production bundle rather than relying on the development server for service-worker behavior:

```bash
npm run build
npm run preview
```

Use the browser's Application/Storage developer tools to inspect the generated manifest, service worker, cache, and IndexedDB database.
