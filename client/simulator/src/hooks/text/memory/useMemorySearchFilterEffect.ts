import { useEffect, MutableRefObject } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import { filterMemoryData, updatePC } from '@/utils/tables/handlersMemory'

/**
 * Props for the useMemorySearchFilterEffect hook.
 */
interface UseMemorySearchFilterEffectProps {
  tableInstanceRef: MutableRefObject<Tabulator | null>;
  isCreatedMemoryTable: boolean;
  newPc: number;
  searchInMemory: string;
}

/**
 * Custom hook to filter the memory table based on a search string.
 * It calls utility functions to filter the data and then update the PC's position.
 * This is a direct 1-to-1 mapping of the original component's useEffect.
 */
export const useMemorySearchFilterEffect = ({
  tableInstanceRef,
  isCreatedMemoryTable,
  newPc,
  searchInMemory,
}: UseMemorySearchFilterEffectProps): void => {
  useEffect(() => {
    // ---- LÓGICA 100% IDÉNTICA A LA ORIGINAL ----
    if (!tableInstanceRef.current || !isCreatedMemoryTable || newPc === 0) return;
    filterMemoryData(searchInMemory, tableInstanceRef);
    updatePC(newPc, { current: tableInstanceRef.current });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInMemory, isCreatedMemoryTable]);
};