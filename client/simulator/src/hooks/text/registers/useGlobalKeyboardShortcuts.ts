import { useEffect, MutableRefObject } from 'react';
import { CellComponent } from 'tabulator-tables';
import { handleGlobalKeyPress } from '@/utils/tables/handlersRegisters'; // Make sure this path is correct

/**
 * Props for the useGlobalKeyboardShortcuts hook.
 */
interface UseGlobalKeyboardShortcutsProps {
  /**
   * A boolean flag indicating if the table has been fully built.
   * The event listener will only be active if this is true.
   */
  isTableBuilt: boolean;
  /**
   * A React ref pointing to the currently hovered cell of type 'viewType'.
   * This is used by the key press handler to change the cell's view type (e.g., hex, bin, dec).
   */
  hoveredCellRef: MutableRefObject<CellComponent | null>;
}

/**
 * A custom hook to manage global keyboard shortcuts for the table.
 * It adds a 'keydown' event listener to the document when the table is built.
 * It also handles the cleanup of the event listener to prevent memory leaks.
 *
 * @param props The dependencies required by the hook.
 */
export const useGlobalKeyboardShortcuts = ({
  isTableBuilt,
  hoveredCellRef,
}: UseGlobalKeyboardShortcutsProps): void => {
  useEffect(() => {
    // Do not attach the listener until the Tabulator instance is fully built.
    if (!isTableBuilt) {
      return;
    }

    // Create the handler function, passing the ref to the currently hovered cell.
    const keyHandler = handleGlobalKeyPress(hoveredCellRef);

    // Add the event listener to the global document object.
    document.addEventListener('keydown', keyHandler);

    // Cleanup function: remove the event listener when the component unmounts
    // or when the dependencies change.
    return () => {
      document.removeEventListener('keydown', keyHandler);
    };
  }, [isTableBuilt, hoveredCellRef]); // Effect dependencies.
};