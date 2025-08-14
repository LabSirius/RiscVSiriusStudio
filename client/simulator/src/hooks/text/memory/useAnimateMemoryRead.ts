import { useEffect, MutableRefObject, Dispatch, SetStateAction } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import { animateMemoryCell } from '@/utils/tables/handlersMemory'; 
// Define the shape of the readInMemory object
interface ReadInMemoryPayload {
  address: number;
  _length: number;
  value: string;
}

/**
 * Props for the useAnimateMemoryRead hook.
 */
interface UseAnimateMemoryReadProps {
  isCreatedMemoryTable: boolean;
  tableInstanceRef: MutableRefObject<Tabulator | null>;
  readInMemory: ReadInMemoryPayload;
  setReadInMemory: Dispatch<SetStateAction<ReadInMemoryPayload>>;
}

/**
 * Custom hook to handle the animation of a memory cell read.
 * It triggers when the 'readInMemory' state changes, calls a utility
 * function to animate the UI, and then resets the state.
 * This is a direct 1-to-1 mapping of the original component's useEffect.
 */
export const useAnimateMemoryRead = ({
  isCreatedMemoryTable,
  tableInstanceRef,
  readInMemory,
  setReadInMemory,
}: UseAnimateMemoryReadProps): void => {
  useEffect(() => {
    if (!isCreatedMemoryTable || readInMemory.value === '-1' || !tableInstanceRef.current) return;

    console.log("QUE DIRECCION ES", readInMemory.address)
    
    animateMemoryCell(tableInstanceRef.current, readInMemory.address, readInMemory._length, true);
    setReadInMemory({ address: 0, _length: 0, value: '-1' });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readInMemory, setReadInMemory, isCreatedMemoryTable]);
};