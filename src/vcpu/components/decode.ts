import { isILogical } from "../../utilities/instructions";


/**
 * Simulates the Immediate Unit. Generates the sign-extended immediate value.
 * This logic is a direct 1:1 extraction from the original SCCPU's execute methods.
 */
export class ImmediateUnit {
  public generate(instruction: any): string {
    const type = instruction.type;
    const encoding = instruction.encoding;
    let imm: string;

    switch (type) {
      case "I":
        imm = encoding.imm12 || "0";
        // Special case for I-type logical instructions, extracted from executeIInstruction
        if (isILogical(instruction.instruction)) {
            let immAsArray = imm.padStart(32, imm.charAt(0)).split("");
            immAsArray[21] = "0"; 
            return immAsArray.join("");
        }
        break;
      case "S":
        // The parser provides imm12 for S-type from imm7 and imm5
        imm = encoding.imm12 || "0";
        break;
      case "B":
        imm = encoding.imm13 || "0";
        break;
      case "U":
        imm = encoding.imm21 || "0";
        // U-type uses padEnd, not padStart, for LUI/AUIPC
        return imm.padEnd(32, '0');
      case "J":
        imm = encoding.imm21 || "0";
        break;
      default:
        imm = "0";
    }
    // Default sign-extension for I, S, B, J types
    return imm.padStart(32, imm.charAt(0));
  }
}