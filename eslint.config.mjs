// E00-T01: root ESLint flat config. Enforces conventions.md §3/§4 module
// boundaries: apps/api and apps/worker are separate composition roots and
// must never import each other's internals (EARS-E00-2). Do not add a
// plugin/library beyond what "ESLint" + "TypeScript" + "Next.js" already
// imply (see task §2 dependency gate; eslint-config-next and
// typescript-eslint are the frameworks' own official ESLint integrations,
// not a new capability choice).
import tseslint from 'typescript-eslint';
import nextConfig from 'eslint-config-next';

const noWorkerFromApi = {
  files: ['apps/api/**/*.{ts,tsx}'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['**/apps/worker/**', '*worker/src/*', '@garazo/worker*'],
            message:
              'apps/api must not import apps/worker internals — API and worker are separate composition roots (ADR-0002, EARS-E00-2).',
          },
        ],
      },
    ],
  },
};

const noApiFromWorker = {
  files: ['apps/worker/**/*.{ts,tsx}'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['**/apps/api/**', '*api/src/*', '@garazo/api*'],
            message:
              'apps/worker must not import apps/api internals — API and worker are separate composition roots (ADR-0002, EARS-E00-2).',
          },
        ],
      },
    ],
  },
};

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      'apps/mobile/**',
      '**/*.dart',
      'pnpm-lock.yaml',
    ],
  },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.mjs'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['apps/admin/**/*.{ts,tsx}'],
    extends: [...nextConfig],
    // eslint-config-next pulls in eslint-plugin-react, whose React-version
    // AUTODETECTION calls a context API that ESLint 10 removed
    // (`contextOrFilename.getFilename is not a function`). Declaring the version
    // explicitly skips detection entirely, which is also what the plugin
    // recommends for monorepos where React is a transitive dependency.
    settings: { react: { version: '19.2' } },
    rules: {
      // apps/admin is App Router only — there is no pages/ directory to scan,
      // and the rule warns on every run when it cannot find one.
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
  noWorkerFromApi,
  noApiFromWorker,
);
