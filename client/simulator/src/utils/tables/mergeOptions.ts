import type { Options } from "tabulator-tables";

/**
 * SimulatorTable owns a base set of Tabulator options (layout, virtual render,
 * the edit relay). Each table adapter varies only a few render knobs —
 * `initialSort` for memory, `groupBy`/`movableRows` for registers, a
 * `rowFormatter` for segment colouring. This merges those per-table overrides
 * over the owned defaults.
 *
 * Pure and shallow by design: the divergent knobs are top-level Tabulator
 * options, and the owned keys (data-sync, edit relay, lifecycle) are applied by
 * the module *after* this merge, so a caller cannot override them through the
 * escape prop. Override wins on every key it sets; `undefined` overrides do not
 * clobber a default.
 */
export const mergeOptions = (
  defaults: Partial<Options>,
  override: Partial<Options> | undefined
): Partial<Options> => {
  if (!override) return { ...defaults };
  const merged: Partial<Options> = { ...defaults };
  for (const key of Object.keys(override) as (keyof Options)[]) {
    if (override[key] !== undefined) {
      merged[key] = override[key];
    }
  }
  return merged;
};
