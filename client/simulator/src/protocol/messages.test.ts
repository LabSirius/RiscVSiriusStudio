import { describe, it, expect } from "vitest";
import { parseExtensionMessage, type ExtensionMessage } from "@protocol/messages";

// Seam 1: the extension→webview protocol boundary. These tests assert external
// behaviour at the seam — a raw `unknown` in, a typed `ExtensionMessage` (or a
// rejection) out — never implementation detail. Table-driven, mirroring the
// root vcpu suites.

// A minimal-but-complete `uploadMemory.payload`, reused across cases.
const payload = {
  memory: [],
  program: [],
  directivesWritableSize: 0,
  directivesReadOnlySize: 0,
  addressLine: [],
  symbols: {},
  asmList: [],
};

// One representative valid message per operation, paired with the typed value it
// must parse to. Where the wire carries a legacy `from` field, it is included in
// the input and must be dropped from the output.
const validCases: ReadonlyArray<{ name: string; raw: unknown; expected: ExtensionMessage }> = [
  {
    name: "uploadMemory",
    raw: {
      from: "extension",
      operation: "uploadMemory",
      payload,
      typeSimulator: "monocycle",
      initialLine: 3,
      isReset: false,
      typesInstruction: [{ type: "R" }, { type: "I" }],
    },
    expected: {
      operation: "uploadMemory",
      payload,
      typeSimulator: "monocycle",
      initialLine: 3,
      isReset: false,
      typesInstruction: [{ type: "R" }, { type: "I" }],
    },
  },
  {
    name: "setRegister",
    raw: { from: "extension", operation: "setRegister", register: "x2", value: "0100" },
    expected: { operation: "setRegister", register: "x2", value: "0100" },
  },
  {
    name: "step (monocycle variant)",
    raw: {
      from: "extension",
      operation: "step",
      newPc: 8,
      currentMonocycletInst: { asm: "addi" },
      result: { alu: { a: "0", b: "0", operation: "", result: "0" } },
      lineDecorationNumber: 4,
    },
    expected: {
      operation: "step",
      newPc: 8,
      currentMonocycletInst: { asm: "addi" },
      result: { alu: { a: "0", b: "0", operation: "", result: "0" } },
      lineDecorationNumber: 4,
    } as unknown as ExtensionMessage,
  },
  {
    name: "step (pipeline variant, result only)",
    raw: {
      from: "extension",
      operation: "step",
      result: { IF: { instruction: {}, PC: 0, PCP4: 4 } },
    },
    expected: {
      operation: "step",
      result: { IF: { instruction: {}, PC: 0, PCP4: 4 } },
    } as unknown as ExtensionMessage,
  },
  {
    name: "stop (bare)",
    raw: { from: "extension", operation: "stop" },
    expected: { operation: "stop" },
  },
  {
    name: "stop (with descerror)",
    raw: { from: "extension", operation: "stop", descerror: "boom" },
    expected: { operation: "stop", descerror: "boom" },
  },
  {
    name: "simulatorType",
    raw: { from: "extension", operation: "simulatorType", simulatorType: "graphic" },
    expected: { operation: "simulatorType", simulatorType: "graphic" },
  },
  {
    name: "textProgram",
    raw: { from: "extension", operation: "textProgram", textProgram: "addi x1, x0, 1" },
    expected: { operation: "textProgram", textProgram: "addi x1, x0, 1" },
  },
  {
    name: "readMemory",
    raw: { from: "extension", operation: "readMemory", address: 16, _length: 4 },
    expected: { operation: "readMemory", address: 16, _length: 4 },
  },
  {
    name: "writeMemory",
    raw: { from: "extension", operation: "writeMemory", address: 16, value: "0001", _length: 4 },
    expected: { operation: "writeMemory", address: 16, value: "0001", _length: 4 },
  },
  {
    name: "clickInLine",
    raw: { from: "extension", operation: "clickInLine", lineNumber: 7 },
    expected: { operation: "clickInLine", lineNumber: 7 },
  },
  {
    name: "setApiKey",
    raw: { from: "extension", operation: "setApiKey", key: "sk-123" },
    expected: { operation: "setApiKey", key: "sk-123" },
  },
];

// Rejections: malformed shapes, a foreign message, and dropped/renamed fields.
// Each must return null, never throw.
const invalidCases: ReadonlyArray<{ name: string; raw: unknown }> = [
  { name: "null", raw: null },
  { name: "undefined", raw: undefined },
  { name: "a number", raw: 42 },
  { name: "a string", raw: "step" },
  { name: "an array", raw: [{ operation: "stop" }] },
  { name: "no operation field", raw: { from: "extension", register: "x2", value: "0" } },
  { name: "non-string operation", raw: { operation: 7 } },
  // Foreign message: an operation the host never sends.
  { name: "foreign operation", raw: { operation: "launchMissiles", payload } },
  { name: "empty object", raw: {} },
  // Dropped required field.
  { name: "setRegister missing value", raw: { operation: "setRegister", register: "x2" } },
  { name: "step missing result", raw: { operation: "step", newPc: 4 } },
  { name: "readMemory missing _length", raw: { operation: "readMemory", address: 16 } },
  {
    name: "uploadMemory missing typesInstruction",
    raw: { operation: "uploadMemory", payload, typeSimulator: "monocycle", initialLine: 0, isReset: false },
  },
  // Renamed field: right operation, wrong key.
  { name: "setRegister with reg instead of register", raw: { operation: "setRegister", reg: "x2", value: "0" } },
  {
    name: "clickInLine with line instead of lineNumber",
    raw: { operation: "clickInLine", line: 7 },
  },
  // Wrong field type.
  { name: "readMemory address as string", raw: { operation: "readMemory", address: "16", _length: 4 } },
  { name: "step with non-object result", raw: { operation: "step", result: "IF" } },
  { name: "simulatorType with numeric simulatorType", raw: { operation: "simulatorType", simulatorType: 1 } },
  // Optional field present but wrong type.
  { name: "step with non-number newPc", raw: { operation: "step", result: {}, newPc: "8" } },
  { name: "stop with non-string descerror", raw: { operation: "stop", descerror: 500 } },
];

describe("parseExtensionMessage", () => {
  describe("accepts every message the host sends today", () => {
    for (const { name, raw, expected } of validCases) {
      it(`parses ${name} to its typed value`, () => {
        const parsed = parseExtensionMessage(raw);
        expect(parsed).toEqual(expected);
      });
    }

    it("drops the legacy `from` field from the parsed value", () => {
      const parsed = parseExtensionMessage({ from: "extension", operation: "stop" });
      expect(parsed).not.toBeNull();
      expect(parsed).not.toHaveProperty("from");
    });

    it("drops foreign extra fields, keeping only the typed shape", () => {
      const parsed = parseExtensionMessage({
        operation: "setRegister",
        register: "x2",
        value: "0",
        smuggled: "payload",
      });
      expect(parsed).toEqual({ operation: "setRegister", register: "x2", value: "0" });
    });
  });

  describe("rejects malformed, foreign and dropped/renamed-field input", () => {
    for (const { name, raw } of invalidCases) {
      it(`rejects ${name}`, () => {
        expect(parseExtensionMessage(raw)).toBeNull();
      });
    }
  });
});
