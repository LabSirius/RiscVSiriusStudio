import { useEffect, MutableRefObject } from 'react';

/**
 * Props for the useSyncIsFirstStepRef hook.
 */
interface UseSyncIsFirstStepRefProps {
  isCreatedMemoryTable: boolean;
  isFirstStep: boolean;
  isFirstStepRef: MutableRefObject<boolean>;
}

/**
 * Custom hook to synchronize the boolean 'isFirstStep' state into a ref.
 * This is a common pattern to provide the latest state value to callbacks
 * or other parts of the application without causing re-renders.
 * This is a direct 1-to-1 mapping of the original component's useEffect.
 */
export const useSyncIsFirstStepRef = ({
  isCreatedMemoryTable,
  isFirstStep,
  isFirstStepRef,
}: UseSyncIsFirstStepRefProps): void => {
  useEffect(() => {
    if (!isCreatedMemoryTable) return;
    isFirstStepRef.current = isFirstStep;
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFirstStep, isCreatedMemoryTable]);
};