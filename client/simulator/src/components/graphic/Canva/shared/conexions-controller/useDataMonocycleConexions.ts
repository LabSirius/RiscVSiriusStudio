import { useEffect, useMemo } from "react";
import { useCurrentInst } from "@/context/graphic/CurrentInstContext";
import * as conexion from "./dataMonocycleConexions";
import { allEdgesOf, computeDisabledEdges } from "./datapath-primitives";
import { monocycleCurrentType, monocycleEnabledEdges } from "./monocycleEnabledEdges";

const allEdges = allEdgesOf(conexion);

// Thin controller: call the pure kernel, diff against all edges, and push the
// instruction-type label to context via an effect (never inside the memo).
export const useDataMonocycleConexions = () => {
  const { currentMonocycletInst, currentMonocycleResult, setCurrentType } = useCurrentInst();

  useEffect(() => {
    const type = monocycleCurrentType(currentMonocycletInst);
    if (type !== null) setCurrentType(type);
  }, [currentMonocycletInst, setCurrentType]);

  return useMemo(() => {
    const enabled = monocycleEnabledEdges(currentMonocycletInst, currentMonocycleResult);
    return {
      enabledEdges: [...enabled],
      disabledEdges: computeDisabledEdges(allEdges, enabled),
    };
  }, [currentMonocycletInst, currentMonocycleResult]);
};
