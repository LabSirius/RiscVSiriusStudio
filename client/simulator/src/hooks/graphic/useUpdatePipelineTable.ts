// src/hooks/graphic/pipeline/useUpdatePipelineTable.ts

import { useEffect, MutableRefObject } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import { PipelineCycleResult } from '@/context/graphic/CurrentInstContext';

interface UseUpdatePipelineTableProps {
  tabulatorInstance: MutableRefObject<Tabulator | null>;
  pipelineValuesStages: PipelineCycleResult | null;
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


    console.log("DATOS DEL PIPELINE RECIBIDOS:", pipelineValuesStages);

    /**
     * Función auxiliar que ahora retorna un objeto { pc, asm } para cada etapa.
     */
    const getStageDataObject = (stage: keyof PipelineCycleResult) => {
  const stageData = pipelineValuesStages[stage];

  // Protección por si los datos no son válidos
  if (!stageData || !stageData.instruction) {
    return { pc: '?', asm: 'Error' };
  }

  // ✅ ACCESO CORRECTO: Usamos `stageData.PC` (del Nivel 1) para la comprobación.
  // La etapa WB es especial porque no tiene PC, así que también comprobamos la instrucción interna.
  if (stageData.PC === -1) {
    return { pc: -1, asm: "NOP" };
  }

  const instruction = stageData.instruction;

  // ✅ VALOR CORRECTO: Tomamos el `PC` de `stageData` y el `asm` de `instruction`.
  const pc = stageData.PC;
  const asm = instruction.asm;

  return { pc, asm };
};
    // Creamos la nueva fila SIN la columna 'pc' y con objetos en cada etapa.
    const newRowData = {
      id: rowCounterRef.current,
      IF: getStageDataObject('IF'),
      ID: getStageDataObject('ID'),
      EX: getStageDataObject('EX'),
      MEM: getStageDataObject('MEM'),
      WB: getStageDataObject('WB'),
    };

    tabulatorInstance.current.addRow(newRowData).then((row) => {
      row.scrollTo();
    });

    rowCounterRef.current++;
  }, [pipelineValuesStages, rowCounterRef, tabulatorInstance]);
};