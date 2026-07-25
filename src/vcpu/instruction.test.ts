import { describe, it, expect } from "vitest";
import {
  DecodedInstruction,
  type MemoryAccess,
  type RawInstructionNode,
} from "./instruction";

/**
 * Builds a minimal Raw IR node with just the fields DecodedInstruction reads.
 * Mirrors the shape the assembler emits (`riscvc.ts`) without pulling the
 * whole pipeline in.
 */
function node(
  partial: Partial<RawInstructionNode> & {
    type: string;
    opcode: string;
    instruction: string;
  }
): RawInstructionNode {
  return {
    rs1: { regeq: "x1" },
    rs2: { regeq: "x2" },
    rd: { regeq: "x3" },
    encoding: {},
    ...partial,
  };
}

/** The full fact row asserted for each representative instruction. */
interface FactRow {
  type: string;
  usesRs1: boolean;
  usesRs2: boolean;
  usesRd: boolean;
  usesFunct3: boolean;
  usesFunct7: boolean;
  usesALU: boolean;
  usesImmediate: boolean;
  usesDM: boolean;
  readsMemory: boolean;
  writesMemory: boolean;
  writesRegister: boolean;
  branchesOrJumps: boolean;
  storesNextPC: boolean;
  storesALU: boolean;
  storesMemRead: boolean;
  isIArithmetic: boolean;
  isILoad: boolean;
  isIJump: boolean;
  isIExt: boolean;
  isLUI: boolean;
  isAUIPC: boolean;
  memoryAccess: MemoryAccess | null;
}

function factsOf(d: DecodedInstruction): FactRow {
  return {
    type: d.type(),
    usesRs1: d.usesRs1(),
    usesRs2: d.usesRs2(),
    usesRd: d.usesRd(),
    usesFunct3: d.usesFunct3(),
    usesFunct7: d.usesFunct7(),
    usesALU: d.usesALU(),
    usesImmediate: d.usesImmediate(),
    usesDM: d.usesDM(),
    readsMemory: d.readsMemory(),
    writesMemory: d.writesMemory(),
    writesRegister: d.writesRegister(),
    branchesOrJumps: d.branchesOrJumps(),
    storesNextPC: d.storesNextPC(),
    storesALU: d.storesALU(),
    storesMemRead: d.storesMemRead(),
    isIArithmetic: d.isIArithmetic(),
    isILoad: d.isILoad(),
    isIJump: d.isIJump(),
    isIExt: d.isIExt(),
    isLUI: d.isLUI(),
    isAUIPC: d.isAUIPC(),
    memoryAccess: d.memoryAccess(),
  };
}

/** Every field defaults to false/null; each case overrides only what is true. */
function row(overrides: Partial<FactRow> & { type: string }): FactRow {
  return {
    usesRs1: false,
    usesRs2: false,
    usesRd: false,
    usesFunct3: false,
    usesFunct7: false,
    usesALU: false,
    usesImmediate: false,
    usesDM: false,
    readsMemory: false,
    writesMemory: false,
    writesRegister: false,
    branchesOrJumps: false,
    storesNextPC: false,
    storesALU: false,
    storesMemRead: false,
    isIArithmetic: false,
    isILoad: false,
    isIJump: false,
    isIExt: false,
    isLUI: false,
    isAUIPC: false,
    memoryAccess: null,
    ...overrides,
  };
}

interface Case {
  name: string;
  node: RawInstructionNode;
  expected: FactRow;
}

