import { useMemo } from "react";
import { useCurrentInst } from "@/context/graphic/CurrentInstContext";
import * as conexion from "./dataMonocycleConexions";

const allConexions = Object.values(conexion);
const allEdges = [...new Set(allConexions.flat())];

export const useDataMonocycleConexions = () => {
  const { currentMonocycletInst, currentMonocycleResult, setCurrentType } = useCurrentInst();



  const disabledEdges = useMemo(() => {
    if (!currentMonocycletInst) return [];

    let enabledEdges: string[] = [];
    const currentInstruction = currentMonocycletInst;

    switch (currentInstruction.type) {
      case "R":
        setCurrentType("R");
        enabledEdges = [
          ...conexion.adder4_muxD,
          ...conexion.bu_muxD,

          ...conexion.muxD_pc,

          ...conexion.pc_adder4,
          ...conexion.four_adder4,
          ...conexion.pc_im,

          ...conexion.im_opcode,
          ...conexion.im_funct3,
          ...conexion.im_funct7,

          ...conexion.im_rs1,
          ...conexion.im_rs2,
          ...conexion.im_rd,
          ...conexion.muxC_rd,
          ...conexion.RUWr_wb,

          ...conexion.rs1_muxA,
          ...conexion.aluASrc_muxA,
          ...conexion.rs2_muxB,
          ...conexion.aluBSrc_muxB,

          ...conexion.muxA_aluA,
          ...conexion.muxB_aluB,
          ...conexion.aluOp_alu,

          ...conexion.brOp_bu,

          ...conexion.alu_muxC,
          ...conexion.ruDataWrSrc_muxC,
        ];
        break;

      case "I":
        if (currentInstruction.opcode === "0010011") {
          setCurrentType("I");
          enabledEdges = [
            ...conexion.adder4_muxD,
            ...conexion.bu_muxD,

            ...conexion.muxD_pc,

            ...conexion.pc_adder4,
            ...conexion.four_adder4,
            ...conexion.pc_im,

            ...conexion.im_opcode,
            ...conexion.im_funct3,

            ...conexion.im_rs1,
            ...conexion.im_rd,
            ...conexion.muxC_rd,
            ...conexion.RUWr_wb,

            ...conexion.im_immGen,
            ...conexion.immSrc_immGen,

            ...conexion.rs1_muxA,
            ...conexion.aluASrc_muxA,

            ...conexion.immGen_muxB,
            ...conexion.aluBSrc_muxB,

            ...conexion.muxA_aluA,
            ...conexion.muxB_aluB,
            ...conexion.aluOp_alu,

            ...conexion.brOp_bu,

            ...conexion.alu_muxC,
            ...conexion.ruDataWrSrc_muxC,
          ];
        } else if (currentInstruction.opcode === "0000011") {
          setCurrentType("L");
          enabledEdges = [
            ...conexion.adder4_muxD,
            ...conexion.bu_muxD,

            ...conexion.muxD_pc,

            ...conexion.pc_adder4,
            ...conexion.four_adder4,

            ...conexion.pc_im,

            ...conexion.im_opcode,
            ...conexion.im_funct3,

            ...conexion.im_rs1,
            ...conexion.im_rd,
            ...conexion.muxC_rd,
            ...conexion.RUWr_wb,

            ...conexion.im_immGen,
            ...conexion.immSrc_immGen,

            ...conexion.rs1_muxA,
            ...conexion.aluASrc_muxA,

            ...conexion.immGen_muxB,
            ...conexion.aluBSrc_muxB,

            ...conexion.muxA_aluA,
            ...conexion.muxB_aluB,
            ...conexion.aluOp_alu,

            ...conexion.brOp_bu,

            ...conexion.alu_dm,
            ...conexion.dmWr_dm,
            ...conexion.dmCtrl_dm,

            ...conexion.dm_muxC,

            ...conexion.ruDataWrSrc_muxC,
          ];
        } else if (currentInstruction.opcode === "1100111") {
          setCurrentType("JALR");
          enabledEdges = [
            ...conexion.alu_muxD,
            ...conexion.bu_muxD,

            ...conexion.muxD_pc,

            ...conexion.pc_adder4,
            ...conexion.four_adder4,

            ...conexion.pc_im,

            ...conexion.im_opcode,
            ...conexion.im_funct3,

            ...conexion.im_rs1,
            ...conexion.im_rd,
            ...conexion.muxC_rd,
            ...conexion.RUWr_wb,

            ...conexion.im_immGen,
            ...conexion.immSrc_immGen,

            ...conexion.rs1_muxA,
            ...conexion.aluASrc_muxA,

            ...conexion.immGen_muxB,
            ...conexion.aluBSrc_muxB,

            ...conexion.muxA_aluA,
            ...conexion.muxB_aluB,
            ...conexion.aluOp_alu,

            ...conexion.brOp_bu,

            ...conexion.adder4_muxC,

            ...conexion.ruDataWrSrc_muxC,
          ];
        }
        break;

      case "S":
        setCurrentType("S");
        enabledEdges = [
          ...conexion.adder4_muxD,
          ...conexion.bu_muxD,

          ...conexion.muxD_pc,

          ...conexion.pc_adder4,
          ...conexion.four_adder4,

          ...conexion.pc_im,

          ...conexion.im_opcode,
          ...conexion.im_funct3,

          ...conexion.im_rs1,
          ...conexion.im_rs2,

          ...conexion.im_immGen,
          ...conexion.immSrc_immGen,

          ...conexion.rs1_muxA,
          ...conexion.aluASrc_muxA,

          ...conexion.immGen_muxB,
          ...conexion.aluBSrc_muxB,

          ...conexion.muxA_aluA,
          ...conexion.muxB_aluB,
          ...conexion.aluOp_alu,

          ...conexion.brOp_bu,

          ...conexion.alu_dm,
          ...conexion.rs2_dm,
          ...conexion.dmWr_dm,
          ...conexion.dmCtrl_dm,
        ];
        break;

      case "B": // BEQ, BNE, etc.
        setCurrentType("B");
        enabledEdges = [
          ...conexion.bu_muxD,

          ...conexion.muxD_pc,

          ...conexion.pc_adder4,
          ...conexion.four_adder4,

          ...conexion.pc_im,

          ...conexion.im_opcode,
          ...conexion.im_funct3,

          ...conexion.im_rs1,
          ...conexion.im_rs2,

          ...conexion.im_immGen,
          ...conexion.immSrc_immGen,

          ...conexion.pc_muxA,
          ...conexion.aluASrc_muxA,

          ...conexion.immGen_muxB,
          ...conexion.aluBSrc_muxB,

          ...conexion.muxA_aluA,
          ...conexion.muxB_aluB,
          ...conexion.aluOp_alu,

          ...conexion.rs1_bu,
          ...conexion.rs2_bu,
          ...conexion.brOp_bu,
        ];
        if (currentMonocycleResult.buMux.signal === "1") {
          enabledEdges.push(...conexion.alu_muxD);
        } else {
          enabledEdges.push(...conexion.adder4_muxD);
        }
        break;

      case "J": // JAL
        setCurrentType("J");
        enabledEdges = [
          ...conexion.alu_muxD,
          ...conexion.bu_muxD,

          ...conexion.muxD_pc,

          ...conexion.pc_adder4,
          ...conexion.four_adder4,

          ...conexion.pc_im,

          ...conexion.im_opcode,

          ...conexion.im_rd,
          ...conexion.muxC_rd,
          ...conexion.RUWr_wb,

          ...conexion.im_immGen,
          ...conexion.immSrc_immGen,

          ...conexion.pc_muxA,
          ...conexion.aluASrc_muxA,

          ...conexion.immGen_muxB,
          ...conexion.aluBSrc_muxB,

          ...conexion.muxA_aluA,
          ...conexion.muxB_aluB,
          ...conexion.aluOp_alu,

          ...conexion.brOp_bu,

          ...conexion.adder4_muxC,
          ...conexion.ruDataWrSrc_muxC,
        ];
        break;

      case "U":
        if (currentInstruction.opcode === "0110111") {
          // LUI
          setCurrentType("LUI");
          enabledEdges = [
            ...conexion.adder4_muxD,
            ...conexion.bu_muxD,

            ...conexion.muxD_pc,

            ...conexion.pc_adder4,
            ...conexion.four_adder4,

            ...conexion.pc_im,

            ...conexion.im_opcode,

            ...conexion.im_rd,
            ...conexion.muxC_rd,
            ...conexion.RUWr_wb,

            ...conexion.im_immGen,
            ...conexion.immSrc_immGen,

            ...conexion.immGen_muxB,
            ...conexion.aluBSrc_muxB,

            ...conexion.muxB_aluB,
            ...conexion.aluOp_alu,

            ...conexion.brOp_bu,

            ...conexion.alu_muxC,
            ...conexion.ruDataWrSrc_muxC,
          ];
        } else if (currentInstruction.opcode === "0010111") {
          // AUIPC
          setCurrentType("AUIPC");
          enabledEdges = [
            ...conexion.adder4_muxD,
            ...conexion.bu_muxD,

            ...conexion.muxD_pc,

            ...conexion.pc_adder4,
            ...conexion.four_adder4,

            ...conexion.pc_im,

            ...conexion.im_opcode,

            ...conexion.im_rd,
            ...conexion.muxC_rd,
            ...conexion.RUWr_wb,

            ...conexion.im_immGen,
            ...conexion.immSrc_immGen,

            ...conexion.pc_muxA,
            ...conexion.aluASrc_muxA,

            ...conexion.immGen_muxB,
            ...conexion.aluBSrc_muxB,

            ...conexion.muxB_aluB,
            ...conexion.aluOp_alu,

            ...conexion.brOp_bu,

            ...conexion.alu_muxC,
            ...conexion.ruDataWrSrc_muxC,
          ];
        }
        break;
    }

    

    const enabledSet = new Set(enabledEdges);
    return allEdges.filter((edge) => !enabledSet.has(edge));
  }, [currentMonocycletInst, currentMonocycleResult, setCurrentType]);

  return disabledEdges;
};
