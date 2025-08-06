import { useEffect, MutableRefObject } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import { filterTableData } from '@/utils/tables/handlersRegisters'; // Adjust path if needed
import { resetCellColors } from '@/utils/tables/handlersShared'; // Adjust path if needed

/**
 * Props for the useTableFilter hook.
 */
interface UseTableFilterProps {
  tabulatorInstance: MutableRefObject<Tabulator | null>;
  isTableBuilt: boolean;
  searchInRegisters: string;
  theme: string;
}

/**
 * Custom hook to handle filtering the Tabulator table based on a search string.
 * It applies the filter or clears it if the search string is empty.
 * This is a direct 1-to-1 mapping of the original component's useEffect.
 */
export const useTableFilter = ({
  tabulatorInstance,
  isTableBuilt,
  searchInRegisters,
  theme,
}: UseTableFilterProps): void => {
  useEffect(() => {
    if (!tabulatorInstance.current || !isTableBuilt) {
      return;
    }
    
    if (searchInRegisters.trim() === '') {
      tabulatorInstance.current.clearFilter(true);
      resetCellColors(tabulatorInstance.current);
    } else {
      filterTableData(searchInRegisters, tabulatorInstance.current, theme);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInRegisters, isTableBuilt]);
};