const cases: Case[] = [
  {
    name: "add",
    node: node({ type: "R", opcode: "0110011", instruction: "add", encoding: { funct3: "000", funct7: "0000000" } }),
    expected: row({
      type: "R",
      usesRs1: true, usesRs2: true, usesRd: true,
      usesFunct3: true, usesFunct7: true,
      usesALU: true,
      writesRegister: true, storesALU: true,
    }),
  },
  {
    name: "addi",
    node: node({ type: "I", opcode: "0010011", instruction: "addi", encoding: { funct3: "000" } }),
    expected: row({
      type: "I",
      usesRs1: true, usesRd: true, usesFunct3: true,
      usesALU: true, usesImmediate: true,
      writesRegister: true, storesALU: true,
      isIArithmetic: true,
    }),
  },
  {
    name: "lw",
    node: node({ type: "I", opcode: "0000011", instruction: "lw", encoding: { funct3: "010" } }),
    expected: row({
      type: "I",
      usesRs1: true, usesRd: true, usesFunct3: true,
      usesALU: true, usesImmediate: true, usesDM: true,
      readsMemory: true, writesRegister: true, storesMemRead: true,
      isILoad: true,
      memoryAccess: { bytes: 4, signed: true },
    }),
  },
  {
    name: "lb",
    node: node({ type: "I", opcode: "0000011", instruction: "lb", encoding: { funct3: "000" } }),
    expected: row({
      type: "I",
      usesRs1: true, usesRd: true, usesFunct3: true,
      usesALU: true, usesImmediate: true, usesDM: true,
      readsMemory: true, writesRegister: true, storesMemRead: true,
      isILoad: true,
      memoryAccess: { bytes: 1, signed: true },
    }),
  },
  {
    name: "lbu",
    node: node({ type: "I", opcode: "0000011", instruction: "lbu", encoding: { funct3: "100" } }),
    expected: row({
      type: "I",
      usesRs1: true, usesRd: true, usesFunct3: true,
      usesALU: true, usesImmediate: true, usesDM: true,
      readsMemory: true, writesRegister: true, storesMemRead: true,
      isILoad: true,
      memoryAccess: { bytes: 1, signed: false },
    }),
  },
  {
    name: "sw",
    node: node({ type: "S", opcode: "0100011", instruction: "sw", encoding: { funct3: "010" } }),
    expected: row({
      type: "S",
      usesRs1: true, usesRs2: true, usesFunct3: true,
      usesImmediate: true, usesDM: true,
      writesMemory: true,
      memoryAccess: { bytes: 4, signed: false },
    }),
  },
  {
    name: "sb",
    node: node({ type: "S", opcode: "0100011", instruction: "sb", encoding: { funct3: "000" } }),
    expected: row({
      type: "S",
      usesRs1: true, usesRs2: true, usesFunct3: true,
      usesImmediate: true, usesDM: true,
      writesMemory: true,
      memoryAccess: { bytes: 1, signed: false },
    }),
  },
  {
    name: "beq",
    node: node({ type: "B", opcode: "1100011", instruction: "beq", encoding: { funct3: "000" } }),
    expected: row({
      type: "B",
      usesRs1: true, usesRs2: true, usesFunct3: true,
      usesImmediate: true,
      branchesOrJumps: true,
    }),
  },
  {
    name: "jal",
    node: node({ type: "J", opcode: "1101111", instruction: "jal", encoding: {} }),
    expected: row({
      type: "J",
      usesRd: true,
      usesImmediate: true,
      writesRegister: true, branchesOrJumps: true, storesNextPC: true,
    }),
  },
  {
    name: "jalr",
    node: node({ type: "I", opcode: "1100111", instruction: "jalr", encoding: { funct3: "000" } }),
    expected: row({
      type: "I",
      usesRs1: true, usesRd: true, usesFunct3: true,
      usesALU: true, usesImmediate: true,
      writesRegister: true, branchesOrJumps: true, storesNextPC: true,
      isIJump: true,
    }),
  },
  {
    name: "lui",
    node: node({ type: "U", opcode: "0110111", instruction: "lui", encoding: {} }),
    expected: row({
      type: "U",
      usesRd: true,
      usesImmediate: true,
      writesRegister: true, storesALU: true,
      isLUI: true,
    }),
  },
  {
    name: "auipc",
    node: node({ type: "U", opcode: "0010111", instruction: "auipc", encoding: {} }),
    expected: row({
      type: "U",
      usesRd: true,
      usesImmediate: true,
      writesRegister: true, storesALU: true,
      isAUIPC: true,
    }),
  },
];

