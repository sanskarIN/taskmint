import { readdir, stat, readFile } from 'node:fs/promises';
import { dirname, extname, join, normalize, resolve, sep } from 'node:path';

const roots = ['docs', '.github'];
const rootMarkdown = [
  'README.md',
  'CONTRIBUTING.md',
  'CODE_OF_CONDUCT.md',
  'SECURITY.md',
  'SUPPORT.md',
  'PRIVACY.md',
  'CHANGELOG.md',
  'ROADMAP.md',
  'what_changed.md'
];
const repositoryRoot = resolve('.');
const issues = [];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (extname(entry.name).toLowerCase() === '.md') files.push(path);
  }
  return files;
}

function stripCodeFences(text) {
  return text.replace(/```[\s\S]*?```/g, '');
}

function normalizeTarget(raw) {
  const target = raw.trim().replace(/^<|>$/g, '');
  if (!target || target.startsWith('#')) return null;
  if (/^(?:https?:|mailto:|tel:|data:)/i.test(target)) return null;
  const withoutTitle = target.replace(/\s+["'][^"']*["']\s*$/, '');
  return decodeURIComponent(withoutTitle.split('#', 1)[0] ?? '');
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if (error?.code === 'ENOENT') return false;
    throw error;
  }
}

const markdownFiles = [...rootMarkdown];
for (const root of roots) {
  try {
    markdownFiles.push(...await walk(root));
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
}

for (const file of [...new Set(markdownFiles)].sort()) {
  const text = stripCodeFences(await readFile(file, 'utf8'));
  const pattern = /!?\[[^\]]*\]\(([^)]+)\)/g;
  for (const match of text.matchAll(pattern)) {
    const rawTarget = match[1];
    if (!rawTarget) continue;
    let target;
    try {
      target = normalizeTarget(rawTarget);
    } catch {
      issues.push(`${file}: invalid percent-encoding in link target ${rawTarget}`);
      continue;
    }
    if (!target) continue;

    const candidate = resolve(dirname(file), normalize(target));
    if (candidate !== repositoryRoot && !candidate.startsWith(`${repositoryRoot}${sep}`)) {
      issues.push(`${file}: relative link escapes repository: ${target}`);
      continue;
    }
    if (!(await exists(candidate))) issues.push(`${file}: missing relative link target: ${target}`);
  }
}

if (issues.length > 0) {
  console.error(`Documentation link check failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exitCode = 1;
} else {
  console.log(`Documentation links passed for ${new Set(markdownFiles).size} Markdown files.`);
}
