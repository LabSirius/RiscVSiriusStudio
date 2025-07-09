import { describe, it, expect, vi } from "vitest";
import { Simulator } from "../Simulator";
import type { Webview } from "vscode";

// Mock to simulate incompatible libraries and ignore them
vi.mock("vscode", () => ({
  window: {},
  commands: {},
  TextEditorDecorationType: {},
}));


// Fake webview(mock)
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

class DummySimulator extends Simulator {
  constructor(params: any, rvDoc: any, context: any) {
    super(params, rvDoc, context, dummyWebview);
  }

  public notifyRegisterWrite(): void {}
  public notifyMemoryRead(): void {}
  public notifyMemoryWrite(): void {}
  public animateLine(): void {}
  public sendSimulatorTypeToView(): void {}
  public sendTextProgramToView(): void {}
  public makeEditorWritable(): Promise<void> {
    return Promise.resolve();
  }
}

describe("SCCPU - S-type instructions using Simulator", () => {
  const testCases = [
    {
      name: "sb - store byte",
      inst: {
        kind: "SrcInstruction",
        type: "S",
        opcode: "0100011",
        funct3: "000",
        rs1: { regeq: "x1" },
        rs2: { regeq: "x2" },
        encoding: {
          imm12: "000000000100",
          funct3: "000",
        },
        inst: 0,
        instruction: "sb x2, 4(x1)",
      },
      registers: [
        "00000000000000000000000000000000",
        "00000000000000000000000010101010",
      ],
      expected: {
        address: 4,
        value: "10101010",
        size: 1,
      },
    },
    {
      name: "sh - store halfword",
      inst: {
        kind: "SrcInstruction",
        type: "S",
        opcode: "0100011",
        funct3: "001",
        rs1: { regeq: "x1" },
        rs2: { regeq: "x2" },
        encoding: {
          imm12: "000000000100",
          funct3: "001",
        },
        inst: 0,
        instruction: "sh x2, 4(x1)",
      },
      registers: [
        "00000000000000000000000000000000",
        "00000000000000001010101010101010",
      ],
      expected: {
        address: 4,
        value: "1010101010101010",
        size: 2,
      },
    },
    {
      name: "sw - store word",
      inst: {
        kind: "SrcInstruction",
        type: "S",
        opcode: "0100011",
        funct3: "010",
        rs1: { regeq: "x1" },
        rs2: { regeq: "x2" },
        encoding: {
          imm12: "000000000100",
          funct3: "010",
        },
        inst: 0,
        instruction: "sw x2, 4(x1)",
      },
      registers: [
        "00000000000000000000000000000000",
        "00000000000000000000000000101010",
      ],
      expected: {
        address: 4,
        value: "00000000000000000000000000101010",
        size: 4,
      },
    },
  ];

  for (const test of testCases) {
    it(test.name, () => {
      const registers = new Array(32).fill("00000000000000000000000000000000");
      registers[1] = test.registers[0]; // x1
      registers[2] = test.registers[1]; // x2

      const mem = Array.from({ length: 64 }, (_, i) => ({
        memdef: i,
        binValue: "00000000",
      }));

      const params = { memorySize: 64 };
      const rvDoc = { ir: { instructions: [test.inst], memory: mem } };
      const context = {};

      const sim = new DummySimulator(params, rvDoc, context);
      sim.replaceRegisters(registers);

      const result = sim["cpu"].executeInstruction();
      (sim as any).writeResult(result); // Execute the writing

      const readBytes = sim["cpu"]
        .getDataMemory()
        .read(test.expected.address, test.expected.size);
      const reconstructed = readBytes.join("");
      const expected = test.expected.value.padStart(test.expected.size * 8, "0");

      expect(reconstructed).toBe(expected);
    });
  }
});