import { describe, it, expect } from "vitest";
import {
  buildAvailableRows,
  withLabels,
  writeRowBytes,
  rowHex,
  touchedFields,
  INFO_PLACEHOLDER,
  AvailableRow,
} from "./availableRows";

// Two words: bytes are little-endian within a word (value0 = LSB).
const word = (b0: string, b1: string, b2: string, b3: string) => [b0, b1, b2, b3];
const B = (n: number) => n.toString(2).padStart(8, "0");

describe("buildAvailableRows", () => {
  const memory = [...word(B(0xde), B(0xad), B(0xbe), B(0xef)), ...word(B(1), B(0), B(0), B(0))];

  it("chunks bytes into word rows with hex address and HEX column", () => {
    const rows = buildAvailableRows(memory, 0, 0);
    expect(rows.map((r) => r.address)).toEqual(["0", "4"]);
    // HEX is high-byte-first: value3-value2-value1-value0.
    expect(rows[0].hex).toBe("EF-BE-AD-DE");
    expect(rows[0].value0).toBe(B(0xde));
  });

  it("classifies read-only, writable, and free segments by size", () => {
    // readOnlySize 4 → word 0 is read-only; writableSize 4 → word 1 writable.
    const rows = buildAvailableRows(memory, 4, 4);
    expect(rows[0].segment).toBe("directivesReadOnlySize");
    expect(rows[1].segment).toBe("directivesWritableSize");
  });

  it("falls back to free memory past the directive sizes", () => {
    expect(buildAvailableRows(memory, 0, 0)[0].segment).toBe("memory");
  });
});

describe("withLabels", () => {
  const base = buildAvailableRows([...Array(12).fill(B(0))], 0, 0); // addresses 0,4,8

  it("labels SP and Heap rows and blanks the rest", () => {
    const labelled = withLabels(base, "8", "0");
    expect(labelled.find((r) => r.address === "0")?.info).toContain("SP");
    expect(labelled.find((r) => r.address === "8")?.info).toContain("Heap");
    expect(labelled.find((r) => r.address === "4")?.info).toBe(INFO_PLACEHOLDER);
  });

  it("moving SP clears the previous SP label (recompute from scratch)", () => {
    const first = withLabels(base, "8", "0");
    const moved = withLabels(base, "8", "4");
    expect(first.find((r) => r.address === "0")?.info).toContain("SP");
    // After the move, address 0 no longer carries SP.
    expect(moved.find((r) => r.address === "0")?.info).toBe(INFO_PLACEHOLDER);
    expect(moved.find((r) => r.address === "4")?.info).toContain("SP");
  });

  it("SP wins over Heap on the same row", () => {
    const labelled = withLabels(base, "8", "8");
    expect(labelled.find((r) => r.address === "8")?.info).toContain("SP");
  });

  it("appends a Heap row when its address is beyond memory", () => {
    const labelled = withLabels(base, "100", "0");
    expect(labelled.some((r) => r.address === "100")).toBe(true);
  });
});

describe("writeRowBytes", () => {
  const row: AvailableRow = {
    address: "0",
    value0: B(0),
    value1: B(0),
    value2: B(0),
    value3: B(0),
    hex: "00-00-00-00",
    info: "",
    segment: "memory",
  };
  const v32 = B(0x12) + B(0x34) + B(0x56) + B(0x78); // MSB..LSB

  it("writes one byte into value0 (LSB)", () => {
    const w = writeRowBytes(row, 1, v32);
    expect(w.value0).toBe(B(0x78));
    expect(w.value1).toBe(B(0));
    expect(w.hex).toBe("00-00-00-78");
  });

  it("writes two bytes into value0/value1", () => {
    const w = writeRowBytes(row, 2, v32);
    expect(w.value0).toBe(B(0x78));
    expect(w.value1).toBe(B(0x56));
    expect(w.hex).toBe("00-00-56-78");
  });

  it("writes four bytes across the word", () => {
    const w = writeRowBytes(row, 4, v32);
    expect(w.hex).toBe("12-34-56-78");
    expect(w.value3).toBe(B(0x12));
  });

  it("does not mutate the input row", () => {
    writeRowBytes(row, 4, v32);
    expect(row.hex).toBe("00-00-00-00");
  });
});

describe("rowHex / touchedFields", () => {
  it("rowHex is high-byte-first", () => {
    expect(rowHex(B(1), B(2), B(3), B(4))).toBe("04-03-02-01");
  });
  it("touchedFields covers LSB-first the bytes a write of leng touches", () => {
    expect(touchedFields(1)).toEqual(["value0"]);
    expect(touchedFields(2)).toEqual(["value0", "value1"]);
    expect(touchedFields(4)).toEqual(["value0", "value1", "value2", "value3"]);
  });
});
