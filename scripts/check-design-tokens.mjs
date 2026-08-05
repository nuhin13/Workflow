import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderDesignTokens } from './generate-design-tokens.mjs';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = JSON.parse(
  readFileSync(resolve(repositoryRoot, 'workspace/plan/01-design/tokens.json'), 'utf8'),
);
const expected = await renderDesignTokens(source);
const targets = [
  ['packages/design-tokens/src/tokens.ts', expected.typescript],
  ['apps/mobile/lib/core/design/generated/design_tokens.dart', expected.dart],
];

let hasDrift = false;
for (const [path, generated] of targets) {
  const committed = readFileSync(resolve(repositoryRoot, path), 'utf8');
  if (committed !== generated) {
    hasDrift = true;
    console.error(`Design-token drift: ${path}`);
  }
}

if (hasDrift) {
  console.error('Run `corepack pnpm generate:tokens` and commit both generated targets.');
  process.exitCode = 1;
} else {
  console.log('Design-token targets match workspace/plan/01-design/tokens.json.');
}
