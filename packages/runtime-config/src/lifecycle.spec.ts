// E00-T03 · lifecycle behaviour (EARS-E00-8).

import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import {
  clearWorkerReady,
  installGracefulShutdown,
  markWorkerReady,
  type ClosableApplication,
} from './lifecycle.ts';

function fakeApp(behaviour: () => Promise<void>): ClosableApplication & { closes: number } {
  const app = {
    closes: 0,
    async close(): Promise<void> {
      app.closes += 1;
      await behaviour();
    },
  };
  return app;
}

test('test_EARS_E00_8_shutdown_closes_the_application_once', async () => {
  const app = fakeApp(async () => {});
  const exitCodes: number[] = [];

  installGracefulShutdown(app, {
    signals: [],
    exit: (code) => exitCodes.push(code),
  });

  // Drive the handler directly rather than raising a real signal, which would
  // terminate the test runner itself.
  process.emit('SIGTERM' as NodeJS.Signals);

  const handler = fakeApp(async () => {});
  let exited: number | undefined;
  installGracefulShutdown(handler, {
    signals: ['SIGUSR2'],
    exit: (code) => {
      exited = code;
    },
  });

  process.emit('SIGUSR2' as NodeJS.Signals);
  // Repeated signals are normal during a stop; shutdown must not run twice.
  process.emit('SIGUSR2' as NodeJS.Signals);
  await new Promise((resolve) => setTimeout(resolve, 50));

  assert.equal(handler.closes, 1, 'close() ran more than once');
  assert.equal(exited, 0);
});

test('test_EARS_E00_8_failed_close_exits_nonzero', async () => {
  const app = fakeApp(async () => {
    throw new Error('pool did not drain');
  });
  let exited: number | undefined;

  installGracefulShutdown(app, {
    signals: ['SIGUSR2'],
    exit: (code) => {
      exited = code;
    },
  });

  process.emit('SIGUSR2' as NodeJS.Signals);
  await new Promise((resolve) => setTimeout(resolve, 50));

  assert.equal(exited, 1, 'a failed shutdown must not report success');
});

test('test_EARS_E00_8_hung_close_is_bounded_by_a_timeout', async () => {
  // A close() that never resolves must not hold the container open until the
  // runtime SIGKILLs it.
  const app = fakeApp(() => new Promise<void>(() => {}));
  let exited: number | undefined;

  installGracefulShutdown(app, {
    signals: ['SIGUSR2'],
    timeoutMs: 30,
    exit: (code) => {
      exited = code;
    },
  });

  process.emit('SIGUSR2' as NodeJS.Signals);
  await new Promise((resolve) => setTimeout(resolve, 120));

  assert.equal(exited, 1);
});

test('test_EARS_E00_8_worker_ready_marker_is_written_and_cleared', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'garazo-lifecycle-'));
  const marker = join(directory, 'nested', 'ready');

  try {
    await markWorkerReady(marker);
    assert.ok(existsSync(marker), 'marker was not created');
    assert.equal(await readFile(marker, 'utf8'), 'ready');

    // No temporary file may survive; a healthcheck globbing the directory
    // should not see a half-written marker.
    assert.ok(!existsSync(`${marker}.tmp`));

    await clearWorkerReady(marker);
    assert.ok(!existsSync(marker), 'marker was not cleared on shutdown');

    // Clearing an absent marker must be safe — shutdown can run after a failed
    // startup that never wrote one.
    await clearWorkerReady(marker);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
