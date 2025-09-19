import { useEffect, useRef, MutableRefObject, Dispatch, SetStateAction } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import { setSP as updateSPinTableUI } from '@/utils/tables/handlersMemory';
import { binaryToInt } from '@/utils/handlerConversions';

// --- INTERFACES ---
interface WriteInRegisterPayload {
  registerName: string;
  value: string;
}

interface UseStackPointerEffectProps {
  tableInstanceRef: MutableRefObject<Tabulator | null>;
  isCreatedMemoryTable: boolean;
  writeInRegister: WriteInRegisterPayload;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dataMemoryTable: any;
  sp: string;
  setSp: Dispatch<SetStateAction<string>>;
}

export const useStackPointerEffect = ({
  tableInstanceRef,
  isCreatedMemoryTable,
  writeInRegister,
  dataMemoryTable,
  sp,
  setSp,
}: UseStackPointerEffectProps): void => {

  const prevSpRef = useRef<string | undefined>(undefined);
  const prevWriteInRegisterRef = useRef<WriteInRegisterPayload>(undefined);

  useEffect(() => {
    if (dataMemoryTable && dataMemoryTable.memory) {

      setSp(String(dataMemoryTable.memory.length - 4));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataMemoryTable]);

  useEffect(() => {

    if (prevWriteInRegisterRef.current && writeInRegister !== prevWriteInRegisterRef.current) {
      if (writeInRegister.value !== '' && writeInRegister.registerName === 'x2') {
        const newSpValue = String(binaryToInt(writeInRegister.value));
        if (newSpValue !== sp) {
          setSp(newSpValue);
        }
      }
    }
  }, [writeInRegister, setSp, sp]);

  useEffect(() => {
    if (isCreatedMemoryTable && tableInstanceRef.current && sp) {

      const newSpAddress = updateSPinTableUI(
        parseInt(sp),
        { current: tableInstanceRef.current },
        prevSpRef.current
      );
      prevSpRef.current = newSpAddress;
    }
  }, [sp, isCreatedMemoryTable, tableInstanceRef]);

  useEffect(() => {
    prevWriteInRegisterRef.current = writeInRegister;
  }, [writeInRegister]);
};