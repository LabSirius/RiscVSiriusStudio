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

  const { enabledEdges, disabledEdges }  = useMemo(() => {
    const calculatedEnabledEdges: string[] = [];

    if (!IFType && !IDType && !IEType && !MEMtype && !WBtype) return { enabledEdges: [], disabledEdges: allEdges };

    calculatedEnabledEdges.push(...conexion.bu_muxD);

    if (
      pipelineValuesStages.EX.BranchResult === "0" ||
      pipelineValuesStages.EX.BranchResult === "X"
    ) {
      calculatedEnabledEdges.push(...conexion.adder4_muxD);
    } else {
      calculatedEnabledEdges.push(...conexion.alu_muxD);
    }

    if (IFType) {
      calculatedEnabledEdges.push(
        ...conexion.muxD_pc,
        ...conexion.pc_adder4,
        ...conexion.four_adder4,
        ...conexion.pc_im,
        ...conexion.im_instID
      );
      switch (IFType) {
        case "I":
          if (pipelineValuesStages.IF.instruction.opcode === "1100111") {
            //JALR
            calculatedEnabledEdges.push(...conexion.adder4_pcIncID);
          }
          break;
        case "J":
          calculatedEnabledEdges.push(...conexion.adder4_pcIncID, ...conexion.pc_pc_ID);

          break;
        case "B":
          calculatedEnabledEdges.push(...conexion.pc_pc_ID);

          break;
        case "U":
          if (pipelineValuesStages.EX.instruction.opcode === "0010111") {
            calculatedEnabledEdges.push(...conexion.pc_pc_ID);
          }

          break;
      }
    }
    if (IDType) {
      calculatedEnabledEdges.push(...conexion._id);
      switch (IDType) {
        case "R":
          calculatedEnabledEdges.push(
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
          calculatedEnabledEdges.push(
            ...conexion.im_rs1,
            ...conexion.im_immGen,
            ...conexion.immSrc_immGen,
            ...conexion.im_opcode,
            ...conexion.im_funct3,
            ...conexion.ru_rurs1_IE,
            ...conexion.immGen_immExit_IE,
            ...conexion.im_rd
          );

          if (pipelineValuesStages.ID.instruction.opcode === "1100111") {
            //JALR
            calculatedEnabledEdges.push(...conexion.pcIncID_pcIncIE);
          }

          break;
        case "S":
          calculatedEnabledEdges.push(
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
          calculatedEnabledEdges.push(
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
          calculatedEnabledEdges.push(
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
          calculatedEnabledEdges.push(
            ...conexion.im_immGen,
            ...conexion.immSrc_immGen,
            ...conexion.im_opcode,
            ...conexion.immGen_immExit_IE,
            ...conexion.im_rd
          );

          if (pipelineValuesStages.ID.instruction.opcode === "0010111") {
            //AUIPC
            calculatedEnabledEdges.push(...conexion.pcID_pcEX);
          }
          break;
      }
    }

    if (IEType) {
      calculatedEnabledEdges.push(
        ...conexion.aluOp_alu,
        ...conexion.brop_bu,
        ...conexion._ie,
        ...conexion.cuIE_cuMEM1,
        ...conexion.cuIE_cuMEM2
      );
      switch (IEType) {
        case "R":
          calculatedEnabledEdges.push(
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
          calculatedEnabledEdges.push(
            ...conexion.aluASrc_muxA,
            ...conexion.rs1_muxA,
            ...conexion.muxA_aluA,
            ...conexion.muxB_aluB,
            ...conexion.aluBSrc_muxB,
            ...conexion.immGen_muxB,
            ...conexion.rdIE_rdMEM
          );

          if (pipelineValuesStages.EX.instruction.opcode === "1100111") {
            //JALR
            calculatedEnabledEdges.push(...conexion.pcIncIE_pcIncMem);
          } else {
            calculatedEnabledEdges.push(...conexion.alu_aluresMem);
          }

          break;

        case "S":
          calculatedEnabledEdges.push(
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
          calculatedEnabledEdges.push(
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
          calculatedEnabledEdges.push(
            ...conexion.aluASrc_muxA,
            ...conexion.pc_muxA,
            ...conexion.muxA_aluA,
            ...conexion.muxB_aluB,
            ...conexion.aluBSrc_muxB,
            ...conexion.immGen_muxB,
            ...conexion.pcIncIE_pcIncMem,
            ...conexion.rdIE_rdMEM
          );
          break;

        case "U":
          calculatedEnabledEdges.push(
            ...conexion.aluBSrc_muxB,
            ...conexion.immGen_muxB,
            ...conexion.rdIE_rdMEM,
            ...conexion.alu_aluresMem
          );

          if (pipelineValuesStages.EX.instruction.opcode === "0110111") {
            //LUI
            calculatedEnabledEdges.push();
          } else {
            calculatedEnabledEdges.push(...conexion.aluASrc_muxA, ...conexion.pc_muxA, ...conexion.muxA_aluA);
          }
          break;
      }
    }

    if (MEMtype) {
      calculatedEnabledEdges.push(...conexion._mem, ...conexion.cuMEM_cuWB);
      switch (MEMtype) {
        case "R":
          calculatedEnabledEdges.push(...conexion.aluResMEM_aluResWB, ...conexion.rdMEM_rdWB);

          break;
        case "I":
          calculatedEnabledEdges.push(...conexion.rdMEM_rdWB);

          //L

          if (pipelineValuesStages.MEM.instruction.opcode === "1100111") {
            //JALR
            calculatedEnabledEdges.push(...conexion.pcIncMEM_pcIncWb);
          } else if (pipelineValuesStages.MEM.instruction.opcode === "0000011") {
            // L
            calculatedEnabledEdges.push(
              ...conexion.aluResMEM_dm,
              ...conexion.dmWr_dm,

              ...conexion.dm_dmDataRdWB,
              ...conexion.dmCtrl_dm
            );
          } else {
            calculatedEnabledEdges.push(...conexion.aluResMEM_aluResWB);
          }

          break;

        case "S":
          calculatedEnabledEdges.push(
            ...conexion.aluResMEM_dm,
            ...conexion.Rurs2MEM_dm,
            ...conexion.dmWr_dm,
            ...conexion.dmCtrl_dm
          );
          break;

        case "J":
          calculatedEnabledEdges.push(...conexion.pcIncMEM_pcIncWb, ...conexion.rdMEM_rdWB);
          break;

        case "U":
          calculatedEnabledEdges.push(...conexion.aluResMEM_aluResWB, ...conexion.rdMEM_rdWB);

          if (pipelineValuesStages.EX.instruction.opcode === "0110111") {
            calculatedEnabledEdges.push();
          } else {
            calculatedEnabledEdges.push(...conexion.aluASrc_muxA, ...conexion.pc_muxA);
          }
          break;
      }
    }

    if (WBtype) {
      calculatedEnabledEdges.push(...conexion._wb);
      console.log("ENTRO");

      switch (WBtype) {
        case "R":
          console.log("ES TIPO R");
          calculatedEnabledEdges.push(
            ...conexion.aluResWB_muxC,
            ...conexion.rdWB_ru,
            ...conexion.ruDataWrSrc_muxC,
            ...conexion.muxC_rd,
            ...conexion.ruWr_ru
          );

          break;
        case "I":
          calculatedEnabledEdges.push(
            ...conexion.rdWB_ru,
            ...conexion.ruDataWrSrc_muxC,
            ...conexion.muxC_rd,
            ...conexion.ruWr_ru
          );

          if (pipelineValuesStages.WB.instruction.opcode === "1100111") {
            //JALR
            calculatedEnabledEdges.push(...conexion.pcIncWB_muxC,);
          } else if (pipelineValuesStages.WB.instruction.opcode === "0000011") {
            calculatedEnabledEdges.push(...conexion.dmDataRdWB_muxC);
          } else {
            calculatedEnabledEdges.push(...conexion.aluResWB_muxC);
          }

          break;

        case "J":
          calculatedEnabledEdges.push(
            ...conexion.pcIncWB_muxC,
            ...conexion.rdWB_ru,
            ...conexion.ruDataWrSrc_muxC,
            ...conexion.muxC_rd,
            ...conexion.ruWr_ru
          );
          break;

        case "U":
          calculatedEnabledEdges.push(
            ...conexion.aluResWB_muxC,
            ...conexion.rdWB_ru,
            ...conexion.ruDataWrSrc_muxC,
            ...conexion.muxC_rd,
            ...conexion.ruWr_ru
          );

          break;
      }
    }

    const enabledSet = new Set(calculatedEnabledEdges);
    const calculatedDisabledEdges = allEdges.filter((edge) => !enabledSet.has(edge));

    return {
        enabledEdges: calculatedEnabledEdges,
        disabledEdges: calculatedDisabledEdges
    };
  }, [pipelineValuesStages]);

  return { enabledEdges, disabledEdges };
};
