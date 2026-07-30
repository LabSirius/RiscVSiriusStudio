import { describe, it, expect } from "vitest";
import { exportProgramMemoryHex, exportProgramMemoryMif } from "./programMemoryExport";

// Bytes are little-endian within a word (word[0] = LSB); export assembles the
// word high byte first (word[3]..word[0]), matching the memory table view.
const B = (n: number) => n.toString(2).padStart(8, "0");
const word = (b0: number, b1: number, b2: number, b3: number) => [B(b0), B(b1), B(b2), B(b3)];

// Two words: 0x00000013 (addi) at PC 0, 0x40020133 at PC 4.
const program = [...word(0x13, 0x00, 0x00, 0x00), ...word(0x33, 0x01, 0x02, 0x40)];

describe("exportProgramMemoryHex", () => {
  it("emits one uppercase, zero-padded hex byte per line, high byte first", () => {
    expect(exportProgramMemoryHex(program)).toBe(["00", "00", "00", "13", "40", "02", "01", "33"].join("\n"));
  });

  it("treats missing bytes as 00", () => {
    // A word with a hole: only byte 0 present.
    expect(exportProgramMemoryHex([B(0xab)])).toBe(["00", "00", "00", "AB"].join("\n"));
  });

  it("returns an empty string for empty program", () => {
    expect(exportProgramMemoryHex([])).toBe("");
  });
});

describe("exportProgramMemoryMif", () => {
  it("writes a WIDTH=32 header, min DEPTH 256, and word rows with PC + asm comments", () => {
    const mif = exportProgramMemoryMif(program, ["addi x2, x0, 0", "add x2, x2, x2"]);
    expect(mif).toBe(
      `-- RISC-V dataMemoryTable.program memory (word addressed)
WIDTH=32;
DEPTH=256;
ADDRESS_RADIX=UNS;
DATA_RADIX=HEX;
CONTENT BEGIN
\t0 : 00000013; -- (PC 0x00000000) addi x2, x0, 0
\t1 : 40020133; -- (PC 0x00000004) add x2, x2, x2
END;`
    );
  });

  it("omits the comment when no asm annotation exists for a word", () => {
    const mif = exportProgramMemoryMif(program, []);
    expect(mif).toContain("\t0 : 00000013;\n");
    expect(mif).toContain("\t1 : 40020133;");
    expect(mif).not.toContain("PC 0x");
  });

  it("defaults asmList to empty when omitted", () => {
    expect(exportProgramMemoryMif(program)).toContain("\t0 : 00000013;");
  });
});
