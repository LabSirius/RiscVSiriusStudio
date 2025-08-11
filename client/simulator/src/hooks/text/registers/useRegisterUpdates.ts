import { useEffect, MutableRefObject } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import { updateRegisterValue } from '@/utils/tables/handlersRegisters'; // Adjust path if needed

// Define the shape of the writeInRegister object for clarity
interface WriteInRegister {
  registerName: string;
  value: string;
}

/**
 * Props for the useRegisterUpdates hook.
 */
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

/**
 * Custom hook to manage register updates and the "auto-watch" feature.
 * It encapsulates two related effects:
 * 1. Handling a direct write to a register.
 * 2. Updating the "watched" status of registers when the feature is toggled.
 */
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
  // Effect 1: Handles a direct write to a specific register from the simulator.
  useEffect(() => {
    if (!isTableBuilt || writeInRegister.value === '' || writeInRegister.registerName === 'x0') {
      return;
    }

    const index = Number(writeInRegister.registerName.replace('x', ''));
    
    setRegisterData((prevData) => {
      const newRegisters = [...prevData];
      newRegisters[index] = writeInRegister.value;
      return newRegisters;
    });

    updateRegisterValue(tabulatorInstance, writeInRegister.registerName, writeInRegister.value);

    if (checkFixedRegisters) {
      const row = tabulatorInstance.current?.getRow(writeInRegister.registerName);
      if (row && !row.getData().watched) {
        row.update({ watched: true });
        tabulatorInstance.current?.setGroupBy('watched');
         setTimeout(() => {
        tabulatorInstance.current?.scrollToRow(writeInRegister.registerName, "center", false);
      }, 0);
      }
    }

    setFixedchangedRegisters((prev) => [...prev, writeInRegister.registerName]);
    setWriteInRegister({ registerName: '', value: '' });

  }, [
    writeInRegister,
    setWriteInRegister,
    isTableBuilt,
    setFixedchangedRegisters,
    checkFixedRegisters,
    setRegisterData,
    tabulatorInstance,
  ]);


  useEffect(() => {
    if (!isTableBuilt || !checkFixedRegisters) {
      return;
    }
    
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