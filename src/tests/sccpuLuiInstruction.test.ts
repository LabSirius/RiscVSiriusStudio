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
  onDidReceiveMessage: () => ({ dispose: () => {} }),
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

describe("SCCPU - LUI instruction tests", () => {
  it("lui x1, 0x12345 (load upper immediate)", () => {
    const testConfig = {
      rd: "x1",
      imm21: "00010010001110100000",
      pcStartBytes: 8,
      expectedValue: 0x123A0000,
      expectedPCIndex: 3
    };

    const instruction = {
      kind: "SrcInstruction",
      type: "U",
      opcode: "0110111",
      rd: { regeq: testConfig.rd },
      encoding: {
        imm21: testConfig.imm21,
        funct3: "000"
      },
      inst: testConfig.pcStartBytes,
      instruction: `lui ${testConfig.rd}, 0x${(parseInt(testConfig.imm21, 2) >> 1).toString(16)}`,
      currentPc: testConfig.pcStartBytes
    };

    // Creating an array of binaries to then pass them to the simulator constructor
    const memory = Array.from({ length: 64 }, (_, i) => ({
      memdef: i,
      binValue: "00000000",
    }));

    const rvDoc = {
      ir: {
        instructions: [instruction],
        memory: memory,
      },
    };

    class TestSimulator extends DummySimulator {
      constructor(params: any, doc: any, context: any) {
        super(params, doc, context);
        this["cpu"].currentInstruction = () => instruction;
      }
    }

    const sim = new TestSimulator({ memorySize: 64 }, rvDoc, {});
    
    const registers = new Array(32).fill("00000000000000000000000000000000");
    sim.replaceRegisters(registers);

    sim["cpu"]["pc"] = testConfig.pcStartBytes / 4;
    sim.step();

    const rdBinary = sim["cpu"].getRegisterFile().readRegister(1);
    const rdValue = parseInt(rdBinary, 2);
    const pc = sim["cpu"].getPC();

    expect(rdValue).toBe(testConfig.expectedValue);
    expect(pc).toBe(testConfig.expectedPCIndex);
  });
});