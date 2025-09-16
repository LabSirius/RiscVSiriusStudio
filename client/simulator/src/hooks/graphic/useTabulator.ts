import { useEffect, RefObject, MutableRefObject } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import { getPipelineColumnDefinitions } from '@/utils/tables/definitions/definitionsColumns'; 

interface UseInitializePipelineTableProps {
  tableContainerRef: RefObject<HTMLDivElement | null> ;
  tabulatorInstance: MutableRefObject<Tabulator | null>;
  isCreatedMemoryTable: boolean
}

export const useInitializePipelineTable = ({
  tableContainerRef,
  tabulatorInstance,
  isCreatedMemoryTable
}: UseInitializePipelineTableProps): void => {
  useEffect(() => {
    if (!tableContainerRef.current || tabulatorInstance.current) {
      return;
    }

    tabulatorInstance.current = new Tabulator(tableContainerRef.current, {
      data: [], 
      columns: getPipelineColumnDefinitions(),
      layout: 'fitColumns', 
      reactiveData: true,
      index: 'id',
      movableColumns: false,
      maxHeight: 'calc(100dvh - 2.3rem)', 
      placeholder: "Waiting for pipeline execution...", 
    });

    return () => {
      tabulatorInstance.current?.destroy();
      tabulatorInstance.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCreatedMemoryTable]); 
};