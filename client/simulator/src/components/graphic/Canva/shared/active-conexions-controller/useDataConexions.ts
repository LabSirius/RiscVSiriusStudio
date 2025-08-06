import { useMemo } from 'react';
import { useSimulator } from '@/context/shared/SimulatorContext';
import { useCurrentInst } from '@/context/graphic/CurrentInstContext';
import * as conexion from './dataConexions';

export const useDataConexions = () => {
  const { typeSimulator } = useSimulator();
  const { currentInst, currentResult, setCurrentType } = useCurrentInst();

  const disabledEdges = useMemo(() => {
    if (!currentInst) return [];
    
    let targetEdges: string[] = [];
    const currentInstruction = currentInst;

    switch (currentInstruction.type) {
      case "R":
        setCurrentType("R");
        targetEdges = [
          ...conexion.muxARouteEdges,
          ...conexion.noImmediateEdges,
          ...conexion.muxBRouteEdges_R,
          ...conexion.bypassBranchUnitEdges,
          ...conexion.memoryReadEdges,
          ...conexion.muxCRouteEdges_R,
          ...conexion.muxDRouteEdges_R,
        ];
        break;
      case "I":
        if (currentInstruction.opcode === "0010011") {
          setCurrentType("I");
          targetEdges = [
            ...conexion.skipFunct7Edges,
            ...conexion.skipRS2Edges,
            ...conexion.muxARouteEdges,
            ...conexion.muxBRouteEdges_I,
            ...conexion.muxCRouteEdges_R,
            ...conexion.muxDRouteEdges_R,
            ...conexion.bypassBranchUnitEdges,
            ...conexion.memoryReadEdges,
          ];
        } else if (currentInstruction.opcode === "0000011") {
          setCurrentType("L");
          targetEdges = [
            ...conexion.skipFunct7Edges,
            ...conexion.skipRS2Edges,
            ...conexion.muxARouteEdges,
            ...conexion.muxBRouteEdges_I,
            ...conexion.muxCRouteEdges_R.slice(1),
            ...conexion.muxCRouteExtraEdges_L,
            ...conexion.muxDRouteEdges_R,
            ...conexion.bypassBranchUnitEdges,
            ...conexion.skipRS2MemoryEdges,
          ];
        } else if (currentInstruction.opcode === "1100111") {
          setCurrentType("JALR");
          targetEdges = [
            ...conexion.skipFunct7Edges,
            ...conexion.skipRS2Edges,
            ...conexion.muxARouteEdges,
            ...conexion.muxBRouteEdges_I,
            ...conexion.muxCRouteExtraEdges_JALR,
            ...conexion.muxDRouteEdges_JALR,
            ...conexion.bypassBranchUnitEdges,
            ...conexion.fullMemoryAccessEdges,
          ];
        }
        break;
      case "S":
        setCurrentType("S");
        targetEdges = [
          ...conexion.skipFunct7Edges,
          ...conexion.skipRDEdges,
          ...conexion.muxARouteEdges,
          ...conexion.muxBRouteEdges_I.slice(1),
          ...conexion.muxCRouteEdges_R,
          ...conexion.muxCRouteExtraEdges_L,
          ...conexion.muxDRouteEdges_R,
          ...conexion.bypassBranchUnitEdges,
          ...conexion.bypassWriteBackEdges,
        ];
        break;
      case "B":
        setCurrentType("B");
        targetEdges = [
          ...conexion.skipFunct7Edges,
          ...conexion.skipRDEdges,
          'pivot4->muxA', 
          ...conexion.muxBRouteEdges_I.slice(1),
          ...conexion.memoryReadEdges,
          ...conexion.bypassWriteBackEdges,
        ];

        if (currentResult.buMux.signal === '0') {
          targetEdges = [
            ...targetEdges,
            ...conexion.muxDRouteEdges_R,
            'alu->pivot7', 
          ];
        } else {
          targetEdges = [
            'adder4->pivot18', 
            ...targetEdges,
            ...conexion.muxDRouteEdges_JALR,
          ];
        }
        break;
      case "J":
        setCurrentType("J");
        targetEdges = [
          ...conexion.skipFunct7Edges,
          ...conexion.skipFunct3Edges,
          ...conexion.skipRS1Edges,
          ...conexion.skipRS1InputEdges,
          'pivot22->pivot20', 
          ...conexion.skipRS2Edges,
          ...conexion.muxBRouteEdges_I,
          ...conexion.muxCRouteExtraEdges_JALR,
          ...conexion.muxDRouteEdges_JALR,
          ...conexion.bypassBranchUnitEdges,
          ...conexion.fullMemoryAccessEdges,
        ];
        break;
      case "U":
        if (currentInstruction.opcode === "0110111") {
          setCurrentType("LUI");
          targetEdges = [
            ...conexion.skipFunct7Edges,
            ...conexion.skipFunct3Edges,
            ...conexion.skipRS2Edges,
            'pivot22->pivot20', 
            ...conexion.skipRS1InputEdges,
            ...conexion.skipRS1Edges,
            ...conexion.muxARouteEdges,
            ...conexion.skipMuxA,
            ...conexion.skipMuxAOutputEdges,
            ...conexion.muxBRouteEdges_I,
            ...conexion.muxCRouteEdges_R,
            ...conexion.muxDRouteEdges_R,
            ...conexion.bypassBranchUnitEdges,
            ...conexion.memoryReadEdges,
          ];
        } else if (currentInstruction.opcode === "0010111") {
          setCurrentType("AUIPC");
          targetEdges = [
            ...conexion.skipFunct7Edges,
            ...conexion.skipFunct3Edges,
            ...conexion.skipRS2Edges,
            'pivot22->pivot20', 
            ...conexion.skipRS1InputEdges,
            ...conexion.skipRS1Edges,
            ...conexion.skipMuxAOutputEdges,
            ...conexion.muxBRouteEdges_I,
            ...conexion.muxCRouteEdges_R,
            ...conexion.muxDRouteEdges_R,
            ...conexion.bypassBranchUnitEdges,
            ...conexion.memoryReadEdges,
          ];
        }
        break;
      default:
        break;
    }
    
    if (typeSimulator === 'pipeline') {
        // LOGIC
    }

    return targetEdges;
  }, [currentInst, currentResult, typeSimulator, setCurrentType]);

  return disabledEdges;
};