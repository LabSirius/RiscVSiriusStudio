import { binaryToHex } from "@/utils/handlerConversions";

/**
 * Program-memory export formatting, lifted verbatim from the old Settings-panel
 * ExportMemory so both the toolbar control and (until it is deleted) the panel
 * produce byte-identical output. `program` is the memory table's byte array
 * (8-bit binary strings, little-endian within each 4-byte word); `asmList` is
 * the parallel mnemonics, one per word.
 */

/** One word high byte first (word[3]..word[0]), uppercase, zero-padded. */
function wordHex(program: string[], byteOffset: number): string {
  let word = "";
  for (let j = 3; j >= 0; j--) {
    const byteBinary = program[byteOffset + j] || "00000000";
    word += binaryToHex(byteBinary).padStart(2, "0").toUpperCase();
  }
  return word;
}

/** Verilog `.hex`: one hex byte per line, high byte of each word first. */
export function exportProgramMemoryHex(program: string[]): string {
  const hexBytes: string[] = [];
  for (let i = 0; i < program.length; i += 4) {
    for (let j = 3; j >= 0; j--) {
      const binaryString = program[i + j] || "00000000";
      hexBytes.push(binaryToHex(binaryString).padStart(2, "0").toUpperCase());
    }
  }
  return hexBytes.join("\n");
}

/** Quartus `.mif`: word-addressed body with PC + asm comments. */
export function exportProgramMemoryMif(program: string[], asmList: string[] = []): string {
  const instructionCount = program.length;
  const totalWords = program.length / 4;

  const calculateDepth = (words: number): number => {
    const minDepth = 256;
    return words <= minDepth ? minDepth : 2 ** Math.ceil(Math.log2(words));
  };

  const memoryDepth = calculateDepth(totalWords);

  const mifHeader = `-- RISC-V dataMemoryTable.program memory (word addressed)
WIDTH=32;
DEPTH=${memoryDepth};
ADDRESS_RADIX=UNS;
DATA_RADIX=HEX;
CONTENT BEGIN
`;

  const mifBodyLines: string[] = [];

  for (let i = 0; i < program.length; i += 4) {
    const wordIndex = i / 4;

    if (wordIndex === instructionCount) {
      mifBodyLines.push(`\n  -- CONSTANTS`);
    }

    const word = wordHex(program, i);

    const pcHex = i.toString(16).toUpperCase().padStart(8, "0");
    if (wordIndex < asmList.length && asmList[wordIndex]) {
      mifBodyLines.push(`\t${wordIndex} : ${word}; -- (PC 0x${pcHex}) ${asmList[wordIndex]}`);
    } else {
      mifBodyLines.push(`\t${wordIndex} : ${word};`);
    }
  }

  const mifFooter = `\nEND;`;

  return mifHeader + mifBodyLines.join("\n") + mifFooter;
}
