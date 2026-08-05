// E00-T04 · coordinate one diagnostic round trip.

import type { RequestContext } from '../access/access-context';
import type { SystemProbeRepository, SystemProbeResult } from './system-probe';

/**
 * Runs the probe and validates what came back.
 *
 * The validation is the substance of this class. Persisting is the repository's
 * job; making sure a "success" actually means something is this one's. A
 * skeleton that reports persisted without a real, representable count would
 * make every downstream verification worthless.
 */
export class RunSystemProbeUseCase {
  // Declared explicitly rather than as a constructor parameter property: Node's
  // type stripping runs these specs directly and does not support that syntax.
  private readonly repository: SystemProbeRepository;

  constructor(repository: SystemProbeRepository) {
    this.repository = repository;
  }

  async execute(context: RequestContext): Promise<SystemProbeResult> {
    const record = await this.repository.increment();

    if (!Number.isInteger(record.visitCount) || record.visitCount < 1) {
      throw new Error(
        `system probe returned a non-positive visit count; the upsert did not persist`,
      );
    }

    // PostgreSQL bigint outgrows the range JavaScript and JSON represent
    // exactly. Past 2^53 the number on the wire would silently stop matching
    // the number in the database.
    if (!Number.isSafeInteger(record.visitCount)) {
      throw new Error('system probe visit count exceeds the safe integer range');
    }

    return {
      status: 'persisted',
      visitCount: record.visitCount,
      correlationId: context.correlationId,
    };
  }
}
