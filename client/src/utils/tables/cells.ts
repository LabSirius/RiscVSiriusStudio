import { Tabulator } from 'tabulator-tables';

/**
 * @param tabulatorRef   tabulatorInstance.current
 * @param registerName  Name of the register to animate
 */
export function animateRegister(
  tabulatorRef: React.MutableRefObject<Tabulator | null>,
  registerName: string
) {
  if (!tabulatorRef.current) return;
  
  const row = tabulatorRef.current.getRow(registerName);
  if (row) {
    const element = row.getElement();
    element.classList.add('animate-cell');
    setTimeout(() => {
      element.classList.remove('animate-cell');
    }, 500);
  }

  const index = parseInt(registerName.replace('x', ''), 10);
  const position = (index >= 0 && index <= 12) ? "center" : "top";

  tabulatorRef.current.scrollToRow(registerName, position, true);
}
