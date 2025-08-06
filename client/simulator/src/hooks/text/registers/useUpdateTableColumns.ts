import { useEffect, MutableRefObject } from 'react';
import { TabulatorFull as Tabulator, CellComponent } from 'tabulator-tables';
import { getColumnsRegisterDefinitions } from '@/utils/tables/definitions/definitionsColumns'; // Adjust path if needed

/**
 * Props for the useUpdateTableColumns hook.
 */
interface UseUpdateTableColumnsProps {
  tabulatorInstance: MutableRefObject<Tabulator | null>;
  isFirstStep: boolean;
  theme: string;
  viewTypeFormatterCustom: (cell: CellComponent) => HTMLElement;
}

/**
 * Custom hook to update the table columns definition, for example,
 * to enable or disable the cell editor based on the 'isFirstStep' flag.
 * This is a direct 1-to-1 mapping of the original component's useEffect.
 */
export const useUpdateTableColumns = ({
  tabulatorInstance,
  isFirstStep,
  theme,
  viewTypeFormatterCustom,
}: UseUpdateTableColumnsProps): void => {
  useEffect(() => {
    if (tabulatorInstance.current) {
      tabulatorInstance.current.setColumns(
        getColumnsRegisterDefinitions(viewTypeFormatterCustom, isFirstStep, theme)
      );
    }


    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFirstStep]);
};