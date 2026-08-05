import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@garazo/design-tokens'],
  // Emits a self-contained server with only the traced runtime files, so the
  // admin image carries no pnpm store and no dev dependencies. Required by
  // apps/admin/Dockerfile (E00-T03).
  output: 'standalone',
  // The workspace root, not apps/admin — otherwise tracing misses the shared
  // packages and the standalone bundle is broken at runtime rather than at
  // build time.
  outputFileTracingRoot: new URL('../../', import.meta.url).pathname,
};

export default nextConfig;
