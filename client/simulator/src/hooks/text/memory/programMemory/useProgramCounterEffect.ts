import { useEffect, MutableRefObject } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import { updatePC } from '@/utils/tables/handlersMemory'; // Adjust path if needed

/**
 * Props for the useProgramCounterEffect hook.
 */
interface UseProgramCounterEffectProps {
  isCreatedMemoryTable: boolean;
  newPc: number;
  newPcRef: MutableRefObject<number>;
  tableInstanceRef: MutableRefObject<Tabulator | null>;
  // Usamos 'any' para dataMemoryTable para máxima compatibilidad sin conocer su tipo exacto.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}

/**
 * Custom hook to handle the side-effects of a Program Counter (PC) update.
 * It syncs the PC value to a ref and calls a utility to update the UI,
 * performing a bounds check to ensure the PC is within the code segment.
 * This is a direct 1-to-1 mapping of the original component's useEffect.
 */
export const useProgramCounterEffect = ({
  isCreatedMemoryTable,
  newPc,
  newPcRef,
  tableInstanceRef,
}: UseProgramCounterEffectProps): void => {
  useEffect(() => {

    if (!isCreatedMemoryTable) return;

      newPcRef.current = newPc;
        updatePC(newPc, { current: tableInstanceRef.current });
    

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newPc, isCreatedMemoryTable]);
};