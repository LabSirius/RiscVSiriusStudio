import { useEffect, RefObject, MutableRefObject, Dispatch, SetStateAction } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import { getColumnHexMemoryDefinitions } from '@/utils/tables/definitions/definitionsColumns';
import {
  uploadAvailableMemory,
  setupEventListeners,
} from '@/utils/tables/handlersMemory';
import { intToHex } from '@/utils/handlerConversions';
import { sendMessage } from '@/components/Message/sendMessage';

/**
 * Props for the useMemoryTabulator hook with specific types where possible.
 */
interface UseHexAvMemoryTabulatorProps {
  // Tipos estándar y seguros de React
  tableContainerRef: RefObject<HTMLDivElement | null>;
  tableInstanceRef: MutableRefObject<Tabulator | null>;
  newPcRef: MutableRefObject<number>;
  isFirstStepRef: MutableRefObject<boolean>;
  isCreatedMemoryTable: boolean;

  setIsCreatedMemoryTable: Dispatch<SetStateAction<boolean>>;
  setSp: Dispatch<SetStateAction<string>>;
  setNewPc: Dispatch<SetStateAction<number>>;

  setClickAddressInMemoryTable: (line: number) => void;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dataMemoryTable: any;
}

/**
 * Custom hook to initialize the memory Tabulator table.
 * This final version uses strong types for everything except for the complex
 * 'dataMemoryTable' object to prevent build errors while maximizing type safety.
 * The execution logic is a 100% exact copy of the original component's useEffect.
 */
export const UseHexAvMemoryTabulator = ({
  tableContainerRef,
  tableInstanceRef,
  isCreatedMemoryTable,
  setIsCreatedMemoryTable,
  dataMemoryTable,
  isFirstStepRef,
  setSp,
}: UseHexAvMemoryTabulatorProps): void => {
  useEffect(() => {

    if (!tableContainerRef.current || isCreatedMemoryTable) return;

    if (tableInstanceRef.current) {
      tableInstanceRef.current.destroy();
      tableInstanceRef.current = null;
    }

    tableInstanceRef.current = new Tabulator(tableContainerRef.current, {
      layout: 'fitColumns',
      index: 'address',
      data: [],
      columns: getColumnHexMemoryDefinitions(isFirstStepRef),
      rowFormatter: function (row) {
        const data = row.getData();
        if (!dataMemoryTable) return;

        const spAddress = intToHex(dataMemoryTable.memory.length - 4).toUpperCase();
        if (data.address === spAddress) return;

        const rowEl = row.getElement();
        rowEl.style.backgroundColor = '';
        rowEl.style.color = '';

      },
      initialSort: [{ column: 'address', dir: 'desc' }],
    });

    tableInstanceRef.current.on('tableBuilt', () => {
      setIsCreatedMemoryTable(true);
      if (dataMemoryTable) {
        uploadAvailableMemory(
          tableInstanceRef.current!,
          dataMemoryTable.memory,
          () => {
            setSp(intToHex(dataMemoryTable.memory.length - 4));
          }
        );
      }
      setupEventListeners(tableInstanceRef.current!);
    });

    tableInstanceRef.current.on('cellEdited', (cell) => {
      if (cell.getField().startsWith('value')) {
        sendMessage({ event: 'memoryChanged', memory: tableInstanceRef.current?.getData() });
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCreatedMemoryTable]);
};