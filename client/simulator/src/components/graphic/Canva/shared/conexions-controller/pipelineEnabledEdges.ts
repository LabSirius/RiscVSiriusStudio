import * as conexion from "./dataPipelineConexions";
import { edgeCollector, type EdgeId } from "./datapath-primitives";
import type { PipelineCycleResult } from "@/context/graphic/CurrentInstContext";

// Seam 2 (pipeline): the pure per-stage opcode/signal -> lit-wires mapping,
// lifted out of the `useDataPipelineConexions` memo. No React, no state — given
// the five-stage view it returns the EdgeIds lit this clock.

export const pipelineEnabledEdges = (stages: PipelineCycleResult): Set<EdgeId> => {
  const { edges, add } = edgeCollector();

  const IFType = stages.IF.instruction?.type;
  const IDType = stages.ID.instruction?.type;
  const IEType = stages.EX.instruction?.type;
  const MEMtype = stages.MEM.instruction?.type;
  const WBtype = stages.WB.instruction?.type;

  if (!IFType && !IDType && !IEType && !MEMtype && !WBtype) return edges;

  add(conexion.bu_muxD);

  if (stages.EX.BranchResult === "0" || stages.EX.BranchResult === "X") {
    add(conexion.adder4_muxD);
  } else {
    add(conexion.alu_muxD);
  }

  if (IFType) {
    add(
      conexion.muxD_pc,
      conexion.pc_adder4,
      conexion.four_adder4,
      conexion.pc_im,
      conexion.im_instID
    );
    switch (IFType) {
      case "I":
        if (stages.IF.instruction.opcode === "1100111") {
          //JALR
          add(conexion.adder4_pcIncID);
        }
        break;
      case "J":
        add(conexion.adder4_pcIncID, conexion.pc_pc_ID);
        break;
      case "B":
        add(conexion.pc_pc_ID);
        break;
      case "U":
        if (stages.EX.instruction.opcode === "0010111") {
          add(conexion.pc_pc_ID);
        }
        break;
    }
  }

  if (IDType) {
    add(conexion._id);
    switch (IDType) {
      case "R":
        add(
          conexion.im_rs1,
          conexion.im_rs2,
          conexion.im_opcode,
          conexion.im_funct3,
          conexion.im_funct7,
          conexion.ru_rurs1_IE,
          conexion.ru_rurs2_IE,
          conexion.im_rd
        );
        break;
      case "I":
        add(
          conexion.im_rs1,
          conexion.im_immGen,
          conexion.immSrc_immGen,
          conexion.im_opcode,
          conexion.im_funct3,
          conexion.ru_rurs1_IE,
          conexion.immGen_immExit_IE,
          conexion.im_rd
        );
        if (stages.ID.instruction.opcode === "1100111") {
          //JALR
          add(conexion.pcIncID_pcIncIE);
        }
        break;
      case "S":
        add(
          conexion.im_rs1,
          conexion.im_rs2,
          conexion.im_immGen,
          conexion.immSrc_immGen,
          conexion.im_opcode,
          conexion.im_funct3,
          conexion.ru_rurs1_IE,
          conexion.ru_rurs2_IE,
          conexion.immGen_immExit_IE
        );
        break;
      case "B":
        add(
          conexion.im_rs1,
          conexion.im_rs2,
          conexion.im_immGen,
          conexion.immSrc_immGen,
          conexion.im_opcode,
          conexion.im_funct3,
          conexion.ru_rurs1_IE,
          conexion.ru_rurs2_IE,
          conexion.immGen_immExit_IE,
          conexion.pcID_pcEX
        );
        break;
      case "J":
        add(
          conexion.im_immGen,
          conexion.immSrc_immGen,
          conexion.im_opcode,
          conexion.immGen_immExit_IE,
          conexion.im_rd,
          conexion.pcIncID_pcIncIE,
          conexion.pcID_pcEX
        );
        break;
      case "U":
        add(
          conexion.im_immGen,
          conexion.immSrc_immGen,
          conexion.im_opcode,
          conexion.immGen_immExit_IE,
          conexion.im_rd
        );
        if (stages.ID.instruction.opcode === "0010111") {
          //AUIPC
          add(conexion.pcID_pcEX);
        }
        break;
    }
  }

  if (IEType) {
    add(
      conexion.aluOp_alu,
      conexion.brop_bu,
      conexion._ie,
      conexion.cuIE_cuMEM1,
      conexion.cuIE_cuMEM2
    );
    switch (IEType) {
      case "R":
        add(
          conexion.aluASrc_muxA,
          conexion.rs1_muxA,
          conexion.muxA_aluA,
          conexion.muxB_aluB,
          conexion.aluBSrc_muxB,
          conexion.rs2_muxB,
          conexion.rdIE_rdMEM,
          conexion.alu_aluresMem
        );
        break;
      case "I":
        add(
          conexion.aluASrc_muxA,
          conexion.rs1_muxA,
          conexion.muxA_aluA,
          conexion.muxB_aluB,
          conexion.aluBSrc_muxB,
          conexion.immGen_muxB,
          conexion.rdIE_rdMEM
        );
        if (stages.EX.instruction.opcode === "1100111") {
          //JALR
          add(conexion.pcIncIE_pcIncMem);
        } else {
          add(conexion.alu_aluresMem);
        }
        break;
      case "S":
        add(
          conexion.aluASrc_muxA,
          conexion.rs1_muxA,
          conexion.muxA_aluA,
          conexion.muxB_aluB,
          conexion.aluBSrc_muxB,
          conexion.immGen_muxB,
          conexion.rs2_ruRs2Mem,
          conexion.alu_aluresMem
        );
        break;
      case "B":
        add(
          conexion.aluASrc_muxA,
          conexion.pc_muxA,
          conexion.muxA_aluA,
          conexion.muxB_aluB,
          conexion.aluBSrc_muxB,
          conexion.immGen_muxB,
          conexion.RUrs1_bu,
          conexion.RUrs2_bu
        );
        break;
      case "J":
        add(
          conexion.aluASrc_muxA,
          conexion.pc_muxA,
          conexion.muxA_aluA,
          conexion.muxB_aluB,
          conexion.aluBSrc_muxB,
          conexion.immGen_muxB,
          conexion.pcIncIE_pcIncMem,
          conexion.rdIE_rdMEM
        );
        break;
      case "U":
        add(
          conexion.aluBSrc_muxB,
          conexion.immGen_muxB,
          conexion.rdIE_rdMEM,
          conexion.alu_aluresMem
        );
        if (stages.EX.instruction.opcode === "0110111") {
          //LUI
          add();
        } else {
          add(conexion.aluASrc_muxA, conexion.pc_muxA, conexion.muxA_aluA);
        }
        break;
    }
  }

  if (MEMtype) {
    add(conexion._mem, conexion.cuMEM_cuWB);
    switch (MEMtype) {
      case "R":
        add(conexion.aluResMEM_aluResWB, conexion.rdMEM_rdWB);
        break;
      case "I":
        add(conexion.rdMEM_rdWB);
        if (stages.MEM.instruction.opcode === "1100111") {
          //JALR
          add(conexion.pcIncMEM_pcIncWb);
        } else if (stages.MEM.instruction.opcode === "0000011") {
          // L
          add(
            conexion.aluResMEM_dm,
            conexion.dmWr_dm,
            conexion.dm_dmDataRdWB,
            conexion.dmCtrl_dm
          );
        } else {
          add(conexion.aluResMEM_aluResWB);
        }
        break;
      case "S":
        add(
          conexion.aluResMEM_dm,
          conexion.Rurs2MEM_dm,
          conexion.dmWr_dm,
          conexion.dmCtrl_dm
        );
        break;
      case "J":
        add(conexion.pcIncMEM_pcIncWb, conexion.rdMEM_rdWB);
        break;
      case "U":
        add(conexion.aluResMEM_aluResWB, conexion.rdMEM_rdWB);
        if (stages.EX.instruction.opcode === "0110111") {
          add();
        } else {
          add(conexion.aluASrc_muxA, conexion.pc_muxA);
        }
        break;
    }
  }

  if (WBtype) {
    add(conexion._wb);

    switch (WBtype) {
      case "R":
        add(
          conexion.aluResWB_muxC,
          conexion.rdWB_ru,
          conexion.ruDataWrSrc_muxC,
          conexion.muxC_rd,
          conexion.ruWr_ru
        );
        break;
      case "I":
        add(
          conexion.rdWB_ru,
          conexion.ruDataWrSrc_muxC,
          conexion.muxC_rd,
          conexion.ruWr_ru
        );
        if (stages.WB.instruction.opcode === "1100111") {
          //JALR
          add(conexion.pcIncWB_muxC);
        } else if (stages.WB.instruction.opcode === "0000011") {
          add(conexion.dmDataRdWB_muxC);
        } else {
          add(conexion.aluResWB_muxC);
        }
        break;
      case "J":
        add(
          conexion.pcIncWB_muxC,
          conexion.rdWB_ru,
          conexion.ruDataWrSrc_muxC,
          conexion.muxC_rd,
          conexion.ruWr_ru
        );
        break;
      case "U":
        add(
          conexion.aluResWB_muxC,
          conexion.rdWB_ru,
          conexion.ruDataWrSrc_muxC,
          conexion.muxC_rd,
          conexion.ruWr_ru
        );
        break;
    }
  }

  return edges;
};
