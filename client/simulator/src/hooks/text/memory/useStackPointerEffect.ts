import { useEffect, MutableRefObject, Dispatch, SetStateAction } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import { setSP } from '@/utils/tables/handlersMemory';
import { binaryToInt } from '@/utils/handlerConversions'; 

// Define the shape of the writeInRegister object
interface WriteInRegisterPayload {
  registerName: string;
  value: string;
}

/**
 * Props for the useStackPointerEffect hook.
 */
interface UseStackPointerEffectProps {
  tableInstanceRef: MutableRefObject<Tabulator | null>;
  isCreatedMemoryTable: boolean;
  writeInRegister: WriteInRegisterPayload;
  sp: string;
  setSp: Dispatch<SetStateAction<string>>;
}

/**
 * Custom hook to update the Stack Pointer (SP) visual representation
 * in the memory table when the 'x2' register is modified.
 * This is a direct 1-to-1 mapping of the original component's useEffect.
 */
export const useStackPointerEffect = ({
  tableInstanceRef,
  isCreatedMemoryTable,
  writeInRegister,
  sp,
  setSp,
}: UseStackPointerEffectProps): void => {
  useEffect(() => {
    // ---- LÓGICA 100% IDÉNTICA A LA ORIGINAL ----
    if (writeInRegister.value === '' || !tableInstanceRef.current || !isCreatedMemoryTable) return;
    if (writeInRegister.registerName === 'x2') {
      setSp(
        setSP(Number(binaryToInt(writeInRegister.value)), { current: tableInstanceRef.current }, sp)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [writeInRegister, sp, setSp, isCreatedMemoryTable]);
};