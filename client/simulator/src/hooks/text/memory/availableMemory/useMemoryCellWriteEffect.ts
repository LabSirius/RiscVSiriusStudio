import { useEffect, MutableRefObject, Dispatch, SetStateAction } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import { writeInMemoryCell } from '@/utils/tables/handlersMemory'; 

// Define the shape of the writeInMemory object
interface WriteInMemoryPayload {
  address: number;
  _length: number;
  value: string;
}

/**
 * Props for the useMemoryCellWriteEffect hook.
 */
interface UseMemoryCellWriteEffectProps {
  isCreatedMemoryTable: boolean;
  tableInstanceRef: MutableRefObject<Tabulator | null>;
  theme: string;
  writeInMemory: WriteInMemoryPayload;
  setWriteInMemory: Dispatch<SetStateAction<WriteInMemoryPayload>>;
}

/**
 * Custom hook to handle writing a value directly into a memory cell.
 * It triggers when the 'writeInMemory' state changes, calls a utility
 * function to update the UI, and then resets the state.
 * This is a direct 1-to-1 mapping of the original component's useEffect.
 */
export const useMemoryCellWriteEffect = ({
  isCreatedMemoryTable,
  tableInstanceRef,
  theme,
  writeInMemory,
  setWriteInMemory,
}: UseMemoryCellWriteEffectProps): void => {
  useEffect(() => {
    // ---- LÓGICA 100% IDÉNTICA A LA ORIGINAL ----
    if (!isCreatedMemoryTable || writeInMemory.value === '') return;
    
    writeInMemoryCell(
      tableInstanceRef.current,
      writeInMemory.address,
      writeInMemory._length,
      writeInMemory.value,
      theme
    );

    setWriteInMemory({ address: 0, _length: 0, value: '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [writeInMemory, setWriteInMemory, isCreatedMemoryTable]);
};