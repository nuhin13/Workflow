import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = resolve(repositoryRoot, 'workspace/plan/01-design/tokens.json');
const typescriptTarget = resolve(repositoryRoot, 'packages/design-tokens/src/tokens.ts');
const dartTarget = resolve(
  repositoryRoot,
  'apps/mobile/lib/core/design/generated/design_tokens.dart',
);

function toIdentifier(parts) {
  return parts
    .map((part, index) => {
      const words = part
        .replace(/[^a-zA-Z0-9]+/g, ' ')
        .trim()
        .split(/\s+/);
      const joined = words
        .map((word, wordIndex) => {
          const normalized = /^\d/.test(word) ? `n${word}` : word;
          if (index === 0 && wordIndex === 0) {
            return normalized.charAt(0).toLowerCase() + normalized.slice(1);
          }
          return normalized.charAt(0).toUpperCase() + normalized.slice(1);
        })
        .join('');
      return index === 0 ? joined : joined.charAt(0).toUpperCase() + joined.slice(1);
    })
    .join('');
}

function flattenTokens(value, path = [], result = []) {
  for (const key of Object.keys(value).sort()) {
    const child = value[key];
    const childPath = [...path, key];
    if (child !== null && typeof child === 'object' && !Array.isArray(child)) {
      flattenTokens(child, childPath, result);
    } else {
      result.push([childPath, child]);
    }
  }
  return result;
}

function dartLiteral(value) {
  if (typeof value === 'string') {
    return `'${value.replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  throw new TypeError(`Unsupported design-token value: ${String(value)}`);
}

// The generated TypeScript is checked by `pnpm format` like any other product
// file, so the generator must emit Prettier-canonical output. Otherwise
// `make tokens` and `make format` overwrite each other forever and CI can never
// be green.
export async function renderDesignTokens(source) {
  const tokenGroups = Object.fromEntries(
    Object.entries(source).filter(([key]) => key !== '$schema' && key !== 'meta'),
  );
  const sourceLabel = 'workspace/plan/01-design/tokens.json';
  const rawTypescript = `// GENERATED from ${sourceLabel}. Do not edit by hand.\nexport const designTokens = ${JSON.stringify(
    tokenGroups,
    null,
    2,
  )} as const;\n\nexport type DesignTokens = typeof designTokens;\n`;
  const prettierOptions = await prettier.resolveConfig(typescriptTarget);
  const typescript = await prettier.format(rawTypescript, {
    ...prettierOptions,
    filepath: typescriptTarget,
  });

  const dartFields = flattenTokens(tokenGroups)
    .map(([path, value]) => {
      const type =
        typeof value === 'number' ? (Number.isInteger(value) ? 'int' : 'double') : typeof value;
      const dartType = type === 'boolean' ? 'bool' : type === 'string' ? 'String' : type;
      return `  static const ${dartType} ${toIdentifier(path)} = ${dartLiteral(value)};`;
    })
    .join('\n');
  const dart = `// GENERATED from ${sourceLabel}. Do not edit by hand.\nabstract final class DesignTokens {\n${dartFields}\n}\n`;

  return { typescript, dart };
}

export async function generateDesignTokens() {
  const source = JSON.parse(readFileSync(sourcePath, 'utf8'));
  const targets = await renderDesignTokens(source);
  for (const [target, contents] of [
    [typescriptTarget, targets.typescript],
    [dartTarget, targets.dart],
  ]) {
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, contents, 'utf8');
  }
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await generateDesignTokens();
}
