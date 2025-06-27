import { describe, it, expect } from 'vitest';
import { SCCPU } from '../vcpu/singlecycle';

type RTypeCase = {
  name: string;
  instruction: string;
  funct3: string;
  funct7: string;
  rs1: number;
  rs2: number;
  expected: number; // Expected value
};

// R-type instruction test cases
const testCases: RTypeCase[] = [
  {
    name: 'add',
    instruction: 'add',
    funct3: '000',
    funct7: '0000000',
    rs1: 10,
    rs2: 5,
    expected: 15,
  },
  {
    name: 'sub',
    instruction: 'sub',
    funct3: '000',
    funct7: '0100000',
    rs1: 10,
    rs2: 5,
    expected: 5,
  },
  {
    name: 'and',
    instruction: 'and',
    funct3: '111',
    funct7: '0000000',
    rs1: 6,
    rs2: 3,
    expected: 2,
  },
  {
    name: 'or',
    instruction: 'or',
    funct3: '110',
    funct7: '0000000',
    rs1: 6,
    rs2: 3,
    expected: 7,
  },
  {
    name: 'xor',
    instruction: 'xor',
    funct3: '100',
    funct7: '0000000',
    rs1: 6,
    rs2: 3,
    expected: 5,
  },
  {
    name: 'sll',
    instruction: 'sll',
    funct3: '001',
    funct7: '0000000',
    rs1: 1,
    rs2: 2,
    expected: 4,
  },
  {
    name: 'srl',
    instruction: 'srl',
    funct3: '101',
    funct7: '0000000',
    rs1: 8,
    rs2: 2,
    expected: 2,
  },
  {
    name: 'sra',
    instruction: 'sra',
    funct3: '101',
    funct7: '0100000',
    rs1: -8,
    rs2: 2,
    expected: -2,
  },
  {
    name: 'slt',
    instruction: 'slt',
    funct3: '010',
    funct7: '0000000',
    rs1: -1,
    rs2: 5,
    expected: 1,
  },
  {
    name: 'sltu',
    instruction: 'sltu',
    funct3: '011',
    funct7: '0000000',
    rs1: 2,
    rs2: 5,
    expected: 1,
  },
];

describe('SCCPU - R-type instructions', () => {
  testCases.forEach((test) => {
    it(`${test.name.toUpperCase()}: x5 = x1 (${test.rs1}) ${test.name} x2 (${test.rs2})`, () => {
      const mockInstruction = {
        kind: 'SrcInstruction',
        type: 'R',
        opcode: '0110011',
        instruction: test.instruction,
        inst: 0,
        rs1: { regeq: 'x1' },
        rs2: { regeq: 'x2' },
        rd: { regeq: 'x5' },
        encoding: {
          funct3: test.funct3,
          funct7: test.funct7,
        },
      };

      const cpu = new SCCPU([mockInstruction], [], 64);

      const registerValues = Array(32).fill('00000000000000000000000000000000');
      registerValues[1] = (test.rs1 >>> 0).toString(2).padStart(32, '0'); // x1
      registerValues[2] = (test.rs2 >>> 0).toString(2).padStart(32, '0'); // x2
      cpu.replaceRegisters(registerValues);

      cpu.executeInstruction();
      const x5 = cpu.getRegisterFile().readRegisterFromName('x5');
      const expectedBinary = (test.expected >>> 0).toString(2).padStart(32, '0');
      expect(x5).toBe(expectedBinary);
    });
  });
});