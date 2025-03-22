import { registerNamesFormatter, valueFormatter, valueRegisterEditor, attachConvertionToggle } from '@/utils/tables/definitions/handlerDefinitions';
import { possibleViews } from '@/constants/data';

import { ColumnDefinition, CellComponent } from 'tabulator-tables';
import { binaryMemEditor, createTooltip, attachMemoryConversionToggle } from '@/utils/tables/definitions/handlerDefinitions';


// This function returns the definitions of the columns for the register table.
export const getColumnsRegisterDefinitions = ( viewTypeFormatter: (cell: CellComponent) => HTMLElement): ColumnDefinition[] => {
    const defaultAttrs: ColumnDefinition = {
      title: '',
      visible: true,
      headerSort: false,
      headerHozAlign: 'center',
      formatter: 'html',
    };
  
    const frozenAttrs: ColumnDefinition = { ...defaultAttrs, frozen: true };
  
    const editableAttrs: ColumnDefinition = {
      ...frozenAttrs,
      editor: valueRegisterEditor,
      editable: (cell: CellComponent) => cell.getData().name !== 'x0 zero',
      cssClass: 'font-mono',
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
        cellDblClick: (_e, cell: CellComponent) => {
          const data = cell.getData();
          const updatedData = { ...data, watched: !data.watched };
          cell.getRow().update(updatedData);
        },
      },
      {
        ...editableAttrs,
        title: 'Value',
        field: 'value',
        width: 160,
        formatter: valueFormatter,
        // editor ya está definido en editableAttrs
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


/**
 * This function returns the definitions of the columns for the memory table.
 */
export const getColumnMemoryDefinitions = (): ColumnDefinition[] => {
    const defaultAttrs: ColumnDefinition = {
      title: '',
      visible: true,
      headerSort: false,
      headerHozAlign: 'center',
      formatter: 'html',
    };
    const frozenAttrs: ColumnDefinition = { ...defaultAttrs, frozen: true };
    const editableAttrs: ColumnDefinition = {
      ...frozenAttrs,
      editor: binaryMemEditor,
      editable: true,
      cellMouseEnter: (_e, cell) => attachMemoryConversionToggle(cell),
    };

    return [
      { ...defaultAttrs, visible: false, field: 'index' },
      {
        ...frozenAttrs,
        title: 'Info',
        field: 'info',
        width: 60,
        formatter: (cell) => `<span class="block whitespace-nowrap overflow-hidden truncate text-white ">${cell.getValue()}</span>`,
        
        tooltip: (e: MouseEvent, cell: CellComponent, onRendered: (cb: () => void) => void) =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          createTooltip(e, cell, onRendered) as any,
      },
      {
        ...frozenAttrs,
        title: 'Addr.',
        field: 'address',
        sorter: (a: string, b: string) => parseInt(a, 16) - parseInt(b, 16),
        headerSort: true,
        width: 75,
        formatter: (cell) => `<span class="address-value">${(cell.getValue() as string).toUpperCase()}</span>`,
        cellMouseEnter: (_e, cell) => attachMemoryConversionToggle(cell),
      },
      { ...editableAttrs, title: '0x3', field: 'value3', width: 83 },
      { ...editableAttrs, title: '0x2', field: 'value2', width: 83 },
      { ...editableAttrs, title: '0x1', field: 'value1', width: 83 },
      { ...editableAttrs, title: '0x0', field: 'value0', width: 83 },
      { ...frozenAttrs, title: 'HEX', field: 'hex', width: 100 },
    ];
  };
