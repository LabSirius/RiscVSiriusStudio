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

  const disabledEdges = useMemo(() => {
    const enabledEdges: string[] = [];

    if (IFType) {
      enabledEdges.push(
        ...conexion.muxD_pc,
        ...conexion.pc_adder4,
        ...conexion.four_adder4,
        ...conexion.pc_im,
        ...conexion.im_instID,
        ...conexion.pc_pc_ID,
        ...conexion.adder4_pcIncID
      );
    }

    if (IDType) {
      enabledEdges.push(...conexion.pcIncID_pcIncIE, ...conexion.pcID_pcEX);

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
            ...conexion.immGen_immExit_IE
          );
          break;
        case "J":
          enabledEdges.push(
            ...conexion.im_immGen,
            ...conexion.immSrc_immGen,
            ...conexion.im_opcode,
            ...conexion.immGen_immExit_IE,
            ...conexion.im_rd
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

          break;
      }
    } 




    if (IEType) {
       enabledEdges.push(
        ...conexion.pcIncID_pcIncIE,
        ...conexion.pcID_pcEX,
        ...conexion.immGen_immExit_IE,
        ...conexion.pcIncIE_pcIncMem,
        ...conexion.rdIE_rdMEM
      );
    }

    switch (IEType) {
      case "R":
        enabledEdges.push(
          ...conexion.aluASrc_muxA,
          ...conexion.rs1_muxA,
          ...conexion.aluBSrc_muxB,
          ...conexion.rs2_muxB
        );

        break;
      case "I":
        enabledEdges.push(
          ...conexion.aluASrc_muxA,
          ...conexion.rs1_muxA,
          ...conexion.aluBSrc_muxB,
          ...conexion.immGen_muxB
        );

        break;

      case "S":
        enabledEdges.push(
          ...conexion.aluASrc_muxA,
          ...conexion.rs1_muxA,
          ...conexion.aluBSrc_muxB,
          ...conexion.immGen_muxB
        );
        break;

      case "B":
        enabledEdges.push(
          ...conexion.aluASrc_muxA,
          ...conexion.pc_muxA,
          ...conexion.aluBSrc_muxB,
          ...conexion.immGen_muxB
        );
        break;

      case "J":
        enabledEdges.push(
          ...conexion.aluASrc_muxA,
          ...conexion.pc_muxA,
          ...conexion.aluBSrc_muxB,
          ...conexion.immGen_muxB
        );
        break;

      case "U":
        enabledEdges.push(...conexion.aluBSrc_muxB, ...conexion.immGen_muxB);

        if (pipelineValuesStages.EX.instruction.opcode === "0110111") {
          enabledEdges.push();
        } else {
          enabledEdges.push(...conexion.aluASrc_muxA, ...conexion.pc_muxA);
        }
        break;
    }

    

    const enabledSet = new Set(enabledEdges);
    return allEdges.filter((edge) => !enabledSet.has(edge));
  }, [IFType, IDType, IEType]);

  return disabledEdges;
};
