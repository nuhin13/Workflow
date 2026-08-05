// E00-T03 · process lifecycle: graceful shutdown and worker readiness.
//
// Containers are stopped constantly — deploys, restarts, rescheduling. A
// process that dies mid-work on SIGTERM turns every routine deploy into a
// chance of a half-written record, which for Garazo means a bill or a due that
// is neither applied nor rolled back.

import { mkdir, rename, writeFile, rm } from 'node:fs/promises';
import { dirname } from 'node:path';

export interface ClosableApplication {
  close(): Promise<void>;
}

/**
 * Fixed container-local path for the worker's readiness marker.
 *
 * The worker exposes no HTTP port — giving it one purely for health checks
 * would mean shipping a listener with no other reason to exist. A file the
 * container healthcheck can stat is the smaller surface.
 */
export const WORKER_READY_MARKER = '/tmp/garazo-worker-ready';

export interface ShutdownOptions {
  /** Injectable for tests; defaults to the real process. */
  readonly signals?: NodeJS.Signals[];
  readonly onShutdown?: (signal: NodeJS.Signals) => void;
  /**
   * Hard limit before the process exits regardless.
   *
   * Container runtimes send SIGKILL roughly 10s after SIGTERM, so a longer
   * grace period here is a lie: the process would be killed mid-cleanup anyway.
   */
  readonly timeoutMs?: number;
  readonly exit?: (code: number) => void;
}

/**
 * Stops accepting work and closes resources on SIGTERM/SIGINT.
 *
 * Deliberately idempotent: orchestrators frequently send SIGTERM and then
 * SIGINT, and running shutdown twice concurrently is how half-closed pools and
 * double-released locks happen.
 */
export function installGracefulShutdown(
  app: ClosableApplication,
  options: ShutdownOptions = {},
): void {
  const signals = options.signals ?? (['SIGTERM', 'SIGINT'] as NodeJS.Signals[]);
  const timeoutMs = options.timeoutMs ?? 8000;
  const exit = options.exit ?? ((code: number) => process.exit(code));

  let shuttingDown = false;

  const shutdown = (signal: NodeJS.Signals): void => {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;
    options.onShutdown?.(signal);

    // unref() so this timer alone never keeps an otherwise-finished process
    // alive; it exists only to bound a hung close().
    const forceTimer = setTimeout(() => exit(1), timeoutMs);
    if (typeof forceTimer.unref === 'function') {
      forceTimer.unref();
    }

    void app
      .close()
      .then(() => {
        clearTimeout(forceTimer);
        exit(0);
      })
      .catch(() => {
        clearTimeout(forceTimer);
        exit(1);
      });
  };

  for (const signal of signals) {
    process.once(signal, () => shutdown(signal));
  }
}

/**
 * Writes the worker readiness marker atomically.
 *
 * Written to a temporary path and renamed, because a healthcheck can stat the
 * file at any instant: a partially written marker would report ready before the
 * worker actually is.
 */
export async function markWorkerReady(path: string = WORKER_READY_MARKER): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const temporaryPath = `${path}.tmp`;
  await writeFile(temporaryPath, 'ready', 'utf8');
  await rename(temporaryPath, path);
}

/** Removes the marker so a shutting-down worker stops reporting ready. */
export async function clearWorkerReady(path: string = WORKER_READY_MARKER): Promise<void> {
  await rm(path, { force: true });
}
