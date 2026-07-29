import { chunk } from "lodash";
import { intToHex, binaryToHex } from "@/utils/handlerConversions";
import { SymbolData } from "@/utils/tables/types";
import { INFO_PLACEHOLDER } from "@/utils/tables/availableRows";

/**
 * Pure row model for the program-memory table — the internal seam behind
 * SimulatorTable's declarative `data` prop (ADR-0006). Previously this logic was
 * `uploadProgramMemory` in handlersMemory.ts, which built rows and poked symbol
 * labels straight into the live Tabulator instance. Here it is one pure function
 * the component memoizes into the row array; node-testable, no DOM. Program
 * memory is read-only, so there is no write/resize equivalent of availableRows.
 */

export interface ProgramRow {
  address: string;
  /** Coloured, tooltip-tagged instruction encoding HTML (see colorizeInstruction). */
  instructionencoding: string;
  /** The assembled instruction as text (e.g. "addi x1, x0, 5"); "" when unknown. */
  asmText: string;
  hex: string;
  info: string;
  /** "program" for instruction rows; "" for appended symbol-only rows. */
  segment: string;
  [key: string]: unknown;
}

const EMPTY_BYTE = "00000000";
const BLANK_ENCODING = "0000 0000 0000 0000 0000 0000 0000 0000";

const labelSpan = (text: string): string =>
  `<span class="text-white text-[0.7rem] bg-[#3A6973] p-[.4rem] rounded-md text-center">${text}</span>`;

const segmentClasses = {
  opcode: "riscv-opcode",
  rd: "riscv-rd",
  funct3: "riscv-funct3",
  rs1: "riscv-rs1",
  rs2: "riscv-rs2",
  funct7: "riscv-funct7",
  imm: "riscv-imm",
};

/**
 * Split a 32-bit instruction word into its coloured, tooltip-tagged fields per
 * RISC-V format. Pure string in / HTML out — moved verbatim from handlersMemory
 * so it lives beside the row builder and is covered by the node test. Unknown or
 * missing types fall back to the raw bits in 4-bit groups.
 */
export const colorizeInstruction = (binary32bit: string, type: string): string => {
  const bits = binary32bit;
  if (bits.length !== 32) return binary32bit;

  let parts: { value: string; class: string; label: string }[] = [];

  switch (type.toUpperCase()) {
    case "R-TYPE":
      parts = [
        { value: bits.substring(0, 7), class: segmentClasses.funct7, label: "funct7" },
        { value: bits.substring(7, 12), class: segmentClasses.rs2, label: "rs2" },
        { value: bits.substring(12, 17), class: segmentClasses.rs1, label: "rs1" },
        { value: bits.substring(17, 20), class: segmentClasses.funct3, label: "funct3" },
        { value: bits.substring(20, 25), class: segmentClasses.rd, label: "rd" },
        { value: bits.substring(25, 32), class: segmentClasses.opcode, label: "opcode" },
      ];
      break;
    case "I-TYPE":
      parts = [
        { value: bits.substring(0, 12), class: segmentClasses.imm, label: "imm[11:0]" },
        { value: bits.substring(12, 17), class: segmentClasses.rs1, label: "rs1" },
        { value: bits.substring(17, 20), class: segmentClasses.funct3, label: "funct3" },
        { value: bits.substring(20, 25), class: segmentClasses.rd, label: "rd" },
        { value: bits.substring(25, 32), class: segmentClasses.opcode, label: "opcode" },
      ];
      break;
    case "S-TYPE":
      parts = [
        { value: bits.substring(0, 7), class: segmentClasses.imm, label: "imm[11:5]" },
        { value: bits.substring(7, 12), class: segmentClasses.rs2, label: "rs2" },
        { value: bits.substring(12, 17), class: segmentClasses.rs1, label: "rs1" },
        { value: bits.substring(17, 20), class: segmentClasses.funct3, label: "funct3" },
        { value: bits.substring(20, 25), class: segmentClasses.imm, label: "imm[4:0]" },
        { value: bits.substring(25, 32), class: segmentClasses.opcode, label: "opcode" },
      ];
      break;
    case "B-TYPE":
      parts = [
        { value: bits.substring(0, 7), class: segmentClasses.imm, label: "imm[12|10:5]" },
        { value: bits.substring(7, 12), class: segmentClasses.rs2, label: "rs2" },
        { value: bits.substring(12, 17), class: segmentClasses.rs1, label: "rs1" },
        { value: bits.substring(17, 20), class: segmentClasses.funct3, label: "funct3" },
        { value: bits.substring(20, 25), class: segmentClasses.imm, label: "imm[4:1|11]" },
        { value: bits.substring(25, 32), class: segmentClasses.opcode, label: "opcode" },
      ];
      break;
    case "U-TYPE":
      parts = [
        { value: bits.substring(0, 20), class: segmentClasses.imm, label: "imm[31:12]" },
        { value: bits.substring(20, 25), class: segmentClasses.rd, label: "rd" },
        { value: bits.substring(25, 32), class: segmentClasses.opcode, label: "opcode" },
      ];
      break;
    case "J-TYPE":
      parts = [
        { value: bits.substring(0, 20), class: segmentClasses.imm, label: "imm[20|10:1|11|19:12]" },
        { value: bits.substring(20, 25), class: segmentClasses.rd, label: "rd" },
        { value: bits.substring(25, 32), class: segmentClasses.opcode, label: "opcode" },
      ];
      break;
    default:
      return bits.match(/.{1,4}/g)?.join(" ") || bits;
  }

  let finalHtml = "";
  for (const part of parts) {
    finalHtml += `<span data-tooltip="${part.label}" class="riscv-segment ${part.class}">`;
    for (const char of part.value) {
      finalHtml += char;
    }
    finalHtml += `</span>`;
  }
  return finalHtml;
};

