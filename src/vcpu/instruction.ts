/**
 * DecodedInstruction — the single home for RISC-V instruction facts.
 *
 * It wraps one Raw IR instruction node (as produced by the assembler in
 * `riscvc.ts`) and reads its fields lazily. It does not copy or replace the
 * node: the assembler, the peggy-generated parser, and the
 * `InternalRepresentation` contract stay untouched.
 *
 * This module replaces the stringly-typed free functions in
 * `src/utilities/instructions.ts`: every fact those functions computed has an
 * equivalent method here, staying close to the existing vocabulary. In
 * addition it owns the memory-access classification (`memoryAccess()`) and the
 * pure sign/zero `extend()` helper that were previously decoded three separate
 * times across the two CPUs and the Simulator layer.
 */

/** The six RISC-V instruction formats, as the Raw IR node's `.type` field. */
export type InstructionType = "R" | "I" | "S" | "B" | "U" | "J";

/** Register operand as it appears on a Raw IR node (`{ regeq: "x5", ... }`). */
interface RawRegister {
  regeq: string;
}

/** The encoding sub-object of a Raw IR node. Only fields we read are typed. */
interface RawEncoding {
  funct3?: string;
  funct7?: string;
  imm12?: string;
  [key: string]: unknown;
}

/**
 * The subset of a Raw IR instruction node that `DecodedInstruction` reads.
 * The parser emits these nodes as `any` (see `InternalRepresentation.instructions`);
 * this interface documents the shape we depend on without re-typing the parser.
 */
export interface RawInstructionNode {
  /** Instruction type: one of R, I, S, B, U, J. */
  type: string;
  /** 7-bit opcode bit-string, e.g. "0110011". */
  opcode: string;
  /** Mnemonic, e.g. "add", "slli". */
  instruction: string;
  rs1?: RawRegister;
  rs2?: RawRegister;
  rd?: RawRegister;
  encoding?: RawEncoding;
  [key: string]: unknown;
}

/** Result of classifying a load/store's memory access. */
export interface MemoryAccess {
  /** Number of bytes the access touches. */
  bytes: 1 | 2 | 4;
  /** Whether a loaded value is sign-extended (true) or zero-extended (false). */
  signed: boolean;
}

/** Opcode bit-strings, named so the classification reads as vocabulary. */
const OPCODE_R = "0110011";
const OPCODE_I_ARITHMETIC = "0010011";
const OPCODE_I_LOAD = "0000011";
const OPCODE_I_JUMP = "1100111";
const OPCODE_I_EXT = "1110011";
const OPCODE_S = "0100011";
const OPCODE_B = "1100011";
const OPCODE_J = "1101111";
const OPCODE_LUI = "0110111";
const OPCODE_AUIPC = "0010111";

export class DecodedInstruction {
  private constructor(private readonly node: RawInstructionNode) {}

  /** Construct from a Raw IR node, wrapping it without copying or replacing it. */
  static from(node: RawInstructionNode): DecodedInstruction {
    return new DecodedInstruction(node);
  }

  /**
   * Maps a 7-bit opcode bit-string to its instruction type letter.
   * Pure static helper (formerly `opcodeToType`).
   */
  static opcodeToType(opcode: string): string {
    switch (opcode) {
      case OPCODE_R:
        return "R";
      case OPCODE_I_ARITHMETIC:
      case OPCODE_I_LOAD:
      case OPCODE_I_JUMP:
      case OPCODE_I_EXT:
        return "I";
      case OPCODE_S:
        return "S";
      case OPCODE_B:
        return "B";
      case OPCODE_J:
        return "J";
      case OPCODE_LUI:
      case OPCODE_AUIPC:
        return "U";
      default:
        throw new Error("Invalid opcode value");
    }
  }

  /** Extracts the funct7 slice from a 12-bit immediate bit-string. */
  static immFunct7(imm: string): string {
    return imm.substring(0, 8);
  }

  // --- raw field accessors ---------------------------------------------------

  /** Instruction type letter (R, I, S, B, U, J). */
  type(): InstructionType {
    return this.node.type as InstructionType;
  }

  /** 7-bit opcode bit-string. */
  opcode(): string {
    return this.node.opcode;
  }

  /** Mnemonic, e.g. "add". */
  mnemonic(): string {
    return this.node.instruction;
  }

  // --- register usage --------------------------------------------------------