describe("DecodedInstruction fact matrix", () => {
  for (const c of cases) {
    it(`${c.name} exposes the expected fact row`, () => {
      const decoded = DecodedInstruction.from(c.node);
      expect(factsOf(decoded)).toEqual(c.expected);
    });
  }
});

describe("DecodedInstruction register getters", () => {
  it("returns regeq for present registers (R type)", () => {
    const d = DecodedInstruction.from(
      node({ type: "R", opcode: "0110011", instruction: "add", encoding: { funct3: "000", funct7: "0000000" } })
    );
    expect(d.rs1()).toBe("x1");
    expect(d.rs2()).toBe("x2");
    expect(d.rd()).toBe("x3");
    expect(d.usedRegisters()).toEqual(["rs1", "rs2", "rd"]);
  });

  it("throws when accessing an absent register field", () => {
    // Store has no rd; U-type has no rs1/rs2.
    const store = DecodedInstruction.from(
      node({ type: "S", opcode: "0100011", instruction: "sw", encoding: { funct3: "010" } })
    );
    const lui = DecodedInstruction.from(
      node({ type: "U", opcode: "0110111", instruction: "lui", encoding: {} })
    );
    expect(() => store.rd()).toThrow();
    expect(() => lui.rs1()).toThrow();
    expect(() => lui.rs2()).toThrow();
  });

  it("throws on funct7() for non-R instructions", () => {
    const addi = DecodedInstruction.from(
      node({ type: "I", opcode: "0010011", instruction: "addi", encoding: { funct3: "000" } })
    );
    expect(() => addi.funct7()).toThrow();
  });
});

describe("DecodedInstruction.extend", () => {
  const lb = () =>
    DecodedInstruction.from(node({ type: "I", opcode: "0000011", instruction: "lb", encoding: { funct3: "000" } }));
  const lbu = () =>
    DecodedInstruction.from(node({ type: "I", opcode: "0000011", instruction: "lbu", encoding: { funct3: "100" } }));
  const lh = () =>
    DecodedInstruction.from(node({ type: "I", opcode: "0000011", instruction: "lh", encoding: { funct3: "001" } }));
  const lhu = () =>
    DecodedInstruction.from(node({ type: "I", opcode: "0000011", instruction: "lhu", encoding: { funct3: "101" } }));

  it("sign-extends a negative byte (lb)", () => {
    expect(lb().extend("10000000")).toBe("1".repeat(24) + "10000000");
  });

  it("does not alter the sign bits of a positive byte (lb)", () => {
    expect(lb().extend("00000001")).toBe("0".repeat(24) + "00000001");
  });

  it("zero-extends a byte (lbu)", () => {
    expect(lbu().extend("10000000")).toBe("0".repeat(24) + "10000000");
  });

  it("sign-extends a negative half-word (lh)", () => {
    expect(lh().extend("1000000000000000")).toBe("1".repeat(16) + "1000000000000000");
  });

  it("zero-extends a half-word (lhu)", () => {
    expect(lhu().extend("1000000000000000")).toBe("0".repeat(16) + "1000000000000000");
  });
});

describe("DecodedInstruction static helpers", () => {
  it("maps opcodes to types", () => {
    expect(DecodedInstruction.opcodeToType("0110011")).toBe("R");
    expect(DecodedInstruction.opcodeToType("0000011")).toBe("I");
    expect(DecodedInstruction.opcodeToType("0100011")).toBe("S");
    expect(DecodedInstruction.opcodeToType("1100011")).toBe("B");
    expect(DecodedInstruction.opcodeToType("1101111")).toBe("J");
    expect(DecodedInstruction.opcodeToType("0010111")).toBe("U");
    expect(() => DecodedInstruction.opcodeToType("1111111")).toThrow();
  });

  it("slices funct7 out of a 12-bit immediate", () => {
    expect(DecodedInstruction.immFunct7("010101011111")).toBe("01010101");
  });
});
