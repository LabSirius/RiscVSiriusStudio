import { useMemo } from "react";
import { useCurrentInst } from "@/context/graphic/CurrentInstContext";
import * as conexion from "./dataPipelineConexions";

const allConexions = Object.values(conexion);
const allEdges = [...new Set(allConexions.flat())];

export const useDataPipelineConexions = () => {
  const { pipelineValuesStages } = useCurrentInst();

  const IFType = pipelineValuesStages.IF.instruction?.type;
  const IDType = pipelineValuesStages.ID.instruction?.type;
  const IEType = pipelineValuesStages.EX.instruction?.type;
  const MEMtype = pipelineValuesStages.MEM.instruction?.type;
  const WBtype = pipelineValuesStages.WB.instruction?.type;

  const disabledEdges = useMemo(() => {
    const enabledEdges: string[] = [];

    if (!IFType && !IDType && !IEType && !MEMtype && !WBtype) return [];

    enabledEdges.push(...conexion.bu_muxD);

    if (
      pipelineValuesStages.EX.BranchResult === "0" ||
      pipelineValuesStages.EX.BranchResult === "X"
    ) {
      enabledEdges.push(...conexion.adder4_muxD);
    } else {
      enabledEdges.push(...conexion.alu_muxD);
    }

    if (IFType) {
      enabledEdges.push(
        ...conexion.muxD_pc,
        ...conexion.pc_adder4,
        ...conexion.four_adder4,
        ...conexion.pc_im,
        ...conexion.im_instID
      );

      switch (IFType) {
        case "J":
          enabledEdges.push(...conexion.adder4_pcIncID, ...conexion.pc_pc_ID);

          break;
        case "B":
          enabledEdges.push(...conexion.pc_pc_ID);

          break;
        case "U":
          if (pipelineValuesStages.EX.instruction.opcode === "0010111") {
            enabledEdges.push(...conexion.pc_pc_ID);
          }

          break;
      }
    }
    if (IDType) {

      enabledEdges.push(...conexion._id)
      switch (IDType) {
        case "R":
          enabledEdges.push(
            ...conexion.im_rs1,
            ...conexion.im_rs2,
            ...conexion.im_opcode,
            ...conexion.im_funct3,
            ...conexion.im_funct7,
            ...conexion.ru_rurs1_IE,
            ...conexion.ru_rurs2_IE,
            ...conexion.im_rd
          );
          break;
        case "I":
          enabledEdges.push(
            ...conexion.im_rs1,
            ...conexion.im_immGen,
            ...conexion.immSrc_immGen,
            ...conexion.im_opcode,
            ...conexion.im_funct3,
            ...conexion.ru_rurs1_IE,
            ...conexion.immGen_immExit_IE,
            ...conexion.im_rd
          );
          break;
        case "S":
          enabledEdges.push(
            ...conexion.im_rs1,
            ...conexion.im_rs2,
            ...conexion.im_immGen,
            ...conexion.immSrc_immGen,
            ...conexion.im_opcode,
            ...conexion.im_funct3,
            ...conexion.ru_rurs1_IE,
            ...conexion.ru_rurs2_IE,
            ...conexion.immGen_immExit_IE
          );
          break;
        case "B":
          enabledEdges.push(
            ...conexion.im_rs1,
            ...conexion.im_rs2,
            ...conexion.im_immGen,
            ...conexion.immSrc_immGen,
            ...conexion.im_opcode,
            ...conexion.im_funct3,
            ...conexion.ru_rurs1_IE,
            ...conexion.ru_rurs2_IE,
            ...conexion.immGen_immExit_IE,
            ...conexion.pcID_pcEX
          );
          break;
        case "J":
          enabledEdges.push(
            ...conexion.im_immGen,
            ...conexion.immSrc_immGen,
            ...conexion.im_opcode,
            ...conexion.immGen_immExit_IE,
            ...conexion.im_rd,
            ...conexion.pcIncID_pcIncIE,
            ...conexion.pcID_pcEX
          );
          break;
        case "U":
          enabledEdges.push(
            ...conexion.im_immGen,
            ...conexion.immSrc_immGen,
            ...conexion.im_opcode,
            ...conexion.immGen_immExit_IE,
            ...conexion.im_rd
          );

          if (pipelineValuesStages.ID.instruction.opcode === "0010111") {
            //AUIPC
            enabledEdges.push(...conexion.pcID_pcEX);
          }
          break;
      }
    }

    if (IEType) {
      enabledEdges.push(...conexion.aluOp_alu, ...conexion.brop_bu, ...conexion._ie, ...conexion.cuIE_cuMEM1, ...conexion.cuIE_cuMEM2);
      switch (IEType) {
        case "R":
          enabledEdges.push(
            ...conexion.aluASrc_muxA,
            ...conexion.rs1_muxA,
            ...conexion.muxA_aluA,
            ...conexion.muxB_aluB,
            ...conexion.aluBSrc_muxB,
            ...conexion.rs2_muxB,
            ...conexion.rdIE_rdMEM,
            ...conexion.alu_aluresMem
          );

          break;
        case "I":
          enabledEdges.push(
            ...conexion.aluASrc_muxA,
            ...conexion.rs1_muxA,
            ...conexion.muxA_aluA,
            ...conexion.muxB_aluB,
            ...conexion.aluBSrc_muxB,
            ...conexion.immGen_muxB,
            ...conexion.rdIE_rdMEM,
            ...conexion.alu_aluresMem
          );

          break;

        case "S":
          enabledEdges.push(
            ...conexion.aluASrc_muxA,
            ...conexion.rs1_muxA,
            ...conexion.muxA_aluA,
            ...conexion.muxB_aluB,
            ...conexion.aluBSrc_muxB,
            ...conexion.immGen_muxB,
            ...conexion.rs2_ruRs2Mem,
            ...conexion.alu_aluresMem
          );
          break;

        case "B":
          enabledEdges.push(
            ...conexion.aluASrc_muxA,
            ...conexion.pc_muxA,
            ...conexion.muxA_aluA,
            ...conexion.muxB_aluB,
            ...conexion.aluBSrc_muxB,
            ...conexion.immGen_muxB,
            ...conexion.RUrs1_bu,
            ...conexion.RUrs2_bu
          );
          break;

        case "J":
          enabledEdges.push(
            ...conexion.aluASrc_muxA,
            ...conexion.pc_muxA,
            ...conexion.muxA_aluA,
            ...conexion.muxB_aluB,
            ...conexion.aluBSrc_muxB,
            ...conexion.immGen_muxB,
            ...conexion.pcIncIE_pcIncMem,
            ...conexion.rdIE_rdMEM,
            ...conexion.alu_aluresMem
          );
          break;

        case "U":
          enabledEdges.push(
            ...conexion.aluBSrc_muxB,
            ...conexion.immGen_muxB,
            ...conexion.rdIE_rdMEM,
            ...conexion.alu_aluresMem
          );

          if (pipelineValuesStages.EX.instruction.opcode === "0110111") {
            //LUI
            enabledEdges.push();
          } else {
            enabledEdges.push(...conexion.aluASrc_muxA, ...conexion.pc_muxA, ...conexion.muxA_aluA);
          }
          break;
      }
    }

    if (MEMtype) {
      enabledEdges.push(...conexion._mem, ...conexion.cuMEM_cuWB)
      switch (MEMtype) {
        case "R":
          enabledEdges.push(...conexion.aluResMEM_aluResWB, ...conexion.rdMEM_rdWB);

          break;
        case "I":
          enabledEdges.push(...conexion.rdMEM_rdWB);

          //L
          if (pipelineValuesStages.MEM.instruction.opcode === "0000011") {
            enabledEdges.push(
              ...conexion.aluResMEM_dm,
              ...conexion.dmWr_dm,

              ...conexion.dm_dmDataRdWB,
              ...conexion.dmCtrl_dm
            );
          } else {
            enabledEdges.push(...conexion.aluResMEM_aluResWB);
          }

          break;

        case "S":
          enabledEdges.push(
            ...conexion.aluResMEM_dm,
            ...conexion.Rurs2MEM_dm,
            ...conexion.dmWr_dm,
            ...conexion.dmCtrl_dm
          );
          break;

        case "J":
          enabledEdges.push(...conexion.pcIncMEM_pcIncWb, ...conexion.rdMEM_rdWB);
          break;

        case "U":
          enabledEdges.push(...conexion.aluResMEM_aluResWB, ...conexion.rdMEM_rdWB);

          if (pipelineValuesStages.EX.instruction.opcode === "0110111") {
            enabledEdges.push();
          } else {
            enabledEdges.push(...conexion.aluASrc_muxA, ...conexion.pc_muxA);
          }
          break;
      }
    }

    if (WBtype) {
      enabledEdges.push(...conexion._wb)
      switch (WBtype) {
        case "R":
          enabledEdges.push(
            ...conexion.aluResWB_muxC,
            ...conexion.rdWB_ru,
            ...conexion.ruDataWrSrc_muxC,
            ...conexion.muxC_rd
          );

          break;
        case "I":
          enabledEdges.push(...conexion.rdWB_ru, ...conexion.ruDataWrSrc_muxC, ...conexion.muxC_rd);

          if (pipelineValuesStages.WB.instruction.opcode === "0000011") {
            enabledEdges.push(...conexion.dmDataRdWB_muxC);
          } else {
            enabledEdges.push(...conexion.aluResWB_muxC);
          }

          break;

        case "J":
          enabledEdges.push(
            ...conexion.pcID_muxC,
            ...conexion.rdWB_ru,
            ...conexion.ruDataWrSrc_muxC,
            ...conexion.muxC_rd
          );
          break;

        case "U":
          enabledEdges.push(
            ...conexion.aluResWB_muxC,
            ...conexion.rdWB_ru,
            ...conexion.ruDataWrSrc_muxC,
            ...conexion.muxC_rd
          );

          break;
      }
    }

    const enabledSet = new Set(enabledEdges);
    return allEdges.filter((edge) => !enabledSet.has(edge));
  }, [IFType, IDType, IEType]);

  return disabledEdges;
};