  /** True if the instruction reads rs1 (everything except U and J). */
  usesRs1(): boolean {
    switch (this.node.type) {
      case "U":
      case "J":
        return false;
    }
    return true;
  }

  /** True if the instruction reads rs2 (R, S, B). */
  usesRs2(): boolean {
    switch (this.node.type) {
      case "R":
      case "S":
      case "B":
        return true;
    }
    return false;
  }

  /** True if the instruction writes rd (everything except S and B). */
  usesRd(): boolean {
    switch (this.node.type) {
      case "S":
      case "B":
        return false;
    }
    return true;
  }

  /** True if the named register (`rs1`/`rs2`/`rd`) is used by this instruction. */
  usesRegister(name: string): boolean {
    switch (name) {
      case "rs1":
        return this.usesRs1();
      case "rs2":
        return this.usesRs2();
      case "rd":
        return this.usesRd();
      default:
        throw new Error("Register name is not valid.");
    }
  }

  /** The register names this instruction uses, in canonical order. */
  usedRegisters(): string[] {
    switch (this.node.type) {
      case "R":
        return ["rs1", "rs2", "rd"];
      case "I":
        return ["rs1", "rd"];
      case "S":
        return ["rs1", "rs2"];
      case "B":
        return ["rs1", "rs2"];
      case "U":
        return ["rd"];
      case "J":
        return ["rd"];
      default:
        throw new Error("Invalid instruction type");
    }
  }

  /** rs1 register name (`regeq`). Throws if the instruction has no rs1. */
  rs1(): string {
    if (!this.usesRs1()) {
      throw new Error(
        "Instruction of type " + this.node.type + " does not have rs1 field."
      );
    }
    return this.node.rs1!.regeq;
  }

  /** rs2 register name (`regeq`). Throws if the instruction has no rs2. */
  rs2(): string {
    if (!this.usesRs2()) {
      throw new Error(
        "Instruction of type " + this.node.type + " does not have rs2 field."
      );
    }
    return this.node.rs2!.regeq;
  }

  /** rd register name (`regeq`). Throws if the instruction has no rd. */
  rd(): string {
    if (!this.usesRd()) {
      throw new Error(
        "Instruction of type " + this.node.type + " does not have rd field."
      );
    }
    return this.node.rd!.regeq;
  }

  // --- funct fields ----------------------------------------------------------

  /** True if the instruction carries a funct3 field (same set as usesRs1). */
  usesFunct3(): boolean {
    return this.usesRs1();
  }

  /** True if the instruction carries a funct7 field (R type only). */
  usesFunct7(): boolean {
    return this.node.type === "R";
  }

  /** funct3 bit-string, or "XXX" when the encoding has no funct3. */
  funct3(): string {
    if (this.node.encoding?.funct3) {
      return this.node.encoding.funct3;
    }
    return "XXX";
  }

  /** funct7 bit-string. Throws if the instruction has no funct7. */
  funct7(): string {
    if (!this.usesFunct7()) {
      throw new Error(
        "Instruction of type " + this.node.type + " does not have funct7 field"
      );
    }
    return this.node.encoding!.funct7!;
  }

  /**
   * The funct7 slice of this instruction's 12-bit immediate. Used by I-type
   * logical shift-immediates (slli/srli/srai) to recover the shift-kind bit
   * that lives in the immediate's upper bits. Surfaces the raw imm12 read so
   * consumers do not reach into the node's encoding themselves.
   */
  immFunct7(): string {
    return DecodedInstruction.immFunct7(this.node.encoding!.imm12!);
  }

  // --- specific-form predicates ---------------------------------------------

  /** I-type arithmetic (addi, slli, …). */
  isIArithmetic(): boolean {
    return this.node.type === "I" && this.node.opcode === OPCODE_I_ARITHMETIC;
  }

  /** I-type load (lb, lw, …). */
  isILoad(): boolean {
    return this.node.type === "I" && this.node.opcode === OPCODE_I_LOAD;
  }

  /** I-type jump (jalr). */
  isIJump(): boolean {
    return this.node.type === "I" && this.node.opcode === OPCODE_I_JUMP;
  }

  /** I-type environment/CSR (ecall, …). */
  isIExt(): boolean {
    return this.node.type === "I" && this.node.opcode === OPCODE_I_EXT;
  }

  /** lui. */
  isLUI(): boolean {
    return this.node.type === "U" && this.node.opcode === OPCODE_LUI;
  }

