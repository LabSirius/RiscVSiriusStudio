import { describe, it, expect, vi } from "vitest";
import { Simulator } from "../Simulator";
import type { Webview } from "vscode";

vi.mock("vscode", () => ({
  window: {},
  commands: {},
  TextEditorDecorationType: {},
  Uri: {
    parse: vi.fn()
  }
}));

const dummyWebview: Webview = {
  postMessage: (_msg: any) => Promise.resolve(true),
  asWebviewUri: () => { throw new Error("Not implemented"); },
  cspSource: "",
  onDidReceiveMessage: () => ({ dispose: () => { } }),
  html: "",
  options: {},
};

interface TestInstruction {
  kind: string;
  type: string;
  opcode: string;
  rd: { regeq: string };
  encoding: {
    imm21: string;
  };
  inst: number;
  instruction: string;
  currentPc?: number;
}

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

function createTestInstruction(
  rd: string,
  offsetBytes: number,
  pcBytes: number,
  imm21: string
): TestInstruction {
  return {
    kind: "SrcInstruction",
    type: "J",
    opcode: "1101111",
    rd: { regeq: rd },
    encoding: { imm21 },
    inst: pcBytes,
    instruction: `jal ${rd}, ${offsetBytes}`,
    currentPc: pcBytes
  };
}

describe("SCCPU - JAL instruction tests", () => {
  const testCases = [
    {
      name: "jal x1, 8 (jump forward)",
      rd: "x1",
      offsetBytes: 8,
      imm21: "000000000000000000010",
      pcStartIndex: 0,
      pcStartBytes: 0,
      expectedPCIndex: 0.5,
      expectedX1: 4
    },
  ];

  for (const test of testCases) {
    it(test.name, () => {
      const instruction = {
        kind: "SrcInstruction",
        type: "J",
        opcode: "1101111",
        rd: { regeq: test.rd },
        encoding: { imm21: test.imm21 },
        inst: test.pcStartBytes,
        instruction: `jal ${test.rd}, ${test.offsetBytes}`,
        currentPc: test.pcStartBytes
      };

      const mem = Array.from({ length: 64 }, (_, i) => ({
        memdef: i,
        binValue: "00000000",
      }));

      const rvDoc = {
        ir: {
          instructions: [instruction],
          memory: mem,
        },
      };

      const params = { memorySize: 64 };
      const context = {};
      
      try {
        const sim = new DummySimulator(params, rvDoc, context);
        
        sim["cpu"]["pc"] = test.pcStartIndex;
        sim.replaceRegisters(new Array(32).fill("00000000000000000000000000000000"));

        const stepResult = sim.step();
        if (!stepResult.instruction) {
          throw new Error("No instruction received in step result");
        }

        const x1Binary = sim["cpu"].getRegisterFile().readRegister(1);
        const pc = sim["cpu"].getPC();
        const x1 = parseInt(x1Binary, 2);

        expect(pc).toBe(test.expectedPCIndex);
        expect(x1).toBe(test.expectedX1);
      } catch (error) {
        console.error("Test execution error:", error);
        throw error;
      }
    });
  }
});