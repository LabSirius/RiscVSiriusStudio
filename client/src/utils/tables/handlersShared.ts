import { Tabulator, RowComponent, CellComponent } from 'tabulator-tables';


export function resetCellColors(table: Tabulator): void {
  table.getRows().forEach((row: RowComponent) => {
    row.getCells().forEach((cell: CellComponent) => {
      cell.getElement().style.backgroundColor = '';
      cell.getElement().style.borderBottom = '';
    });
  });
}