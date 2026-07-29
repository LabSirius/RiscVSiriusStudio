import { registerNamesFormatter, valueFormatter, valueRegisterEditor, attachConvertionToggle } from '@/utils/tables/definitions/handlerDefinitions';
import { possibleViews } from '@/components/panel/Sections/constants/data';

import { ColumnDefinition, CellComponent } from 'tabulator-tables';
import { buildMemoryColumns } from '@/utils/tables/definitions/memoryColumns';
import { MutableRefObject } from 'react';


// This function returns the definitions of the columns for the register table.
export const getColumnsRegisterDefinitions = ( viewTypeFormatter: (cell: CellComponent) => HTMLElement, isFirstStep : boolean, theme: string): ColumnDefinition[]=>{
    const defaultAttrs: ColumnDefinition = {
      title: '',
      visible: true,
      headerSort: false,
      headerHozAlign: 'center',
      formatter: 'html',
      cssClass: 'monospace'
    };
  
    const frozenAttrs: ColumnDefinition = { ...defaultAttrs, frozen: true };
  
    const editableAttrs: ColumnDefinition = {
      ...frozenAttrs,
      editor: valueRegisterEditor,
      editable: function (cell: CellComponent) { 
        if(isFirstStep) return false;
        return cell.getData().name !== 'x0 zero'
      },
      cellMouseEnter: (_e, cell: CellComponent) => {
        attachConvertionToggle(cell);
      },
    };
  
    return [
      {
        ...frozenAttrs,
        title: 'Name',
        field: 'name',
        frozen: true,
        width: 100,
        formatter: registerNamesFormatter,
        cellClick: (_e, cell: CellComponent) => {
          const data = cell.getData();
          const updatedData = { ...data, watched: !data.watched };
          cell.getRow().update(updatedData);
          cell.getTable().setGroupBy("watched");
        }
      },
      {
        ...editableAttrs,
        title: 'Value',
        field: 'value',
        width: 160,
        formatter: valueFormatter,
        formatterParams: {
          theme,
        },
        cellMouseEnter: (_e, cell: CellComponent) => {
          attachConvertionToggle(cell);
        },
      },
      {
        title: "Type",
        field: "viewType",
        width: 80,
        editor: "list",
        editorParams: { values: possibleViews },
        formatter: viewTypeFormatter,
        cellEdited: (cell: CellComponent) => cell.getRow().reformat(),
        editable: () => true,
      },
      {
        title: 'Watched',
        field: 'watched',
        visible: false,
      },
    ];
  };


// The three memory-table column builders now delegate to one parameterized
// builder (`buildMemoryColumns`); they differ only by mode. See memoryColumns.ts.

/** Available-memory, binary bytes visible. */
export const getColumnMemoryDefinitions = (isFirstStepRef: MutableRefObject<boolean>): ColumnDefinition[] =>
  buildMemoryColumns("bin", isFirstStepRef);

/** Available-memory, HEX-only (byte columns hidden). */
export const getColumnHexMemoryDefinitions = (isFirstStepRef: MutableRefObject<boolean>): ColumnDefinition[] =>
  buildMemoryColumns("hex", isFirstStepRef);

/** Program (instruction) memory. */
export const getColumnProgramMemoryDefinitions = (isFirstStepRef: MutableRefObject<boolean>): ColumnDefinition[] =>
  buildMemoryColumns("program", isFirstStepRef);
  

const pipelineCellFormatter = (cell: CellComponent): string => {
  const data = cell.getValue();

  if (!data || data.pc === -1) {
    return `<div class="cell-stall">${data.asm}</div>`;
  }

  return `
    <div class="cell-pc">${data.pc}</div>
    <div class="cell-asm">${data.asm}</div>
  `;
};

export const getPipelineColumnDefinitions = (): ColumnDefinition[] => {
  const defaultColumnAttrs: ColumnDefinition = {
    title: "",
    hozAlign: "center",
    vertAlign: "middle",
    headerSort: false,
    cssClass: "monospace",
    width: 160,
    formatter: pipelineCellFormatter, 
  };

  return [
    { ...defaultColumnAttrs, title: "IF", field: "IF" },
    { ...defaultColumnAttrs, title: "ID", field: "ID" },
    { ...defaultColumnAttrs, title: "EX", field: "EX" },
    { ...defaultColumnAttrs, title: "MEM", field: "MEM" },
    { ...defaultColumnAttrs, title: "WB", field: "WB" },
  ];
};