import { describe, it, expect } from 'vitest';
import { compile } from './riscvc';

// Regression guard for .scratch/parser-lbu-lhu-missing/issues/01.
// The generated parser (riscv.ts) must stay in sync with riscv.peg so every
// base load form assembles, including the unsigned loads lbu/lhu.

const funct3Of = (bin: string) => bin.slice(17, 20);
const opcodeOf = (bin: string) => bin.slice(-7);

const encode = (src: string) => {
  const r = compile(src, 'x.asm');
  expect(r.success).toBe(true);
  return r.ir!.instructions[0].encoding.binEncoding as string;
};

describe('base load instructions assemble', () => {
  for (const form of ['lb x13, 0(x0)', 'lh x13, 0(x0)', 'lw x13, 0(x0)',
                      'lbu x13, 0(x0)', 'lhu x15, 8(x0)']) {
    it(form, () => {
      expect(compile(form + '\n', 'x.asm').success).toBe(true);
    });
  }
});

describe('unsigned loads carry the right funct3/opcode', () => {
  it('lbu -> funct3 100, opcode 0000011', () => {
    const bin = encode('lbu x13, 0(x0)\n');
    expect(funct3Of(bin)).toBe('100');
    expect(opcodeOf(bin)).toBe('0000011');
  });
  it('lhu -> funct3 101, opcode 0000011', () => {
    const bin = encode('lhu x15, 8(x0)\n');
    expect(funct3Of(bin)).toBe('101');
    expect(opcodeOf(bin)).toBe('0000011');
  });
});
