import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile } from 'node:fs/promises';

const execFileAsync = promisify(execFile);
const repositoryReferencePath = 'docs/repository-reference.md';
const testMatrixPath = 'docs/test-matrix.md';

const [{ stdout }, repositoryReference, testMatrix] = await Promise.all([
  execFileAsync('git', ['ls-files', '-z'], { encoding: 'utf8' }),
  readFile(repositoryReferencePath, 'utf8'),
  readFile(testMatrixPath, 'utf8')
]);

const trackedFiles = stdout
  .split('\0')
  .map((path) => path.trim())
  .filter(Boolean)
  .sort();

const missingFromRepositoryReference = trackedFiles.filter(
  (path) => !repositoryReference.includes(`\`${path}\``)
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
if (missingFromRepositoryReference.length > 0) {
  issues.push(
    `${repositoryReferencePath} is missing ${missingFromRepositoryReference.length} tracked path(s):\n${missingFromRepositoryReference.map((path) => `  - ${path}`).join('\n')}`
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
