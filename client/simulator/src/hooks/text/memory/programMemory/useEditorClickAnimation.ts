import { useEffect, MutableRefObject, } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import { animateRow, animateArrowBetweenCells } from '@/utils/tables/handlersMemory'; 
import { binaryToIntTwoComplement } from '@/utils/handlerConversions'; 
/**
 * Props for the useEditorClickAnimation hook.
 */
interface UseEditorClickAnimationProps {
  isCreatedMemoryTable: boolean;
  tableInstanceRef: MutableRefObject<Tabulator | null>;
  clickInEditorLine: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setClickInEditorLine: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dataMemoryTable: any;
}

/**
 * Custom hook to handle animations in the memory table when a line in the code editor is clicked.
 * This is a direct 1-to-1 mapping of the original component's useEffect.
 */
export const useEditorClickAnimation = ({
  isCreatedMemoryTable,
  tableInstanceRef,
  clickInEditorLine,
  setClickInEditorLine,
  dataMemoryTable,
}: UseEditorClickAnimationProps): void => {
  useEffect(() => {
    // ---- LÓGICA 100% IDÉNTICA A LA ORIGINAL ----
    if (!isCreatedMemoryTable || clickInEditorLine === -1) return;
    const position = dataMemoryTable?.addressLine.findIndex(
      (item: { line: number }) => item.line === clickInEditorLine
    );
    if (position !== -1) {
      if (tableInstanceRef.current && (position || position === 0)) {
        animateRow(tableInstanceRef.current, position * 4);
        if (dataMemoryTable?.addressLine[position].jump) {
          const intJump = Number(
            binaryToIntTwoComplement(String(dataMemoryTable?.addressLine[position].jump))
          );
          const jumpTo = intJump + position * 4;
          if (tableInstanceRef.current) {
            animateArrowBetweenCells(tableInstanceRef.current, position * 4, jumpTo);
          }
        }
      }
      setClickInEditorLine(-1);
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clickInEditorLine, setClickInEditorLine, isCreatedMemoryTable]);
};