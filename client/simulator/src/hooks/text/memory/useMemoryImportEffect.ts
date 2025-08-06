import { useEffect, MutableRefObject, Dispatch, SetStateAction } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import { sendMessage } from '@/components/Message/sendMessage';

/**
 * Props for the useMemoryImportEffect hook.
 */
interface UseMemoryImportEffectProps {
  isCreatedMemoryTable: boolean;
  tableInstanceRef: MutableRefObject<Tabulator | null>;
  // Usamos 'any' para el array de datos de importación, ya que su estructura es compleja.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  importMemory: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setImportMemory: Dispatch<SetStateAction<any[]>>;
}

/**
 * Custom hook to handle importing and updating data in the memory table.
 * It triggers when `importMemory` state changes, processes the data,
 * updates the Tabulator instance, and then clears the trigger state.
 * This is a direct 1-to-1 mapping of the original component's useEffect.
 */
export const useMemoryImportEffect = ({
  isCreatedMemoryTable,
  tableInstanceRef,
  importMemory,
  setImportMemory,
}: UseMemoryImportEffectProps): void => {
  useEffect(() => {
    // ---- LÓGICA 100% IDÉNTICA A LA ORIGINAL ----
    if (importMemory.length === 0 || !isCreatedMemoryTable) return;
    
    const importMemoryUppercase = importMemory.map((row) => ({
      ...row,
      address: row.address.toUpperCase(),
    }));

    tableInstanceRef.current?.updateData(importMemoryUppercase);
    setImportMemory([]);
    sendMessage({ event: 'memoryChanged', memory: tableInstanceRef.current?.getData() });
    
    
  }, [importMemory, setImportMemory, isCreatedMemoryTable]);
};