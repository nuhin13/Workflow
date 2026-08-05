/**
 * Module boundary marker (E00-T01).
 *
 * `conventions.md` §2/§4 requires every domain module to export a narrow,
 * immutable public interface and forbids composition roots (apps/api,
 * apps/worker) from reaching into a module's private internals. This file
 * gives architecture checks and composition roots a stable, provider-neutral
 * value to depend on instead of a private module path.
 *
 * This is a structural marker only — it carries no product/business state
 * (no workshop, job, billing, or auth data). Owning modules are added by
 * later approved tasks.
 */

/** An immutable, public declaration that a module exists and is registered. */
export interface ModuleBoundary {
  /** Stable owning-module name, e.g. "server-core-root". Not a product state. */
  readonly name: string;
}

/**
 * Register a module's public boundary marker.
 *
 * @param name stable owning-module name; not a product state.
 * @returns an immutable `ModuleBoundary` value.
 */
export function registerModuleBoundary(name: string): ModuleBoundary {
  if (!name || name.trim().length === 0) {
    throw new Error('registerModuleBoundary requires a non-empty module name');
  }
  return Object.freeze({
    name,
  });
}
