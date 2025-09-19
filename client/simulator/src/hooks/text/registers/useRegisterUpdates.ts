import { useEffect, useRef, MutableRefObject } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import { updateRegisterValue } from '@/utils/tables/handlersRegisters';

interface WriteInRegister {
  registerName: string;
  value: string;
}

interface UseRegisterUpdatesProps {
  tabulatorInstance: MutableRefObject<Tabulator | null>;
  isTableBuilt: boolean;
  writeInRegister: WriteInRegister;
  setWriteInRegister: React.Dispatch<React.SetStateAction<WriteInRegister>>;
  setRegisterData: React.Dispatch<React.SetStateAction<string[]>>;
  checkFixedRegisters: boolean;
  fixedchangedRegisters: string[];
  setFixedchangedRegisters: React.Dispatch<React.SetStateAction<string[]>>;
}

export const useRegisterUpdates = ({
  tabulatorInstance,
  isTableBuilt,
  writeInRegister,
  setWriteInRegister,
  setRegisterData,
  checkFixedRegisters,
  fixedchangedRegisters,
  setFixedchangedRegisters,
}: UseRegisterUpdatesProps): void => {

  const pendingWriteRef = useRef<WriteInRegister | null>(null);

  const processWrite = (write: WriteInRegister) => {
    if (write.value === '' || write.registerName === 'x0') return;

    const index = Number(write.registerName.replace('x', ''));
    
    setRegisterData((prevData) => {
      const newRegisters = [...prevData];
      newRegisters[index] = write.value;
      return newRegisters;
    });

    updateRegisterValue(tabulatorInstance, write.registerName, write.value);

    if (checkFixedRegisters) {
      const row = tabulatorInstance.current?.getRow(write.registerName);
      if (row && !row.getData().watched) {
        row.update({ watched: true });
        tabulatorInstance.current?.setGroupBy('watched');
        setTimeout(() => {
          tabulatorInstance.current?.scrollToRow(write.registerName, "center", false);
        }, 0);
      }
    }
    setFixedchangedRegisters((prev) => [...prev, write.registerName]);
  };

  useEffect(() => {
    if (writeInRegister.value === '') return;

    if (isTableBuilt) {
      processWrite(writeInRegister);
      setWriteInRegister({ registerName: '', value: '' }); 
    } else {
      pendingWriteRef.current = writeInRegister;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [writeInRegister]);

  useEffect(() => {
    if (isTableBuilt && pendingWriteRef.current) {
      processWrite(pendingWriteRef.current);
      pendingWriteRef.current = null;
      setWriteInRegister({ registerName: '', value: '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTableBuilt]);

  useEffect(() => {
    if (!isTableBuilt || !checkFixedRegisters) return;
    
    let needsRegrouping = false;
    tabulatorInstance.current?.getRows().forEach((row) => {
      const rowData = row.getData();
      if (fixedchangedRegisters.includes(rowData.rawName) && !rowData.watched) {
        row.update({ watched: true });
        needsRegrouping = true;
      }
    });
    
    if (needsRegrouping) {
        tabulatorInstance.current?.setGroupBy('watched');
    }
  }, [checkFixedRegisters, isTableBuilt, fixedchangedRegisters, tabulatorInstance]);
};