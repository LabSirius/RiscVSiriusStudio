import { describe, it, expect, vi } from "vitest";
import { Simulator } from "../Simulator";
import type { Webview } from "vscode";

vi.mock("vscode", () => ({
  window: {},
  commands: {},
  TextEditorDecorationType: {},
}));

 // Simulates sending a message to the Webview. Returns a resolved promise
const dummyWebview: Webview = {
  postMessage: (_msg: any) => Promise.resolve(true),
  asWebviewUri: () => {
    throw new Error("Not implemented");
  },
  cspSource: "",
  onDidReceiveMessage: () => {
    throw new Error("Not implemented");
  },
  html: "",
  options: {},
};

// The Dummy Simulator class inherits from Simulator and uses dummy Webview to avoid UI-related errors
class DummySimulator extends Simulator {
  constructor(params: any, rvDoc: any, context: any) {
    super(params, rvDoc, context, dummyWebview);
  }
  public notifyRegisterWrite(): void { }
  public notifyMemoryRead(): void { }
  public notifyMemoryWrite(): void { }
  public animateLine(): void { }
  public sendSimulatorTypeToView(): void { }
  public sendTextProgramToView(): void { }
  public makeEditorWritable(): Promise<void> {
    return Promise.resolve();
  }
}

describe("SCCPU - B-type instructions using Simulator", () => {
  const testCases = [
    {
      name: "beq - branch if equal (taken)",
      inst: {
        kind: "SrcInstruction",
        type: "B",
        opcode: "1100011",
        funct3: "000",
        rs1: { regeq: "x1" },
        rs2: { regeq: "x2" },
        encoding: {
          imm13: "00000000001000",
          funct3: "000",
        },
        inst: 0,
        instruction: "beq x1, x2, 8",
      },
      registers: [
        "00000000000000000000000000010101", // x1 = 21
        "00000000000000000000000000010101", // x2 = 21
      ],
      expectedPC: 2,
    },
    {
      name: "bne - branch if not equal (taken)",
      inst: {
        kind: "SrcInstruction",
        type: "B",
        opcode: "1100011",
        funct3: "001",
        rs1: { regeq: "x1" },
        rs2: { regeq: "x2" },
        encoding: {
          imm13: "00000000010000",
          funct3: "001",
        },
        inst: 0,
        instruction: "bne x1, x2, 16",
      },
      registers: [
        "00000000000000000000000000010101", // x1 = 21
        "00000000000000000000000000011111", // x2 = 31
      ],
      expectedPC: 4,
    },
    {
      name: "blt - branch if less than (taken)",
      inst: {
        kind: "SrcInstruction",
        type: "B",
        opcode: "1100011",
        funct3: "100",
        rs1: { regeq: "x1" },
        rs2: { regeq: "x2" },
        encoding: {
          imm13: "00000000000100",
          funct3: "100"
        }, inst: 0,
        instruction: "blt x1, x2, 4",
      },
      registers: [
        "00000000000000000000000000000011", // x1 = 3
        "00000000000000000000000000000100", // x2 = 4
      ],
      expectedPC: 1,
    },
    {
      name: "bge - branch if greater or equal (taken)",
      inst: {
        kind: "SrcInstruction",
        type: "B",
        opcode: "1100011",
        funct3: "101",
        rs1: { regeq: "x1" },
        rs2: { regeq: "x2" },
        encoding: {
          imm13: "00000000001000",
          funct3: "101"
        },
        inst: 0,
        instruction: "bge x1, x2, 8",
      },
      registers: [
        "00000000000000000000000000000101", // x1 = 5
        "00000000000000000000000000000100", // x2 = 4
      ],
      expectedPC: 2,
    },
    {
      name: "bltu - branch if less than unsigned (taken)",
      inst: {
        kind: "SrcInstruction",
        type: "B",
        opcode: "1100011",
        funct3: "110",
        rs1: { regeq: "x1" },
        rs2: { regeq: "x2" },
        encoding: {
          imm13: "00000000010000",
          funct3: "110",
        },
        inst: 0,
        instruction: "bltu x1, x2, 16",
      },
      registers: [
        "00000000000000000000000000000100", // x1 = 4
        "00000000000000000000000000001000", // x2 = 8
      ],
      expectedPC: 4,
    },
    {
      name: "bgeu - branch if greater or equal unsigned (taken)",
      inst: {
        kind: "SrcInstruction",
        type: "B",
        opcode: "1100011",
        funct3: "111",
        rs1: { regeq: "x1" },
        rs2: { regeq: "x2" },
        encoding: {
          imm13: "00000000001000",
          funct3: "111",
        },
        inst: 0,
        instruction: "bgeu x1, x2, 8",
      },
      registers: [
        "00000000000000000000000000001111", // x1 = 15
        "00000000000000000000000000001111", // x2 = 15
      ],
      expectedPC: 2,
    },
  ];

  for (const test of testCases) {
    it(test.name, () => {
      const registers = new Array(32).fill("00000000000000000000000000000000");
      registers[1] = test.registers[0];
      registers[2] = test.registers[1];

      const mem = Array.from({ length: 64 }, (_, i) => ({
        memdef: i,
        binValue: "00000000",
      }));

      const params = { memorySize: 64 };
      const rvDoc = { ir: { instructions: [test.inst], memory: mem } };
      const context = {};

      const sim = new DummySimulator(params, rvDoc, context);
      sim.replaceRegisters(registers);

      console.log("\n===== TEST:", test.name, "=====");
      console.log("Instruction:", test.inst.instruction);
      console.log("Offset (imm13):", test.inst.encoding.imm13);
      console.log("x1 binary:", registers[1]);
      console.log("x2 binary:", registers[2]);
      console.log("x1 decimal:", parseInt(registers[1], 2));
      console.log("x2 decimal:", parseInt(registers[2], 2));
      console.log("initial PC:", sim["cpu"].getPC());

      const result = sim.step();
      console.log("-> buMux.result:", result.result.buMux.result);
      console.log("-> buMux.signal:", result.result.buMux.signal);

      const x1 = sim["cpu"].getRegisterFile().readRegister(1);
      const x2 = sim["cpu"].getRegisterFile().readRegister(2);
      const pc = sim["cpu"].getPC();

      console.log("x1 After:", parseInt(x1, 2));
      console.log("x2 After:", parseInt(x2, 2));
      console.log("PC (expected):", test.expectedPC);
      console.log("PC (actual):", pc);
      console.log("===== END TEST:", test.name, "=====\n");

      expect(pc).toBe(test.expectedPC);
    });
  }
});