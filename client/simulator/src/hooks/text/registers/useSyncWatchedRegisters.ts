import { useEffect, MutableRefObject } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';

/**
 * Props for the useSyncWatchedRegisters hook.
 */
interface UseSyncWatchedRegistersProps {
  tabulatorInstance: MutableRefObject<Tabulator | null>;
  isTableBuilt: boolean;
  checkFixedRegisters: boolean;
  fixedchangedRegisters: string[];
}

/**
 * Custom hook to sync the "watched" status of rows in the table.
 * This effect runs when 'checkFixedRegisters' is toggled, iterating through
 * all rows and marking them as watched if they appear in the 'fixedchangedRegisters' list.
 * The implementation is a direct mapping of the original component's useEffect.
 */
export const useSyncWatchedRegisters = ({
  tabulatorInstance,
  isTableBuilt,
  checkFixedRegisters,
  fixedchangedRegisters,
}: UseSyncWatchedRegistersProps): void => {
  useEffect(() => {
    if (!isTableBuilt || !checkFixedRegisters) {
      return;
    }

    tabulatorInstance.current?.getRows().forEach((row) => {
      const rowData = row.getData();

      if (fixedchangedRegisters.includes(rowData.rawName) && !rowData.watched) {
        row.update({ ...rowData, watched: true });
      }
    });

    tabulatorInstance.current?.setGroupBy('watched');

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkFixedRegisters, isTableBuilt, fixedchangedRegisters]);
};