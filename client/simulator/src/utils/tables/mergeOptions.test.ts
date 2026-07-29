import { describe, it, expect } from "vitest";
import type { Options } from "tabulator-tables";
import { mergeOptions } from "./mergeOptions";

describe("mergeOptions", () => {
  it("returns a copy of the defaults when there is no override", () => {
    const defaults: Partial<Options> = { layout: "fitColumns", index: "address" };
    const merged = mergeOptions(defaults, undefined);
    expect(merged).toEqual(defaults);
    expect(merged).not.toBe(defaults);
  });

  it("lets the override win on the keys it sets", () => {
    const merged = mergeOptions(
      { layout: "fitColumns", index: "address" },
      { index: "rawName", movableRows: true }
    );
    expect(merged.layout).toBe("fitColumns");
    expect(merged.index).toBe("rawName");
    expect(merged.movableRows).toBe(true);
  });

  it("does not let an undefined override clobber a default", () => {
    const merged = mergeOptions({ index: "address" }, { index: undefined });
    expect(merged.index).toBe("address");
  });

  it("does not mutate the defaults object", () => {
    const defaults: Partial<Options> = { index: "address" };
    mergeOptions(defaults, { index: "rawName" });
    expect(defaults.index).toBe("address");
  });
});
