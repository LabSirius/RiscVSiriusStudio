import { describe, it, expect } from "vitest";
import { buildProgramRows, colorizeInstruction } from "./programRows";
import { INFO_PLACEHOLDER } from "./availableRows";

// Bytes are little-endian within a word (word[0] = LSB); the encoding is
// assembled high byte first (word[3]..word[0]).
const B = (n: number) => n.toString(2).padStart(8, "0");
const word = (b0: number, b1: number, b2: number, b3: number) => [B(b0), B(b1), B(b2), B(b3)];

describe("colorizeInstruction", () => {
  it("splits an R-TYPE word into six tagged riscv-segment spans", () => {
    const html = colorizeInstruction("0".repeat(32), "R-TYPE");
    expect((html.match(/riscv-segment/g) ?? []).length).toBe(6);
    expect(html).toContain('data-tooltip="funct7"');
    expect(html).toContain('data-tooltip="opcode"');
    expect(html).toContain("riscv-funct7");
  });

  it("emits five fields for I-TYPE with the imm[11:0] tooltip", () => {
    const html = colorizeInstruction("1".repeat(32), "I-TYPE");
    expect((html.match(/riscv-segment/g) ?? []).length).toBe(5);
    expect(html).toContain('data-tooltip="imm[11:0]"');
  });

  it("falls back to space-grouped 4-bit nibbles for an unknown type", () => {
    expect(colorizeInstruction("1111000011110000" + "1111000011110000", "UNKNOWN")).toBe(
      "1111 0000 1111 0000 1111 0000 1111 0000"
    );
  });

  it("returns the input untouched when not exactly 32 bits", () => {
    expect(colorizeInstruction("101", "R-TYPE")).toBe("101");
  });
});

describe("buildProgramRows", () => {
  // Two instruction words at addresses 0 and 4.
  const program = [...word(0x13, 0x00, 0x00, 0x00), ...word(0x33, 0x01, 0x02, 0x40)];
  const types = [{ type: "i" }, { type: "r" }];

  it("chunks words into program rows with hex address, HEX column, and coloured encoding", () => {
    const rows = buildProgramRows(program, {}, types);
    expect(rows.map((r) => r.address)).toEqual(["0", "4"]);
    expect(rows.every((r) => r.segment === "program")).toBe(true);
    // HEX is high-byte-first: word[3]-word[2]-word[1]-word[0].
    expect(rows[0].hex).toBe("00-00-00-13");
    expect(rows[1].hex).toBe("40-02-01-33");
    // Type drives the field split: I-TYPE → 5 spans, R-TYPE → 6.
    expect((rows[0].instructionencoding.match(/riscv-segment/g) ?? []).length).toBe(5);
    expect((rows[1].instructionencoding.match(/riscv-segment/g) ?? []).length).toBe(6);
  });

  it("labels a symbol on its existing program row, keeping that row's segment", () => {
    const rows = buildProgramRows(program, { main: { memdef: 4, name: "main" } }, types);
    const labelled = rows.find((r) => r.address === "4");
    expect(labelled?.info).toContain("main");
    expect(labelled?.segment).toBe("program");
  });

  it("appends a blank segment-less row for a symbol past the program", () => {
    const rows = buildProgramRows(program, { end: { memdef: 8, name: "end" } }, types);
    const appended = rows.find((r) => r.address === "8");
    expect(appended).toBeDefined();
    expect(appended?.segment).toBe("");
    expect(appended?.info).toContain("end");
    expect(appended?.instructionencoding).toBe("0000 0000 0000 0000 0000 0000 0000 0000");
  });

  it("fills unlabelled rows with the invisible info placeholder", () => {
    const rows = buildProgramRows(program, { main: { memdef: 0, name: "main" } }, types);
    expect(rows.find((r) => r.address === "0")?.info).toContain("main");
    expect(rows.find((r) => r.address === "4")?.info).toBe(INFO_PLACEHOLDER);
  });

  it("falls back to spaced bits when the type for an index is missing", () => {
    // Only one type provided; the second word has no matching entry.
    const rows = buildProgramRows(program, {}, [{ type: "i" }]);
    expect(rows[1].instructionencoding).not.toContain("riscv-segment");
    expect(rows[1].instructionencoding).toMatch(/^(\d{4} ){7}\d{4}$/);
  });
});
