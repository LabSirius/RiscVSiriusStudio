import { useEffect } from 'react';

/**
 * Props for the useResetRegistersOnNewSimulation hook.
 */
interface UseResetRegistersOnNewSimulationProps {
  /**
   * Boolean indicating whether the memory table has been created.
   * Reset is triggered when this value is `false`.
   */
  isCreatedMemoryTable: boolean;
  /**
   * Function to update the state of the register data.
   */
  setRegisterData: React.Dispatch<React.SetStateAction<string[]>>;
  /**
   * Function to reset the list of registers that have been modified and fixed.
   */
  setFixedchangedRegisters: React.Dispatch<React.SetStateAction<string[]>>;
}

/**
 * Custom hook that resets the state of the registers when starting a new simulation.
 * Listens for changes in `isCreatedMemoryTable` and, when it is `false`, clears the
 * register data and the list of modified registers.
 * @param props - The dependencies and setters required for the hook.
 */
export const useResetRegistersOnNewSimulation = ({
  isCreatedMemoryTable,
  setRegisterData,
  setFixedchangedRegisters,
}: UseResetRegistersOnNewSimulationProps): void => {
  useEffect(() => {
    // If the memory table is not created, it means we are in a new simulation
    // or in the initial state, so we reset everything.
    if (!isCreatedMemoryTable) {
      setFixedchangedRegisters([]);
      setRegisterData(Array(32).fill('0'.repeat(32)));
    }
  }, [isCreatedMemoryTable, setRegisterData, setFixedchangedRegisters]);
};