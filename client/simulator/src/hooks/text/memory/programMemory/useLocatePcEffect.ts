import { useEffect, MutableRefObject, Dispatch, SetStateAction } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';

/**
 * Props for the useLocatePcEffect hook.
 */
interface UseLocatePcEffectProps {
  isCreatedMemoryTable: boolean;
  tableInstanceRef: MutableRefObject<Tabulator | null>;
  locatePc: boolean;
  setLocatePc: Dispatch<SetStateAction<boolean>>;
  newPc: number;
}

/**
 * Custom hook to handle scrolling the memory table to the current Program Counter (PC).
 * It triggers when the 'locatePc' flag is true, calculates the target row,
 * performs the scroll, and then resets the flag.
 * This is a direct 1-to-1 mapping of the original component's useEffect.
 */
export const useLocatePcEffect = ({
  isCreatedMemoryTable,
  tableInstanceRef,
  locatePc,
  setLocatePc,
  newPc,
}: UseLocatePcEffectProps): void => {
  useEffect(() => {
    if (!isCreatedMemoryTable || !locatePc) return;
    const targetValue = (newPc * 4).toString(16).toUpperCase();
    tableInstanceRef.current?.scrollToRow(targetValue, 'top', true);
    setLocatePc(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locatePc, setLocatePc, isCreatedMemoryTable]);
};