import { access, readFile } from 'node:fs/promises';

const tag = process.argv[2] ?? process.env.TASKMINT_RELEASE_TAG ?? '';
const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
const version = typeof packageJson.version === 'string' ? packageJson.version : '';
const expectedTag = version ? `v${version}` : '';
const issues = [];

if (!version) issues.push('package.json must contain a non-empty version.');
if (!tag) issues.push('Provide the release tag, for example: node scripts/check-release.mjs v0.1.0');
else if (expectedTag && tag !== expectedTag) {
  issues.push(`Release tag ${tag} does not match package version ${version}; expected ${expectedTag}.`);
}

try {
  await access('package-lock.json');
} catch {
  issues.push('package-lock.json is required for a reproducible release. Generate it with npm and commit it before tagging.');
}

if (issues.length > 0) {
  console.error(`Release readiness check failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exitCode = 1;
} else {
  console.log(`Release readiness passed for ${tag} with committed package-lock.json.`);
}
