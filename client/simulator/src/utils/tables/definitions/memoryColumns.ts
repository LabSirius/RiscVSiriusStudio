import { ColumnDefinition, CellComponent } from "tabulator-tables";
import { MutableRefObject } from "react";
import {
  binaryMemEditor,
  createTooltip,
  attachMemoryConversionToggle,
} from "@/utils/tables/definitions/handlerDefinitions";

/**
 * The three memory tables — available-memory (binary bytes), available-memory
 * (hex-only), and program-memory (instruction encoding) — differ only in their
 * middle value columns. Everything else (the Info label, the sortable Addr.
 * column, the HEX column, the shared editable/frozen attribute blocks, the
 * radix hover-toggle) was copy-pasted three times in `definitionsColumns.ts`.
 *
 * This is the one parameterized builder those three collapse into: pass the
 * `mode` and the middle columns follow; the frame is shared.
 */
export type MemoryColumnMode = "bin" | "hex" | "program";

export const buildMemoryColumns = (
  mode: MemoryColumnMode,
  isFirstStepRef: MutableRefObject<boolean>
): ColumnDefinition[] => {
  const defaultAttrs: ColumnDefinition = {
    title: "",
    visible: true,
    headerSort: false,
    headerHozAlign: "center",
    formatter: "html",
    cssClass: "monospace",
  };
  const frozenAttrs: ColumnDefinition = { ...defaultAttrs, frozen: true };
  const editableAttrs: ColumnDefinition = {
    ...frozenAttrs,
    editor: binaryMemEditor,
    editable: function (cell) {
      const rowData = cell.getRow().getData();
      const isEditableStep = !isFirstStepRef.current;
      const isCodeSegment =
        rowData.segment === "program" || rowData.segment === "directivesReadOnlySize";
      return isEditableStep && !isCodeSegment;
    },
    cellMouseEnter: (_e, cell) => attachMemoryConversionToggle(cell),
  };

  const infoColumn: ColumnDefinition = {
    ...frozenAttrs,
    title: "Info",
    field: "info",
    width: 60,
    formatter: (cell) =>
      `<span class="block whitespace-nowrap overflow-hidden truncate text-white ">${cell.getValue()}</span>`,
    tooltip: (e: MouseEvent, cell: CellComponent, onRendered: (cb: () => void) => void) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createTooltip(e, cell, onRendered) as any,
  };

  const addressColumn: ColumnDefinition = {
    ...frozenAttrs,
    title: "Addr.",
    field: "address",
    sorter: (a: string, b: string) => parseInt(a, 16) - parseInt(b, 16),
    headerSort: true,
    width: 75,
    formatter: (cell) =>
      `<span class="address-value">${(cell.getValue() as string).toUpperCase()}</span>`,
    cellMouseEnter: (_e, cell) => attachMemoryConversionToggle(cell),
  };

  const hexColumn: ColumnDefinition = {
    ...frozenAttrs,
    title: "HEX",
    field: "hex",
    width: 110,
    // Each "XX-XX-XX-XX" byte pair is tagged with the value field it came from
    // (high byte first: value3..value0), so the available-memory rowFormatter can
    // colour the written bytes here to match the value cells.
    formatter: (cell) => {
      const fields = ["value3", "value2", "value1", "value0"];
      const bytes = (cell.getValue() as string)
        .toUpperCase()
        .split("-")
        .map((pair, i) => `<span class="hex-byte" data-hexfield="${fields[i] ?? ""}">${pair}</span>`)
        .join("-");
      return `<span class="hex-value">${bytes}</span>`;
    },
  };

  // The middle columns are the only thing that varies across the three tables.
  let middleColumns: ColumnDefinition[];
  if (mode === "program") {
    const escapeHtml = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    middleColumns = [
      {
        ...editableAttrs,
        title: "Instruction encoding",
        field: "instructionencoding",
        width: 340,
        hozAlign: "right",
      },
      {
        // The assembled instruction as text. Read-only (not editable like the
        // encoding); asm text is escaped since the column formatter is "html".
        // widthGrow lets it absorb the free space when the encoding column is
        // hidden (fitColumns otherwise leaves an empty gap), and yield when shown.
        ...frozenAttrs,
        title: "Instruction",
        field: "asmText",
        minWidth: 200,
        widthGrow: 1,
        hozAlign: "left",
        formatter: (cell) =>
          `<span class="whitespace-nowrap">${escapeHtml(String(cell.getValue() ?? ""))}</span>`,
      },
    ];
  } else {
    // "bin" shows the four byte columns; "hex" hides them (HEX-only view).
    const byteVisible = mode === "bin";
    middleColumns = [
      { ...editableAttrs, title: "0x3", field: "value3", width: 83, visible: byteVisible },
      { ...editableAttrs, title: "0x2", field: "value2", width: 83, visible: byteVisible },
      { ...editableAttrs, title: "0x1", field: "value1", width: 83, visible: byteVisible },
      { ...editableAttrs, title: "0x0", field: "value0", width: 83, visible: byteVisible },
    ];
  }

  const indexColumn: ColumnDefinition = { ...defaultAttrs, visible: false, field: "index" };

  // Program memory shows HEX before the (default-hidden) encoding and the
  // instruction text; the byte-mode tables trail HEX after the value columns.
  if (mode === "program") {
    return [indexColumn, infoColumn, addressColumn, hexColumn, ...middleColumns];
  }
  return [indexColumn, infoColumn, addressColumn, ...middleColumns, hexColumn];
};
