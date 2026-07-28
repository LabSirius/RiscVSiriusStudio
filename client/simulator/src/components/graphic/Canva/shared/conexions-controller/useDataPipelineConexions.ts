import { useMemo } from "react";
import { useCurrentInst } from "@/context/graphic/CurrentInstContext";
import * as conexion from "./dataPipelineConexions";
import { allEdgesOf, computeDisabledEdges } from "./datapath-primitives";
import { pipelineEnabledEdges } from "./pipelineEnabledEdges";

const allEdges = allEdgesOf(conexion);

// Thin controller: call the pure kernel, diff against all edges, set state.
export const useDataPipelineConexions = () => {
  const { pipelineValuesStages } = useCurrentInst();

  return useMemo(() => {
    const enabled = pipelineEnabledEdges(pipelineValuesStages);
    return {
      enabledEdges: [...enabled],
      disabledEdges: computeDisabledEdges(allEdges, enabled),
    };
  }, [pipelineValuesStages]);
};
