import { useEffect, RefObject, MutableRefObject } from 'react';
import { TabulatorFull as Tabulator, CellComponent } from 'tabulator-tables';
import { RegisterView } from '@/utils/tables/types';
import { getColumnsRegisterDefinitions } from '@/utils/tables/definitions/definitionsColumns';
import { registersNames } from '@/components/panel/Sections/constants/data';
import { sendMessage } from '@/components/Message/sendMessage';

/**
 * Props for the useTabulator hook.
 */
interface UseTabulatorProps {
  /**
   * Ref to the HTML div element where the table will be mounted.
   */
  tableRef: RefObject<HTMLDivElement | null>;
  /**
   * Ref to store the Tabulator instance. This allows parent components to interact with the table.
   */
  tabulatorInstance: MutableRefObject<Tabulator | null>;
  /**
   * A flag that indicates if the memory table is created, used as a trigger for initialization.
   */
  isCreatedMemoryTable: boolean;
  /**
   * The current register data array used for initializing the table.
   */
  registerData: string[];
  /**
   * State setter to update the global register data when a cell is edited.
   */
  setRegisterData: React.Dispatch<React.SetStateAction<string[]>>;
  /**
   * A custom formatter function for the 'viewType' column.
   */
  viewTypeFormatterCustom: (cell: CellComponent) => HTMLElement;
  /**
   * Flag to determine if the simulator is in its first step, affects column definitions.
   */
  isFirstStep: boolean;
  /**
   * The current UI theme ('light' or 'dark') for table styling.
   */
  theme: string;
  /**
   * State setter to signal when the table has been successfully built.
   */
  setTableBuilt: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Custom hook to manage the entire lifecycle of a Tabulator table instance.
 * It handles initialization, data mapping, event listeners (tableBuilt, cellEdited),
 * and destruction of the table instance on cleanup.
 */
export const useTabulator = ({
  tableRef,
  tabulatorInstance,
  isCreatedMemoryTable,
  registerData,
  setRegisterData,
  viewTypeFormatterCustom,
  isFirstStep,
  theme,
  setTableBuilt,
}: UseTabulatorProps): void => {
  useEffect(() => {
    // Guard clause: Do not proceed if the table div isn't ready or if the table instance already exists.
    if (!tableRef.current || tabulatorInstance.current) {
      return;
    }

    // Map the register names and initial data into the format required by Tabulator.
    const initialData = registersNames.map((name, id) => ({
      name,
      rawName: name.split(' ')[0],
      value: registerData[id],
      viewType: 16 as RegisterView,
      watched: false,
      modified: 0,
      id,
    }));

    // Create the Tabulator instance.
    tabulatorInstance.current = new Tabulator(tableRef.current, {
      data: initialData,
      columns: getColumnsRegisterDefinitions(viewTypeFormatterCustom, isFirstStep, theme),
      layout: 'fitColumns',
      renderVertical: 'virtual',
      reactiveData: true,
      groupBy: 'watched',
      groupValues: [[true, false]],
      groupHeader: (value, count) => `${value ? 'Watched' : 'Unwatched'} (${count} registers)`,
      movableRows: true,
      index: 'rawName',
    });

    // --- EVENT LISTENERS ---

    // When the table is fully rendered, update the state.
    tabulatorInstance.current.on('tableBuilt', () => {
      setTableBuilt(true);
    });

    // When a user edits a cell, update the global register state.
    tabulatorInstance.current.on('cellEdited', (cell: CellComponent) => {
      if (cell.getField() === 'value') {
        let { value } = cell.getData();
        const { id } = cell.getData();
        // Pad the value if it's shorter than 32 bits.
        if (value.length < 32) {
          value = value.padStart(32, '0');
        }
        // Update the global state and notify other parts of the application.
        setRegisterData((prevData) => {
          const newData = [...prevData];
          newData[id] = value;
          sendMessage({ event: 'registersChanged', registers: newData });
          return newData;
        });
      }
    });

    // --- CLEANUP ---
    // This function will be called when the component unmounts or dependencies change.
    return () => {
      if (tabulatorInstance.current) {
        tabulatorInstance.current.destroy();
        tabulatorInstance.current = null;
        setTableBuilt(false);
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCreatedMemoryTable]);
};