import { readdir, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const roots = ['src', 'tests', 'e2e', 'docs', '.github', 'scripts', 'public'];
const rootFiles = [
  'README.md',
  'CONTRIBUTING.md',
  'CODE_OF_CONDUCT.md',
  'SECURITY.md',
  'SUPPORT.md',
  'PRIVACY.md',
  'CHANGELOG.md',
  'ROADMAP.md',
  'what_changed.md',
  'package.json',
  'tsconfig.json',
  'tsconfig.app.json',
  'tsconfig.node.json',
  'vite.config.ts',
  'playwright.config.ts',
  'eslint.config.js',
  'index.html',
  '.env.example',
  '.gitignore'
];
const textExtensions = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.mjs',
  '.json',
  '.md',
  '.yml',
  '.yaml',
  '.css',
  '.html',
  '.svg',
  '.txt'
]);
const patterns = [
  ['private key', /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g],
  ['GitHub classic token', /\bgh[pousr]_[A-Za-z0-9]{30,255}\b/g],
  ['GitHub fine-grained token', /\bgithub_pat_[A-Za-z0-9_]{40,255}\b/g],
  ['AWS access key', /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g],
  ['Google API key', /\bAIza[0-9A-Za-z_-]{35}\b/g],
  ['Slack token', /\bxox[baprs]-[0-9A-Za-z-]{20,}\b/g],
  ['Stripe live key', /\b(?:sk|rk)_live_[0-9A-Za-z]{16,}\b/g],
  ['OpenAI-style secret key', /\bsk-[A-Za-z0-9_-]{32,}\b/g]
];
const findings = [];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (textExtensions.has(extname(entry.name)) || entry.name.startsWith('.')) files.push(path);
  }
  return files;
}

const files = [...rootFiles];
for (const root of roots) {
  try {
    files.push(...await walk(root));
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
}

for (const file of [...new Set(files)].sort()) {
  let text;
  try {
    text = await readFile(file, 'utf8');
  } catch (error) {
    if (error?.code === 'ENOENT') continue;
    throw error;
  }

  for (const [label, pattern] of patterns) {
    pattern.lastIndex = 0;
    for (const match of text.matchAll(pattern)) {
      const offset = match.index ?? 0;
      const line = text.slice(0, offset).split('\n').length;
      findings.push(`${file}:${line}: possible ${label}`);
    }
  }
}

if (findings.length > 0) {
  console.error(`Secret-pattern check failed with ${findings.length} finding(s):`);
  for (const finding of findings) console.error(`- ${finding}`);
  process.exitCode = 1;
} else {
  console.log(`Secret-pattern guard passed for ${new Set(files).size} tracked text paths.`);
}
