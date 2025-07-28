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

describe("SCCPU - AUIPC instruction tests", () => {
  it("auipc x3, 0x12345 (add upper immediate to PC)", () => {
    // ===== Test config =====
    const testConfig = {
      rd: "x3",
      imm21: "000100100011010001010", // 0x12345 (20 bits) + 1 extra bit
      pcStartBytes: 16,               // PC starts in 16 bytes (4 instructions)
      expectedValue: 0x12345010,      // (0x12345 << 12) + 16
      expectedPCIndex: 5              // 16 + 4 = 20 bytes (5 instructions)
    };

    console.log("\n=== TEST CONFIGURATION ===");
    console.log("Immediate (21 bits):", testConfig.imm21);
    console.log("Immediate (20 bits):", testConfig.imm21.slice(0, 20), 
                "=", parseInt(testConfig.imm21.slice(0, 20), 2));
    console.log("Expected value:", testConfig.expectedValue, 
                "(hex: 0x" + testConfig.expectedValue.toString(16) + ")");

    const instruction = {
      kind: "SrcInstruction",
      type: "U",
      opcode: "0010111", // Opcode AUIPC
      rd: { regeq: testConfig.rd },
      encoding: {
        imm21: testConfig.imm21,
        funct3: "000"
      },
      inst: testConfig.pcStartBytes,
      instruction: `auipc ${testConfig.rd}, 0x12345`,
      currentPc: testConfig.pcStartBytes
    };

    console.log("\n=== INSTRUCTION CREATED ===");
    console.log("Instruction:", instruction.instruction);
    console.log("PC in instruction:", instruction.inst, "bytes");

    // ===== Memory Config =====
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
        this["cpu"].currentInstruction = () => ({
          ...instruction,
          encoding: {
            ...instruction.encoding,
            funct3: "000"
          }
        });
      }
    }

    const sim = new TestSimulator({ memorySize: 64 }, rvDoc, {});
    
    const registers = new Array(32).fill("00000000000000000000000000000000");
    sim.replaceRegisters(registers);

    sim["cpu"]["pc"] = testConfig.pcStartBytes / 4;
    
    console.log("\n=== BEFORE EXECUTION ===");
    console.log("Initial PC (index):", sim["cpu"]["pc"]);
    console.log("Initial PC (bytes):", sim["cpu"]["pc"] * 4);
    console.log("Initial x3:", sim["cpu"].getRegisterFile().readRegister(3));

    const stepResult = sim.step();
    
    console.log("\n=== AFTER EXECUTION ===");
    console.log("Step result:", {
      instruction: stepResult.instruction?.instruction,
      aluResult: stepResult.result?.alu?.result
    });

    const rdBinary = sim["cpu"].getRegisterFile().readRegister(3);
    const rdValue = parseInt(rdBinary, 2);
    const pc = sim["cpu"].getPC();

    console.log("\n=== RESULTS ===");
    console.log("Register x3 value:", rdValue, 
                "(hex: 0x" + rdValue.toString(16) + ")");
    console.log("Register x3 binary:", rdBinary);
    console.log("New PC (index):", pc);
    console.log("New PC (bytes):", pc * 4);

    // ===== Assertions =====
    expect(rdValue).toBe(testConfig.expectedValue);
    expect(pc).toBe(testConfig.expectedPCIndex);
  });
});