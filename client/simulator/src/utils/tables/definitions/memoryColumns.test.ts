import { describe, it, expect } from "vitest";
import type { MutableRefObject } from "react";
import type { ColumnDefinition } from "tabulator-tables";
import { buildMemoryColumns } from "./memoryColumns";

// Pure internal seam of SimulatorTable: the one parameterized memory-column
// builder that the three near-duplicate builders collapsed into. Node-only,
// no DOM — we assert the column *shape* (fields, visibility, widths), never
// invoke the DOM formatters.

const stepRef = (v: boolean): MutableRefObject<boolean> => ({ current: v });

const fields = (cols: ColumnDefinition[]) => cols.map((c) => c.field);
const byField = (cols: ColumnDefinition[], field: string) =>
  cols.find((c) => c.field === field);

describe("buildMemoryColumns", () => {
  it("bin mode shows the four byte columns", () => {
    const cols = buildMemoryColumns("bin", stepRef(false));
    expect(fields(cols)).toEqual([
      "index",
      "info",
      "address",
      "value3",
      "value2",
      "value1",
      "value0",
      "hex",
    ]);
    for (const f of ["value0", "value1", "value2", "value3"]) {
      expect(byField(cols, f)?.visible).toBe(true);
    }
  });

  it("hex mode carries the same byte columns but hidden", () => {
    const cols = buildMemoryColumns("hex", stepRef(false));
    // Same field set as bin — only visibility differs, so the bin↔hex toggle is
    // a visibility change on one instance, not a swap between two components.
    expect(fields(cols)).toEqual(fields(buildMemoryColumns("bin", stepRef(false))));
    for (const f of ["value0", "value1", "value2", "value3"]) {
      expect(byField(cols, f)?.visible).toBe(false);
    }
  });

  it("program mode replaces the bytes with one instruction-encoding column", () => {
    const cols = buildMemoryColumns("program", stepRef(false));
    expect(fields(cols)).toEqual([
      "index",
      "info",
      "address",
      "instructionencoding",
      "hex",
    ]);
    expect(byField(cols, "instructionencoding")?.hozAlign).toBe("right");
  });

  it("shares the frame — index hidden, address sortable, fixed widths", () => {
    for (const mode of ["bin", "hex", "program"] as const) {
      const cols = buildMemoryColumns(mode, stepRef(false));
      expect(byField(cols, "index")?.visible).toBe(false);
      expect(byField(cols, "address")?.headerSort).toBe(true);
      expect(byField(cols, "address")?.width).toBe(75);
      expect(byField(cols, "info")?.width).toBe(60);
      expect(byField(cols, "hex")?.width).toBe(110);
    }
  });

  it("editability follows the first-step flag and the code segment", () => {
    // isFirstStep = true → nothing editable regardless of segment.
    const frozen = buildMemoryColumns("bin", stepRef(true));
    const editableOf = (cols: ColumnDefinition[], field: string) => {
      const col = byField(cols, field);
      const editable = col?.editable as
        | ((cell: { getRow(): { getData(): { segment: string } } }) => boolean)
        | undefined;
      return (segment: string) =>
        editable?.({ getRow: () => ({ getData: () => ({ segment }) }) } as never);
    };
    expect(editableOf(frozen, "value0")("memory")).toBe(false);

    // isFirstStep = false → writable RAM editable, code segments not.
    const live = buildMemoryColumns("bin", stepRef(false));
    expect(editableOf(live, "value0")("memory")).toBe(true);
    expect(editableOf(live, "value0")("program")).toBe(false);
    expect(editableOf(live, "value0")("directivesReadOnlySize")).toBe(false);
  });
});
