import { readdir, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const roots = ['src', 'tests', 'e2e', 'bench', 'docs', '.github', 'scripts'];
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
  '.prettierrc.json',
  '.prettierignore',
  '.editorconfig',
  '.gitattributes',
  '.gitignore',
  '.env.example',
  'index.html'
];
const textExtensions = new Set(['.ts', '.tsx', '.js', '.mjs', '.json', '.md', '.yml', '.yaml', '.css', '.html', '.svg']);
const issues = [];

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

function inspect(path, text) {
  if (text.includes('\r')) issues.push(`${path}: use LF line endings`);
  if (text.length > 0 && !text.endsWith('\n')) issues.push(`${path}: add a final newline`);
  text.split('\n').forEach((line, index) => {
    if (/[ \t]+$/.test(line)) issues.push(`${path}:${index + 1}: remove trailing whitespace`);
  });
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
  try {
    inspect(file, await readFile(file, 'utf8'));
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
}

if (issues.length > 0) {
  console.error(`Formatting check failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exitCode = 1;
} else {
  console.log(`Formatting invariants passed for ${new Set(files).size} tracked text paths.`);
}
