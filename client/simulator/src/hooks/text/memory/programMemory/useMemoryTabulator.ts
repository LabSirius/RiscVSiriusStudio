import { useEffect, RefObject, MutableRefObject, Dispatch, SetStateAction } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import { getColumnMemoryDefinitions } from '@/utils/tables/definitions/definitionsColumns';
import {
  uploadProgramMemory,
  setupEventListeners,
  animateArrowBetweenCells,
  createPCIcon,
} from '@/utils/tables/handlersMemory';
import { intToHex, hexToInt, binaryToIntTwoComplement } from '@/utils/handlerConversions';
import { sendMessage } from '@/components/Message/sendMessage';

/**
 * Props for the useMemoryTabulator hook with specific types where possible.
 */
interface UseMemoryTabulatorProps {
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
export const useMemoryTabulator = ({
  tableContainerRef,
  tableInstanceRef,
  isCreatedMemoryTable,
  setIsCreatedMemoryTable,
  dataMemoryTable,
  newPcRef,
  isFirstStepRef,
  setSp,
  setNewPc,
  setClickAddressInMemoryTable,
}: UseMemoryTabulatorProps): void => {
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
      columns: getColumnMemoryDefinitions(isFirstStepRef),
      rowFormatter: function (row) {
        const data = row.getData();
        if (!dataMemoryTable) return;

        const rowEl = row.getElement();

        if (data.segment === 'program') {
          rowEl.style.backgroundColor = '#D1E3E7';
          rowEl.style.color = '#000';
        } else if (data.segment === 'constants') {
          rowEl.style.backgroundColor = '#FFE5B4';
          rowEl.style.color = '#000';
        }

        const currentPcHex = (newPcRef.current * 4).toString(16).toUpperCase();
        if (data.address === currentPcHex) {
          rowEl.querySelectorAll('.pc-icon').forEach((el) => el.remove());
          const cell = row.getCell('address');
          if (cell) {
            const cellEl = cell.getElement();
            cellEl.style.position = 'relative';
            cellEl.appendChild(createPCIcon());
          }
        }
      },
      initialSort: [{ column: 'address', dir: 'desc' }],
    });

    tableInstanceRef.current.on('tableBuilt', () => {
      setIsCreatedMemoryTable(true);
      if (dataMemoryTable) {
        uploadProgramMemory(
          tableInstanceRef.current!,
          dataMemoryTable.program,
          dataMemoryTable.codeSize,
          dataMemoryTable.constantsSize,
          dataMemoryTable.symbols,
          () => {
            setSp(intToHex(dataMemoryTable.memory.length - 4));
            setNewPc(0);
          }
        );
      }

      tableInstanceRef.current?.on('cellClick', (_, cell) => {
        if (cell.getField() === 'address') {
          const address = cell.getValue();
          const intAdress = Number(hexToInt(address)) / 4;
          if (dataMemoryTable?.codeSize) {
            if (intAdress * 4 < dataMemoryTable?.codeSize) {
              const instruction = dataMemoryTable?.addressLine[intAdress];
              if (instruction) {
                setClickAddressInMemoryTable(instruction.line);
                sendMessage({ event: 'clickInInstruction', line: instruction.line });
                if (dataMemoryTable?.addressLine[intAdress].jump) {
                  const intJump = Number(
                    binaryToIntTwoComplement(String(dataMemoryTable?.addressLine[intAdress].jump))
                  );
                  const jumpTo = intJump + intAdress * 4;
                  if (tableInstanceRef.current) {
                    animateArrowBetweenCells(tableInstanceRef.current, intAdress * 4, jumpTo);
                  }
                }
              }
            }
          }
        }
      });

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