  /** auipc. */
  isAUIPC(): boolean {
    return this.node.type === "U" && this.node.opcode === OPCODE_AUIPC;
  }

  /** Logical shift-immediate (slli/srli/srai), distinguished by mnemonic. */
  isILogical(): boolean {
    const name = this.node.instruction;
    return name === "slli" || name === "srli" || name === "srai";
  }

  // --- datapath facts --------------------------------------------------------

  /** True if the instruction uses the ALU (R and I types). */
  usesALU(): boolean {
    switch (this.node.type) {
      case "R":
      case "I":
        return true;
    }
    return false;
  }

  /** True if the instruction consumes an immediate (everything except R). */
  usesImmediate(): boolean {
    return this.node.type !== "R";
  }

  /** True if the instruction reads or writes data memory (loads and stores). */
  usesDM(): boolean {
    switch (true) {
      case this.node.type === "S":
      case this.isILoad():
        return true;
    }
    return false;
  }

  /** True if the instruction reads data memory (loads). */
  readsMemory(): boolean {
    return this.isILoad();
  }

  /** True if the instruction writes data memory (stores). */
  writesMemory(): boolean {
    return this.node.type === "S";
  }

  /** True if the instruction writes the register file. */
  writesRegister(): boolean {
    switch (true) {
      case this.node.type === "R":
      case this.isIArithmetic():
      case this.isILoad():
      case this.isIJump():
      case this.node.type === "J":
      case this.node.type === "U":
        return true;
    }
    return false;
  }

  /** True if the instruction branches or jumps (B, J, jalr). */
  branchesOrJumps(): boolean {
    switch (true) {
      case this.node.type === "B":
      case this.node.type === "J":
      case this.isIJump():
        return true;
    }
    return false;
  }

  /** True if the instruction stores the next PC into rd (J, jalr). */
  storesNextPC(): boolean {
    switch (true) {
      case this.node.type === "J":
      case this.isIJump():
        return true;
    }
    return false;
  }

  /** True if the write-back value comes from the ALU (R, I-arith, U). */
  storesALU(): boolean {
    switch (true) {
      case this.node.type === "R":
      case this.isIArithmetic():
      case this.node.type === "U":
        return true;
    }
    return false;
  }

  /** True if the write-back value comes from a memory read (loads). */
  storesMemRead(): boolean {
    return this.isILoad();
  }

  // --- memory-access shape ---------------------------------------------------

  /**
   * Classifies a load/store's memory access, decoded once from funct3.
   * Returns `{ bytes, signed }` for loads and stores, `null` otherwise.
   *
   * This is the single source of truth for the byte width + signedness that
   * was previously re-decoded in the single-cycle CPU, the pipeline CPU MEM
   * stage, and the Simulator's `bytesToReadOrWrite`.
   */
  memoryAccess(): MemoryAccess | null {
    if (!this.readsMemory() && !this.writesMemory()) {
      return null;
    }
    const funct3 = this.funct3();
    let bytes: 1 | 2 | 4;
    switch (funct3) {
      case "000": // lb / sb
      case "100": // lbu
        bytes = 1;
        break;
      case "001": // lh / sh
      case "101": // lhu
        bytes = 2;
        break;
      case "010": // lw / sw
        bytes = 4;
        break;
      default:
        throw new Error("Cannot deduce memory access from funct3");
    }
    // Stores never extend. Loads sign-extend unless funct3's high bit is set
    // (the "u" variants: lbu, lhu), matching the CPUs' read-back logic. Note
    // lw (funct3 "010") is reported signed, but its value is already 32 bits,
    // so extend() is a no-op for it — the flag only bites on sub-word loads.
    const signed = this.readsMemory() && funct3.charAt(0) === "0";
    return { bytes, signed };
  }

  /**
   * Sign- or zero-extends a loaded value's bit-string to 32 bits, choosing
   * sign vs zero from this instruction's memory-access fact. Pure: bits in,
   * bits out, no CPU state. Returns the input unchanged when this is not a
   * load (nothing to extend).
   */
  extend(bits: string): string {
    const access = this.memoryAccess();
    // Not a memory op, or a store (stores return a non-null access but nothing
    // to extend) — pass the bits through untouched.
    if (access === null || !this.readsMemory()) {
      return bits;
    }
    const fill = access.signed ? bits.charAt(0) : "0";
    return bits.padStart(32, fill);
  }
}
