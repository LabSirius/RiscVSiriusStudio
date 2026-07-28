// src/hooks/graphic/pipeline/useUpdatePipelineTable.ts

import { useEffect, MutableRefObject } from "react";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import type { PipelineStages } from "@protocol/datapath-view";

interface UseUpdatePipelineTableProps {
  tabulatorInstance: MutableRefObject<Tabulator | null>;
  pipelineValuesStages: PipelineStages | null;
  rowCounterRef: MutableRefObject<number>;
}

export const useUpdatePipelineTable = ({
  tabulatorInstance,
  pipelineValuesStages,
  rowCounterRef,
}: UseUpdatePipelineTableProps): void => {
  useEffect(() => {
    if (!tabulatorInstance.current || !pipelineValuesStages) {
      return;
    }

    if (pipelineValuesStages.IF.PC === -1 && rowCounterRef.current === 0) {
      return;
    }

    const getStageDataObject = (stage: keyof PipelineStages) => {
      const stageData = pipelineValuesStages[stage];

      if (!stageData || !stageData.instruction) {
        return { pc: "?", asm: "Error" };
      }

      if (stageData.PC === -1) {
        return { pc: -1, asm: stageData.instruction.asm };
      }

      const instruction = stageData.instruction;

      const pc = stageData.PC;
      const asm = instruction.asm;

      return { pc, asm };
    };
    const newRowData = {
      id: rowCounterRef.current,
      IF: getStageDataObject("IF"),
      ID: getStageDataObject("ID"),
      EX: getStageDataObject("EX"),
      MEM: getStageDataObject("MEM"),
      WB: getStageDataObject("WB"),
    };

    tabulatorInstance.current.addRow(newRowData).then((row) => {
      row.scrollTo();
    });

    rowCounterRef.current++;
  }, [pipelineValuesStages, rowCounterRef, tabulatorInstance]);
};
