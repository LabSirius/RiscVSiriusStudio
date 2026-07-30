import { describe, it, expect } from "vitest";
import {
  MEMORY_SEARCH_FIELDS,
  PROGRAM_SEARCH_FIELDS,
  matchesMemoryQuery,
} from "./memorySearch";

// A representative memory row: one word split into four little-endian bytes,
// its hex string, and the address label the table sorts on.
const row = {
  address: "1A0",
  value0: "00000001",
  value1: "00000010",
  value2: "11111111",
  value3: "00000000",
  hex: "FF100100",
  // A field outside the frozen list must never be matched.
  segment: "directivesWritableSize",
};

describe("MEMORY_SEARCH_FIELDS", () => {
  it("is the frozen 6-field list in address-first order", () => {
    expect(MEMORY_SEARCH_FIELDS).toEqual([
      "address",
      "value3",
      "value2",
      "value1",
      "value0",
      "hex",
    ]);
  });
});

describe("matchesMemoryQuery", () => {
  it("matches on the address field", () => {
    expect(matchesMemoryQuery(row, "1a0")).toBe(true);
  });

  it("matches on the hex field, case-insensitively", () => {
    expect(matchesMemoryQuery(row, "ff10")).toBe(true);
  });

  it("matches on any byte value field", () => {
    expect(matchesMemoryQuery(row, "11111111")).toBe(true);
  });

  it("is a substring match, not an equality match", () => {
    expect(matchesMemoryQuery(row, "0000000")).toBe(true);
  });

  it("returns false when the query hits no searched field", () => {
    expect(matchesMemoryQuery(row, "zzz")).toBe(false);
  });

  it("never matches fields outside the frozen list", () => {
    // `segment` contains this text but is not a searched field.
    expect(matchesMemoryQuery(row, "directives")).toBe(false);
  });

  it("trims and lowercases the query before matching", () => {
    expect(matchesMemoryQuery(row, "  FF10  ")).toBe(true);
  });

  it("treats a blank query as a non-match (caller clears the filter instead)", () => {
    expect(matchesMemoryQuery(row, "   ")).toBe(false);
  });

  it("tolerates missing fields without throwing", () => {
    expect(matchesMemoryQuery({ address: "4" }, "4")).toBe(true);
    expect(matchesMemoryQuery({}, "4")).toBe(false);
  });
});

// A representative program-memory row: address + hex like data memory, plus the
// plain-text disassembly (`asmText`) and the HTML fields that must stay unsearched.
const programRow = {
  address: "10",
  hex: "00-50-81-93",
  asmText: "addi x1, x0, 5",
  instructionencoding: '<span class="riscv-rd">00001</span>',
  info: '<span class="label">main</span>',
};

describe("PROGRAM_SEARCH_FIELDS", () => {
  it("adds asmText to the address-first list, without value bytes", () => {
    expect(PROGRAM_SEARCH_FIELDS).toEqual(["address", "hex", "asmText"]);
  });
});

describe("matchesMemoryQuery with PROGRAM_SEARCH_FIELDS", () => {
  it("matches the mnemonic in asmText", () => {
    expect(matchesMemoryQuery(programRow, "addi", PROGRAM_SEARCH_FIELDS)).toBe(true);
  });

  it("matches a register operand mid-string", () => {
    expect(matchesMemoryQuery(programRow, "x1", PROGRAM_SEARCH_FIELDS)).toBe(true);
    // The exact spec example: a full register token mid-instruction.
    expect(
      matchesMemoryQuery({ ...programRow, asmText: "add x17, x1, x2" }, "x17", PROGRAM_SEARCH_FIELDS)
    ).toBe(true);
  });

  it("substring-matches: 'add' hits 'addi'", () => {
    expect(matchesMemoryQuery(programRow, "add", PROGRAM_SEARCH_FIELDS)).toBe(true);
  });

  it("still matches address and hex", () => {
    expect(matchesMemoryQuery(programRow, "10", PROGRAM_SEARCH_FIELDS)).toBe(true);
    expect(matchesMemoryQuery(programRow, "81", PROGRAM_SEARCH_FIELDS)).toBe(true);
  });

  it("never searches the HTML encoding or label fields", () => {
    expect(matchesMemoryQuery(programRow, "riscv-rd", PROGRAM_SEARCH_FIELDS)).toBe(false);
    expect(matchesMemoryQuery(programRow, "span", PROGRAM_SEARCH_FIELDS)).toBe(false);
    expect(matchesMemoryQuery(programRow, "main", PROGRAM_SEARCH_FIELDS)).toBe(false);
  });

  it("does not match numeric value-byte queries (no value fields on program rows)", () => {
    expect(matchesMemoryQuery({ ...programRow, value0: "00000101" }, "00000101", PROGRAM_SEARCH_FIELDS)).toBe(
      false
    );
  });
});
