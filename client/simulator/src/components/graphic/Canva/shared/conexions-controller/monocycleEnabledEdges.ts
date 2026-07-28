import * as conexion from "./dataMonocycleConexions";
import { edgeCollector, type EdgeId } from "./datapath-primitives";
import type { ParsedInstruction } from "@/context/graphic/CurrentInstContext";
import type { MonocycleWires } from "@protocol/datapath-view";

// Seam 2 (monocycle): the pure opcode/signal -> lit-wires mapping, lifted out of
// the `useDataMonocycleConexions` memo. No React, no state mutation — given the
// current instruction and the datapath result it returns the set of EdgeIds
// that light this clock. Unit-testable without mounting the tree.

export const monocycleEnabledEdges = (
  instruction: ParsedInstruction | null,
  result: MonocycleWires
): Set<EdgeId> => {
  const { edges, add } = edgeCollector();
  if (!instruction) return edges;

  switch (instruction.type) {
    case "R":
      add(
        conexion.adder4_muxD,
        conexion.bu_muxD,
        conexion.muxD_pc,
        conexion.pc_adder4,
        conexion.four_adder4,
        conexion.pc_im,
        conexion.im_opcode,
        conexion.im_funct3,
        conexion.im_funct7,
        conexion.im_rs1,
        conexion.im_rs2,
        conexion.im_rd,
        conexion.muxC_rd,
        conexion.RUWr_wb,
        conexion.rs1_muxA,
        conexion.aluASrc_muxA,
        conexion.rs2_muxB,
        conexion.aluBSrc_muxB,
        conexion.muxA_aluA,
        conexion.muxB_aluB,
        conexion.aluOp_alu,
        conexion.brOp_bu,
        conexion.alu_muxC,
        conexion.ruDataWrSrc_muxC
      );
      break;

    case "I":
      if (instruction.opcode === "0010011") {
        add(
          conexion.adder4_muxD,
          conexion.bu_muxD,
          conexion.muxD_pc,
          conexion.pc_adder4,
          conexion.four_adder4,
          conexion.pc_im,
          conexion.im_opcode,
          conexion.im_funct3,
          conexion.im_rs1,
          conexion.im_rd,
          conexion.muxC_rd,
          conexion.RUWr_wb,
          conexion.im_immGen,
          conexion.immSrc_immGen,
          conexion.rs1_muxA,
          conexion.aluASrc_muxA,
          conexion.immGen_muxB,
          conexion.aluBSrc_muxB,
          conexion.muxA_aluA,
          conexion.muxB_aluB,
          conexion.aluOp_alu,
          conexion.brOp_bu,
          conexion.alu_muxC,
          conexion.ruDataWrSrc_muxC
        );
      } else if (instruction.opcode === "0000011") {
        add(
          conexion.adder4_muxD,
          conexion.bu_muxD,
          conexion.muxD_pc,
          conexion.pc_adder4,
          conexion.four_adder4,
          conexion.pc_im,
          conexion.im_opcode,
          conexion.im_funct3,
          conexion.im_rs1,
          conexion.im_rd,
          conexion.muxC_rd,
          conexion.RUWr_wb,
          conexion.im_immGen,
          conexion.immSrc_immGen,
          conexion.rs1_muxA,
          conexion.aluASrc_muxA,
          conexion.immGen_muxB,
          conexion.aluBSrc_muxB,
          conexion.muxA_aluA,
          conexion.muxB_aluB,
          conexion.aluOp_alu,
          conexion.brOp_bu,
          conexion.alu_dm,
          conexion.dmWr_dm,
          conexion.dmCtrl_dm,
          conexion.dm_muxC,
          conexion.ruDataWrSrc_muxC
        );
      } else if (instruction.opcode === "1100111") {
        add(
          conexion.alu_muxD,
          conexion.bu_muxD,
          conexion.muxD_pc,
          conexion.pc_adder4,
          conexion.four_adder4,
          conexion.pc_im,
          conexion.im_opcode,
          conexion.im_funct3,
          conexion.im_rs1,
          conexion.im_rd,
          conexion.muxC_rd,
          conexion.RUWr_wb,
          conexion.im_immGen,
          conexion.immSrc_immGen,
          conexion.rs1_muxA,
          conexion.aluASrc_muxA,
          conexion.immGen_muxB,
          conexion.aluBSrc_muxB,
          conexion.muxA_aluA,
          conexion.muxB_aluB,
          conexion.aluOp_alu,
          conexion.brOp_bu,
          conexion.adder4_muxC,
          conexion.ruDataWrSrc_muxC
        );
      }
      break;

    case "S":
      add(
        conexion.adder4_muxD,
        conexion.bu_muxD,
        conexion.muxD_pc,
        conexion.pc_adder4,
        conexion.four_adder4,
        conexion.pc_im,
        conexion.im_opcode,
        conexion.im_funct3,
        conexion.im_rs1,
        conexion.im_rs2,
        conexion.im_immGen,
        conexion.immSrc_immGen,
        conexion.rs1_muxA,
        conexion.aluASrc_muxA,
        conexion.immGen_muxB,
        conexion.aluBSrc_muxB,
        conexion.muxA_aluA,
        conexion.muxB_aluB,
        conexion.aluOp_alu,
        conexion.brOp_bu,
        conexion.alu_dm,
        conexion.rs2_dm,
        conexion.dmWr_dm,
        conexion.dmCtrl_dm
      );
      break;

    case "B": // BEQ, BNE, etc.
      add(
        conexion.bu_muxD,
        conexion.muxD_pc,
        conexion.pc_adder4,
        conexion.four_adder4,
        conexion.pc_im,
        conexion.im_opcode,
        conexion.im_funct3,
        conexion.im_rs1,
        conexion.im_rs2,
        conexion.im_immGen,
        conexion.immSrc_immGen,
        conexion.pc_muxA,
        conexion.aluASrc_muxA,
        conexion.immGen_muxB,
        conexion.aluBSrc_muxB,
        conexion.muxA_aluA,
        conexion.muxB_aluB,
        conexion.aluOp_alu,
        conexion.rs1_bu,
        conexion.rs2_bu,
        conexion.brOp_bu
      );
      if (result.buMux.signal === "1") {
        add(conexion.alu_muxD);
      } else {
        add(conexion.adder4_muxD);
      }
      break;

    case "J": // JAL
      add(
        conexion.alu_muxD,
        conexion.bu_muxD,
        conexion.muxD_pc,
        conexion.pc_adder4,
        conexion.four_adder4,
        conexion.pc_im,
        conexion.im_opcode,
        conexion.im_rd,
        conexion.muxC_rd,
        conexion.RUWr_wb,
        conexion.im_immGen,
        conexion.immSrc_immGen,
        conexion.pc_muxA,
        conexion.aluASrc_muxA,
        conexion.immGen_muxB,
        conexion.aluBSrc_muxB,
        conexion.muxA_aluA,
        conexion.muxB_aluB,
        conexion.aluOp_alu,
        conexion.brOp_bu,
        conexion.adder4_muxC,
        conexion.ruDataWrSrc_muxC
      );
      break;

    case "U":
      if (instruction.opcode === "0110111") {
        // LUI
        add(
          conexion.adder4_muxD,
          conexion.bu_muxD,
          conexion.muxD_pc,
          conexion.pc_adder4,
          conexion.four_adder4,
          conexion.pc_im,
          conexion.im_opcode,
          conexion.im_rd,
          conexion.muxC_rd,
          conexion.RUWr_wb,
          conexion.im_immGen,
          conexion.immSrc_immGen,
          conexion.immGen_muxB,
          conexion.aluBSrc_muxB,
          conexion.muxB_aluB,
          conexion.aluOp_alu,
          conexion.brOp_bu,
          conexion.alu_muxC,
          conexion.ruDataWrSrc_muxC
        );
      } else if (instruction.opcode === "0010111") {
        // AUIPC
        add(
          conexion.adder4_muxD,
          conexion.bu_muxD,
          conexion.muxD_pc,
          conexion.pc_adder4,
          conexion.four_adder4,
          conexion.pc_im,
          conexion.im_opcode,
          conexion.im_rd,
          conexion.muxC_rd,
          conexion.RUWr_wb,
          conexion.im_immGen,
          conexion.immSrc_immGen,
          conexion.pc_muxA,
          conexion.aluASrc_muxA,
          conexion.immGen_muxB,
          conexion.aluBSrc_muxB,
          conexion.muxB_aluB,
          conexion.aluOp_alu,
          conexion.brOp_bu,
          conexion.alu_muxC,
          conexion.ruDataWrSrc_muxC
        );
      }
      break;
  }

  return edges;
};

// The instruction-type label the datapath shows (drives per-element opacity).
// Pure counterpart to the old `setCurrentType` side effect that lived in the
// memo: returns the label, or null when no case matched (leaving the last label
// in place, exactly as the mutating version did by not calling the setter).
export const monocycleCurrentType = (
  instruction: ParsedInstruction | null
): string | null => {
  if (!instruction) return null;

  switch (instruction.type) {
    case "R":
      return "R";
    case "I":
      if (instruction.opcode === "0010011") return "I";
      if (instruction.opcode === "0000011") return "L";
      if (instruction.opcode === "1100111") return "JALR";
      return null;
    case "S":
      return "S";
    case "B":
      return "B";
    case "J":
      return "J";
    case "U":
      if (instruction.opcode === "0110111") return "LUI";
      if (instruction.opcode === "0010111") return "AUIPC";
      return null;
    default:
      return null;
  }
};
