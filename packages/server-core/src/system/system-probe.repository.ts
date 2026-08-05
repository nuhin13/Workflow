// E00-T04 · persistence boundary for the diagnostic probe.
//
// The interface lives in its own file so that consumers depend on the CONTRACT
// and never on the PostgreSQL adapter. That is what lets the use case be tested
// without a database, and what keeps a driver type out of domain code
// (ADR-0004).

export type { SystemProbeRecord, SystemProbeRepository } from './system-probe';
export { SYSTEM_PROBE_KEY } from './system-probe';
