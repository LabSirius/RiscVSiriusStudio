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

describe("SCCPU - JALR instruction test", () => {
  it("jalr x1, x2, 8 (jump with offset)", () => {
    const testConfig = {
      rs1: "x2",
      rs1Value: 16,
      rd: "x1",
      imm12: "000000001000",
      pcStartIndex: 2,
      pcStartBytes: 8,
      expectedPCIndex: 6,
      expectedRdValue: 12
    };

    const instruction = {
      kind: "SrcInstruction",
      type: "I",
      opcode: "1100111",
      rd: { regeq: testConfig.rd },
      rs1: { regeq: testConfig.rs1 },
      encoding: {
        imm12: testConfig.imm12,
        funct3: "000",
        funct7: "0000000"
      },
      inst: testConfig.pcStartBytes,
      instruction: `jalr ${testConfig.rd}, ${testConfig.rs1}, ${parseInt(testConfig.imm12, 2)}`,
      currentPc: testConfig.pcStartBytes,
      funct3: "000"
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

    class TestSimulator extends DummySimulator {
      constructor(params: any, rvDoc: any, context: any) {
        super(params, rvDoc, context);
        this["cpu"].currentInstruction = () => instruction;
      }
    }

    const sim = new TestSimulator({ memorySize: 64 }, rvDoc, {});
    
    const registers = new Array(32).fill("00000000000000000000000000000000");
    registers[2] = testConfig.rs1Value.toString(2).padStart(32, '0');
    sim.replaceRegisters(registers);

    sim["cpu"]["pc"] = testConfig.pcStartIndex;
    sim.step();

    const rdBinary = sim["cpu"].getRegisterFile().readRegister(1);
    const pc = sim["cpu"].getPC();
    const rdValue = parseInt(rdBinary, 2);

    expect(pc).toBe(testConfig.expectedPCIndex);
    expect(rdValue).toBe(testConfig.expectedRdValue);
  });
});