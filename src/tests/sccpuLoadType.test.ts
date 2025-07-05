import { describe, it, expect } from "vitest";
import { SCCPU } from "../vcpu/singlecycle";

// Utility to manually build memory
function createMemory(bytes: string[], address = 4): any[] {
    const mem = Array.from({ length: 64 }, (_, i) => ({
        memdef: i,
        binValue: "00000000",
    }));
    for (let i = 0; i < bytes.length; i++) {
        const cell = mem[address + i];
        if (!cell) throw new Error(`Invalid address: ${address + i}`);

        const byte = bytes[i];
        if (byte === undefined) throw new Error(`Byte at position ${i} is undefined`);

        cell.binValue = byte;
    }

    return mem;
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

            const mem = createMemory(test.bytes);
            const cpu = new SCCPU([instruction], mem, 64);

            const registers = new Array(32).fill("00000000000000000000000000000000");
            registers[1] = "00000000000000000000000000000000"; // x1 = 0
            cpu.replaceRegisters(registers);

            const result = cpu.executeInstruction();

            expect(result.wb.result).toBe(test.expected);
        });
    });
});