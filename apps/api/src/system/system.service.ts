// E00-T02 · system service. Transport-free logic for liveness, readiness and
// the gated probe.

import { Inject, Injectable, Optional } from '@nestjs/common';

/**
 * Dependency readiness, injected rather than imported.
 *
 * T04 binds the PostgreSQL implementation. Keeping it a port means T02 can ship
 * and be tested with no database at all, and means the API never learns which
 * datastore it is talking to.
 */
export interface ReadinessCheck {
  isDatabaseReachable(): Promise<boolean>;
}

export const READINESS_CHECK = Symbol('READINESS_CHECK');

/**
 * The gated persistence probe, injected by T04.
 *
 * Absent in T02: the route exists at the transport layer but reports
 * unavailable until an implementation is bound.
 */
export interface WalkingSkeletonProbe {
  recordVisit(): Promise<number>;
}

export const WALKING_SKELETON_PROBE = Symbol('WALKING_SKELETON_PROBE');

export interface LiveResult {
  readonly live: true;
}

export interface ReadinessResult {
  readonly ready: boolean;
  readonly database: 'up' | 'down';
}

@Injectable()
export class SystemService {
  constructor(
    @Optional() @Inject(READINESS_CHECK) private readonly readinessCheck?: ReadinessCheck,
    @Optional() @Inject(WALKING_SKELETON_PROBE) private readonly probe?: WalkingSkeletonProbe,
  ) {}

  /** Process-local. Makes no downstream call by design. */
  isLive(): LiveResult {
    return { live: true };
  }

  /**
   * Reports coarse dependency state.
   *
   * A thrown check counts as `down`, never as an error escaping to the client:
   * a readiness endpoint that 500s with a driver message is a disclosure bug.
   * With no check bound yet, the answer is `down` — claiming ready without
   * having asked anything would be a lie.
   */
  async isReady(): Promise<ReadinessResult> {
    if (this.readinessCheck === undefined) {
      return { ready: false, database: 'down' };
    }

    try {
      const reachable = await this.readinessCheck.isDatabaseReachable();
      return { ready: reachable, database: reachable ? 'up' : 'down' };
    } catch {
      return { ready: false, database: 'down' };
    }
  }

  /** True once T04 binds a probe implementation. */
  hasProbe(): boolean {
    return this.probe !== undefined;
  }

  /**
   * Records one probe visit and returns the running total.
   *
   * Throws when no implementation is bound; the controller turns that into the
   * contract's 503, so an unbound probe is never mistaken for a successful
   * round trip.
   */
  async recordWalkingSkeletonVisit(): Promise<number> {
    if (this.probe === undefined) {
      throw new Error('walking-skeleton probe is not bound');
    }
    return this.probe.recordVisit();
  }
}
