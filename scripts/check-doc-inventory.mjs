import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile } from 'node:fs/promises';

const execFileAsync = promisify(execFile);
const fileIndexPath = 'docs/file-index.md';
const repositoryReferencePath = 'docs/repository-reference.md';
const testMatrixPath = 'docs/test-matrix.md';

const [{ stdout }, fileIndex, repositoryReference, testMatrix] = await Promise.all([
  execFileAsync('git', ['ls-files', '-z'], { encoding: 'utf8' }),
  readFile(fileIndexPath, 'utf8'),
  readFile(repositoryReferencePath, 'utf8'),
  readFile(testMatrixPath, 'utf8')
]);

const trackedFiles = stdout
  .split('\0')
  .map((path) => path.trim())
  .filter(Boolean)
  .sort();

const missingFromFileIndex = trackedFiles.filter((path) => !fileIndex.includes(`\`${path}\``));

const requiredReferenceSections = [
  '# 1. Root repository files',
  '# 2. GitHub repository automation',
  '# 3. Benchmark',
  '# 4. Public assets',
  '# 5. Application source',
  '# 6. React components',
  '# 7. Domain',
  '# 8. Localization',
  '# 9. Persistence',
  '# 10. Utilities',
  '# 12. Unit/component/config tests',
  '# 13. End-to-end browser tests',
  '# 14. Maintenance scripts',
  '# 15. Documentation'
];
const missingReferenceSections = requiredReferenceSections.filter(
  (heading) => !repositoryReference.includes(heading)
);

const testFiles = trackedFiles.filter(
  (path) =>
    path.startsWith('tests/') ||
    path.startsWith('e2e/') ||
    path.startsWith('bench/') ||
    path === 'src/test/setup.ts'
);
const missingFromTestMatrix = testFiles.filter((path) => !testMatrix.includes(`\`${path}\``));

const issues = [];
if (missingFromFileIndex.length > 0) {
  issues.push(
    `${fileIndexPath} is missing ${missingFromFileIndex.length} tracked path(s):\n${missingFromFileIndex.map((path) => `  - ${path}`).join('\n')}`
  );
}
if (missingReferenceSections.length > 0) {
  issues.push(
    `${repositoryReferencePath} is missing ${missingReferenceSections.length} required section(s):\n${missingReferenceSections.map((heading) => `  - ${heading}`).join('\n')}`
  );
}
if (missingFromTestMatrix.length > 0) {
  issues.push(
    `${testMatrixPath} is missing ${missingFromTestMatrix.length} test/benchmark path(s):\n${missingFromTestMatrix.map((path) => `  - ${path}`).join('\n')}`
  );
}

if (issues.length > 0) {
  console.error(`Documentation inventory check failed with ${issues.length} issue group(s):`);
  for (const issue of issues) console.error(`\n${issue}`);
  process.exitCode = 1;
} else {
  console.log(
    `Documentation inventory passed for ${trackedFiles.length} tracked files and ${testFiles.length} test/benchmark files.`
  );
}
