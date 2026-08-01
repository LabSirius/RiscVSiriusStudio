import { describe, it, expect } from "vitest";
import {
  MIN_MEMORY_BYTES,
  MAX_MEMORY_BYTES,
  isValidMemorySize,
  bytesToWords,
} from "./memory";

describe("isValidMemorySize", () => {
  it("accepts a word-aligned size within bounds", () => {
    expect(isValidMemorySize(128)).toBe(true);
    expect(isValidMemorySize(MIN_MEMORY_BYTES)).toBe(true);
    expect(isValidMemorySize(MAX_MEMORY_BYTES)).toBe(true);
  });

  it("rejects sizes not a multiple of 4", () => {
    expect(isValidMemorySize(6)).toBe(false);
    expect(isValidMemorySize(127)).toBe(false);
  });

  it("rejects sizes below the minimum", () => {
    expect(isValidMemorySize(0)).toBe(false);
    expect(isValidMemorySize(MIN_MEMORY_BYTES - 4)).toBe(false);
  });

  it("rejects sizes above the maximum", () => {
    expect(isValidMemorySize(MAX_MEMORY_BYTES + 4)).toBe(false);
  });

  it("rejects non-integers and non-finite input", () => {
    expect(isValidMemorySize(12.5)).toBe(false);
    expect(isValidMemorySize(NaN)).toBe(false);
    expect(isValidMemorySize(Infinity)).toBe(false);
  });
});

describe("bytesToWords", () => {
  it("converts bytes to whole words", () => {
    expect(bytesToWords(128)).toBe(32);
    expect(bytesToWords(4)).toBe(1);
  });
});
