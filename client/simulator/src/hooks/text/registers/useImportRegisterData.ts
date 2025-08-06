import { useEffect, MutableRefObject } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';

/**
 * Defines the structure of the data for a single register row.
 * Used to type the `importRegister` data array.
 */
interface RegisterRowData {
  // Add all properties that exist on a register row object.
  // Based on previous code, it should at least include these:
  name: string;
  rawName: string;
  value: string;
  viewType: number;
  watched: boolean;
  modified: number;
  id: number;
}

/**
 * Props for the useImportRegisterData hook.
 */
interface UseImportRegisterDataProps {
  tabulatorInstance: MutableRefObject<Tabulator | null>;
  isTableBuilt: boolean;
  importRegister: RegisterRowData[];
  setImportRegister: React.Dispatch<React.SetStateAction<RegisterRowData[]>>;
}

/**
 * Custom hook to update the table's data when the `importRegister` state changes.
 * It sets the new data in the Tabulator instance and then clears the trigger state.
 * This is a direct 1-to-1 mapping of the original component's useEffect.
 */
export const useImportRegisterData = ({
  tabulatorInstance,
  isTableBuilt,
  importRegister,
  setImportRegister,
}: UseImportRegisterDataProps): void => {
  useEffect(() => {
    if (!isTableBuilt || importRegister.length === 0) {
      return;
    }

    tabulatorInstance.current?.setData(importRegister);
    setImportRegister([]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importRegister, setImportRegister, isTableBuilt]);
};