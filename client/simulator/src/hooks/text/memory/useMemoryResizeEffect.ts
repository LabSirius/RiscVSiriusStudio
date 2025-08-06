import { useEffect, MutableRefObject, Dispatch, SetStateAction } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';

// Import all utility functions and types needed
import { uploadMemory } from '@/utils/tables/handlersMemory';
import { intTo32BitBinary, intToHex } from '@/utils/handlerConversions';
import { sendMessage } from '@/components/Message/sendMessage';

// Define the shape of the object for setWriteInRegister
interface WriteInRegisterPayload {
  registerName: string;
  value: string;
}

/**
 * Props for the useMemoryResizeEffect hook.
 */
interface UseMemoryResizeEffectProps {
  isCreatedMemoryTable: boolean;
  tableInstanceRef: MutableRefObject<Tabulator | null>;
  sizeMemory: number;
  setNewPc: Dispatch<SetStateAction<number>>;
  setSp: Dispatch<SetStateAction<string>>;
  setWriteInRegister: Dispatch<SetStateAction<WriteInRegisterPayload>>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dataMemoryTable: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setDataMemoryTable: Dispatch<SetStateAction<any>>;
}

/**
 * Custom hook to handle the side-effects of resizing the memory.
 * It recalculates the memory array, updates the Tabulator table, and syncs related states.
 * This is a direct 1-to-1 mapping of the original component's useEffect.
 */
export const useMemoryResizeEffect = ({
  isCreatedMemoryTable,
  tableInstanceRef,
  dataMemoryTable,
  sizeMemory,
  setNewPc,
  setSp,
  setWriteInRegister,
  setDataMemoryTable,
}: UseMemoryResizeEffectProps): void => {
  useEffect(() => {
    if (!isCreatedMemoryTable) return;
    if (tableInstanceRef.current && dataMemoryTable) {
      const newTotalSize = dataMemoryTable.codeSize + sizeMemory;
      let newMemory: string[] = [];

      if (newTotalSize < dataMemoryTable.memory.length) {
        newMemory = dataMemoryTable.memory.slice(0, newTotalSize);
      } else if (newTotalSize > dataMemoryTable.memory.length) {
        newMemory = [
          ...dataMemoryTable.memory,
          ...new Array(newTotalSize - dataMemoryTable.memory.length).fill('00000000'),
        ];
      } else {
        newMemory = dataMemoryTable.memory;
      }

      uploadMemory(
        tableInstanceRef.current,
        newMemory,
        dataMemoryTable.codeSize,
        dataMemoryTable.constantsSize,
        dataMemoryTable.symbols,
        () => {
          setNewPc(0);

          setSp(intToHex(newTotalSize - 4));
          const newMemorySize = intTo32BitBinary(newTotalSize - 4);
          setWriteInRegister({ registerName: 'x2', value: newMemorySize });
        }
      );

      setDataMemoryTable({
        ...dataMemoryTable,
        memory: newMemory,
      });

      sendMessage({ event: 'memorySizeChanged', sizeMemory: newTotalSize - 4 });
    }

 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sizeMemory]);
};