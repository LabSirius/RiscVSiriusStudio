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

describe("SCCPU - Load instructions (execution only)", () => {
    const testCases = [
        {
            name: "lb",
            funct3: "000",
            bytes: ["10101010"], // 0xAA
            expected: "11111111111111111111111110101010",
            size: 1,
        },
        {
            name: "lbu",
            funct3: "100",
            bytes: ["10101010"], // 0xAA
            expected: "00000000000000000000000010101010",
            size: 1,
        },
        {
            name: "lh",
            funct3: "001",
            bytes: ["10101010", "10111011"], // 0xBBAA
            expected: "11111111111111111011101110101010",
            size: 2,
        },
        {
            name: "lhu",
            funct3: "101",
            bytes: ["10101010", "10111011"], // 0xBBAA
            expected: "00000000000000001011101110101010",
            size: 2,
        },
        {
            name: "lw",
            funct3: "010",
            bytes: ["10101010", "10111011", "10111100", "11011101"],
            expected: "11011101101111001011101110101010",
            size: 4,
        },
    ];

    testCases.forEach((test) => {
        it(`${test.name}: loads ${test.size} byte(s) from memory`, () => {
            const instruction = {
                kind: "SrcInstruction",
                type: "I",
                opcode: "0000011",
                funct3: test.funct3,
                inst: 0,
                instruction: test.name,
                rs1: { regeq: "x1" },
                rd: { regeq: "x5" },
                encoding: {
                    imm12: "000000000100", // offset = 4
                    funct3: test.funct3,
                },
            };

            // Simulation load data into memory
            const memory = test.bytes.map((binValue, i) => ({
                memdef: 4 + i,
                binValue,
            }));

            // Program structure
            const rvDoc = {
                ir: {
                    instructions: [instruction], // intruction list
                    memory, // memory data to be used when executing the instruction.
                },
            };

            const sim = new DummySimulator({ memorySize: 64 }, rvDoc, {});
            const regFile = sim["cpu"].getRegisterFile();

            regFile.writeRegister("x1", "00000000000000000000000000000000");
            sim.step();

            const result = regFile.readRegisterFromName("x5");
            console.log(`Resultado en x5 (${test.name}):`, result);

            expect(result).toBe(test.expected);
        });
    });
});