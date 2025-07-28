import { describe, it, expect } from 'vitest';
import { SCCPU } from '../vcpu/singlecycle';

type ITypeCase = {
  name: string;
  instruction: string;
  opcode: string;
  funct3: string;
  rs1: number;
  imm12: string;
  expected: number;
};

// I-type instruction(operations) list
const testCases: ITypeCase[] = [
  {
    name: 'addi',
    instruction: 'addi',
    opcode: '0010011',
    funct3: '000',
    rs1: 10,
    imm12: '000000000101',
    expected: 15,
  },
  {
    name: 'andi',
    instruction: 'andi',
    opcode: '0010011',
    funct3: '111',
    rs1: 6,
    imm12: '000000000011',
    expected: 2,
  },
  {
    name: 'ori',
    instruction: 'ori',
    opcode: '0010011',
    funct3: '110',
    rs1: 6,
    imm12: '000000000011',
    expected: 7,
  },
  {
    name: 'xori',
    instruction: 'xori',
    opcode: '0010011',
    funct3: '100',
    rs1: 6,
    imm12: '000000000011',
    expected: 5,
  },
  {
    name: 'slti',
    instruction: 'slti',
    opcode: '0010011',
    funct3: '010',
    rs1: 2,
    imm12: '000000001010',
    expected: 1,
  },
  {
    name: 'sltiu',
    instruction: 'sltiu',
    opcode: '0010011',
    funct3: '011',
    rs1: 2,
    imm12: '000000001010',
    expected: 1,
  },
  {
    name: 'slli',
    instruction: 'slli',
    opcode: '0010011',
    funct3: '001',
    rs1: 1,
    imm12: '000000000010',
    expected: 4,
  },
  {
    name: 'srli',
    instruction: 'srli',
    opcode: '0010011',
    funct3: '101',
    rs1: 8,
    imm12: '000000000010', 
    expected: 2,
  },
  {
    name: 'srai',
    instruction: 'srai',
    opcode: '0010011',
    funct3: '101',
    rs1: -8,
    imm12: '010000000010',
    expected: -2,
  },
];

describe('SCCPU - I-type instructions', () => {
  testCases.forEach((test) => {
    it(`${test.name.toUpperCase()}: x5 = x1 (${test.rs1}) ${test.name} imm (${parseInt(test.imm12, 2)})`, () => {
      const mockInstruction = {
        kind: 'SrcInstruction',
        type: 'I',
        opcode: test.opcode,
        instruction: test.instruction,
        inst: 0,
        rs1: { regeq: 'x1' },
        rd: { regeq: 'x5' },
        encoding: {
          imm12: test.imm12.padStart(12, '0'),
          funct3: test.funct3,
        },
      };

      const cpu = new SCCPU([mockInstruction], [], 64);

       const regFile = cpu.getRegisterFile();
      regFile.writeRegister('x1', (test.rs1 >>> 0).toString(2).padStart(32, '0'));

      cpu.executeInstruction();

      const x5 = regFile.readRegisterFromName('x5');
      const expectedBin = (test.expected >>> 0).toString(2).padStart(32, '0');
      
      expect(x5).toBe(expectedBin);
    });
  });
});