/**
 * Build the program rows from the flat instruction byte array, applying symbol
 * labels. Mirrors `uploadProgramMemory`: instruction words become `segment:
 * "program"` rows; each symbol either relabels its existing row's `info` (keeping
 * that row's segment) or, if its address lies past the program, appends a blank
 * `segment: ""` row. Rows without a label get the invisible `INFO_PLACEHOLDER`.
 * The `?.type.toUpperCase() + "-TYPE"` precedence quirk is preserved from the
 * original so missing types resolve to "UNDEFINED-TYPE" → the spaced-bits fallback.
 */
export const buildProgramRows = (
  program: string[],
  symbols: Record<string, SymbolData>,
  typesInstruction: { type: string }[],
  asmList: string[] = []
): ProgramRow[] => {
  const rows: ProgramRow[] = chunk(program, 4).map((word, index) => {
    const byteAddress = index * 4;
    const address = intToHex(byteAddress).toUpperCase();

    const fullBinary = `${word[3] || EMPTY_BYTE}${word[2] || EMPTY_BYTE}${word[1] || EMPTY_BYTE}${word[0] || EMPTY_BYTE}`;
    const instructionType = typesInstruction[index]?.type.toUpperCase() + "-TYPE" || "UNKNOWN";

    return {
      address,
      instructionencoding: colorizeInstruction(fullBinary, instructionType),
      asmText: asmList[index] ?? "",
      hex: word
        .slice()
        .reverse()
        .map((byte) => binaryToHex(byte || EMPTY_BYTE).toUpperCase().padStart(2, "0"))
        .join("-"),
      info: "",
      segment: "program",
    };
  });

  const byAddress = new Map(rows.map((r) => [r.address, r] as [string, ProgramRow]));
  Object.values(symbols).forEach((symbol) => {
    const symbolAddress = intToHex(symbol.memdef).toUpperCase();
    const existing = byAddress.get(symbolAddress);
    if (existing) {
      existing.info = labelSpan(symbol.name);
    } else {
      const row: ProgramRow = {
        address: symbolAddress,
        instructionencoding: BLANK_ENCODING,
        asmText: "",
        info: labelSpan(symbol.name),
        hex: "00-00-00-00",
        segment: "",
      };
      rows.push(row);
      byAddress.set(symbolAddress, row);
    }
  });

  return rows.map((r) => ({ ...r, info: r.info || INFO_PLACEHOLDER }));
};
