import { useMemo } from "react";
import { useCurrentInst } from "@/context/graphic/CurrentInstContext";
import * as conexion from "./dataPipelineConexions";

const allConexions = Object.values(conexion);
const allEdges = [...new Set(allConexions.flat())];

export const useDataPipelineConexions = () => {
  const { pipelineValuesStages } = useCurrentInst();

  const IFType = pipelineValuesStages.IF.instruction.type;
  const IDType = pipelineValuesStages.ID.instruction.type;

  console.log("ID TYPE", pipelineValuesStages.ID.instruction)

  const disabledEdges = useMemo(() => {
    let enabledEdges: string[] = [];

    if (!IFType && !IDType) return [];

    switch (IFType) {
      case "R":
      case "I":
      case "L":
      case "S":
      case "B":
      case "J":
      case "U":
        enabledEdges = [
          ...conexion.muxD_pc,

          ...conexion.pc_adder4,
          ...conexion.four_adder4,
          ...conexion.pc_im,

          ...conexion.im_instID,
          ...conexion.pc_pc_ID,
          ...conexion.adder4_pcIncID,
        ];
        break;
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
            ...conexion.im_funct7
          );
          break;
        case "I":
          enabledEdges.push(
            ...conexion.im_rs1,
            ...conexion.im_immGen,
            ...conexion.immSrc_immGen,
            ...conexion.im_opcode,
            ...conexion.im_funct3
        );

          break;

        case "S":
          enabledEdges.push(
            ...conexion.im_rs1,
            ...conexion.im_rs2,
            ...conexion.im_immGen,
            ...conexion.immSrc_immGen,
            ...conexion.im_opcode,
            ...conexion.im_funct3
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
          );
          break;

        case "J":
          enabledEdges.push(

            ...conexion.im_immGen,
            ...conexion.immSrc_immGen,
            ...conexion.im_opcode
          );
          break;
      }
    }

    const enabledSet = new Set(enabledEdges);
    return allEdges.filter((edge) => !enabledSet.has(edge));
  }, [IFType, IDType]);

  return disabledEdges;
};
