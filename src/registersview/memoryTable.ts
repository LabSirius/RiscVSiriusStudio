import { ColumnDefinition, TabulatorFull as Tabulator } from "tabulator-tables";

import { CellComponent } from "tabulator-tables";

import { intToHex, binaryToHex } from "../utilities/conversions";
import { chunk } from "lodash-es";

export class MemoryTable {
  public table: Tabulator;
  private tableData: any[];
  private memorySize: number;
  private readonly sendMessagetoExtension: (msg: any) => void;
  public codeAreaEnd: number;
  public pc: number;
  private sp: string;

  private binaryMemEditor = (
    cell: CellComponent,
    onRendered: (cb: () => void) => void,
    success: (value: string) => void,
    cancel: (restore?: boolean) => void,
    editorParams: any
  ): HTMLInputElement => {
    const editor = document.createElement("input");
    editor.className = "binary-editor";
    editor.value = cell.getValue();
    editor.maxLength = 8;

    onRendered(() => {
      editor.focus();
      editor.select();
    });

    const formatValue = (value: string): string => value.padStart(8, "0").slice(0, 8);

    const commitEdit = () => {
      const rawValue = editor.value.replace(/[^01]/g, "");
      const formattedValue = formatValue(rawValue);
      editor.value = formattedValue;
      success(formattedValue);
    };

    editor.addEventListener("input", () => {
      editor.value = editor.value.replace(/[^01]/g, "");
    });
    editor.addEventListener("blur", commitEdit);
    editor.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        commitEdit();
      }
      if (e.key === "Escape") {
        cancel();
      }
    });

    return editor;
  };

  constructor(
    memory: string[],
    codeSize: number,
    symbols: any[],
    sendMessagetoExtension: (msg: any) => void
  ) {
    this.memorySize = memory.length;
    this.sendMessagetoExtension = sendMessagetoExtension;
    this.sp = "";
    this.pc = 0;
    this.codeAreaEnd = codeSize;
    this.tableData = this.generateTableData(memory);

    this.table = this.initializeTable();

    this.table.on("tableBuilt", () => {
      this.highlightCodeArea(codeSize);
      this.labelHeap(codeSize);
      this.labelSymbols(symbols);
      this.updatePC(0);
    });

    this.setupEventListeners();
  }

  private generateTableData(memory: string[]): any[] {
    return chunk(memory, 4).map((word, index) => {
      const address = intToHex(index * 4).toUpperCase();
      const hex = word
        .slice()
        .reverse()
        .map((byte) => binaryToHex(byte).toUpperCase().padStart(2, "0"))
        .join("-");
      return {
        index,
        address,
        value0: word[0],
        value1: word[2],
        value2: word[1],
        value3: word[3],
        info: "",
        hex,
      };
    });
  }

  private initializeTable(): Tabulator {
    return new Tabulator("#tabs-memory", {
      layout: "fitColumns",
      layoutColumnsOnNewData: true,
      index: "address",
      data: this.tableData,
      reactiveData: true,
      validationMode: "blocking",
      initialSort: [{ column: "address", dir: "desc" }],
      columns: this.getColumnDefinitions(),
    });
  }

  private getColumnDefinitions(): ColumnDefinition[] {
    const defaultAttrs: ColumnDefinition = {
      title: "",
      visible: true,
      headerSort: false,
      headerHozAlign: "center",
      formatter: "html",
    };

    const frozenAttrs: ColumnDefinition = { ...defaultAttrs, frozen: true };

    const editableAttrs: ColumnDefinition = {
      ...frozenAttrs,
      editor: this.binaryMemEditor,
      editable: true,
      cellMouseEnter: (_e, cell) => this.attachMemoryConversionToggle(cell),
    };

    return [
      { ...defaultAttrs, visible: false, field: "index" },
      {
        ...frozenAttrs,
        title: "Info",
        field: "info",
        width: 60,
        formatter: (cell) => `<span class="truncated-info">${cell.getValue()}</span>`,
        tooltip: ((e: any, cell: any, onRendered: any) =>
          this.createTooltip(e, cell, onRendered)) as any,
      },
      {
        ...frozenAttrs,
        title: "Addr.",
        field: "address",
        sorter: (a, b) => parseInt(a, 16) - parseInt(b, 16),
        headerSort: true,
        width: 75,
        formatter: (cell) => `<span class="address-value">${cell.getValue().toUpperCase()}</span>`,
        cellMouseEnter: (_e, cell) => this.attachMemoryConversionToggle(cell),
      },
      { ...editableAttrs, title: "0x3", field: "value3", width: 83 },
      { ...editableAttrs, title: "0x2", field: "value2", width: 83 },
      { ...editableAttrs, title: "0x1", field: "value1", width: 83 },
      { ...editableAttrs, title: "0x0", field: "value0", width: 83 },
      { ...frozenAttrs, title: "HEX", field: "hex", width: 100 },
    ];
  }

  private createTooltip(e: any, cell: any, onRendered: any): HTMLElement {
    const value = cell.getValue();
    const tooltip = document.createElement("div");
    tooltip.className = "custom-tooltip";
    tooltip.innerHTML = value;

    onRendered(() => {
      tooltip.style.position = "absolute";
      tooltip.style.left = `${e.clientX + 17}px`;
      tooltip.style.top = `${e.clientY - 22}px`;
      document.body.appendChild(tooltip);
    });
    return tooltip;
  }

  private highlightCodeArea(codeSize: number): void {
    this.table.getRows().forEach((row) => {
      if (row.getData().index * 4 < codeSize) {
        row.getElement().style.backgroundColor = "#FFF6E5";
      }
    });
  }

  private labelHeap(codeSize: number): void {
    const heapAddressHex = intToHex(codeSize).toUpperCase();
    this.table.updateRow(heapAddressHex, {
      info: `<span class="info-column-mem-table">Heap</span>`,
    });
  }

  private labelSymbols(symbols: any[]): void {
    Object.values(symbols).forEach((symbol: any) => {
      const memdefHex = intToHex(symbol.memdef).toUpperCase();
      this.table.updateOrAddRow(memdefHex, {
        info: `<span class="info-column-mem-table">${symbol.name}</span>`,
      });
    });
  }

  public reInitializeTable(): void {
    this.table = this.initializeTable();
  }

  public setSP(value: string): void {
    if (this.sp && this.table.getRow(this.sp)) {
      this.table.getRow(this.sp).update({ info: "" });
    }
    const address = binaryToHex(value).toUpperCase();
    if (this.table.getRow(address)) {
      this.table.getRow(address).update({
        info: `<span class="info-column-mem-table">SP</span>`,
      });
    }
    this.sp = address;
  }

  public updatePC(newPC: number, spinner?: HTMLElement, memorySizeinput?: HTMLElement): void {
    this.pc = newPC;
    document.querySelectorAll(".pc-icon").forEach((icon) => icon.remove());

    const targetValue = (newPC * 4).toString(16).toUpperCase();
    const foundRows = this.table.searchRows("address", "=", targetValue);
    if (foundRows.length === 0) {
      return;
    }

    const cell = foundRows[0].getCell("address");
    if (!cell) {
      return;
    }

    const cellElement = cell.getElement();
    cellElement.appendChild(this.createPCIcon());
    cellElement.classList.add("animate-pc");
    void cellElement.offsetWidth;
    setTimeout(() => cellElement.classList.remove("animate-pc"), 500);

    spinner?.classList.add("hidden");
    memorySizeinput?.removeAttribute("disabled");
  }

  private createPCIcon(): HTMLElement {
    const icon = document.createElement("span");
    icon.className = "pc-icon";
    icon.style.position = "absolute";
    icon.style.top = "51%";
    icon.style.right = "5px";
    icon.style.transform = "translateY(-50%)";
    icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                         fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"
                         class="lucide lucide-locate">
                         <line x1="2" x2="5" y1="12" y2="12"></line>
                         <line x1="19" x2="22" y1="12" y2="12"></line>
                         <line x1="12" x2="12" y1="2" y2="5"></line>
                         <line x1="12" x2="12" y1="19" y2="22"></line>
                         <circle cx="12" cy="12" r="7"></circle>
                       </svg>`;
    return icon;
  }

  private updateHexValue(row: any): void {
    const fields = ["value3", "value2", "value1", "value0"];
    const hexValue = fields
      .map((field) => parseInt(row.getData()[field], 2).toString(16).padStart(2, "0"))
      .join("-");
    row.update({ hex: hexValue });
  }

  private setupEventListeners(): void {
    this.table.on("cellEdited", (cell) => {
      if (cell.getField().startsWith("value")) {
        this.updateHexValue(cell.getRow());
        this.sendMessagetoExtension({
          command: "event",
          object: { event: "memoryChanged", value: this.table.getData() },
        });
      }
    });
  }

  private attachMemoryConversionToggle(cell: CellComponent): void {
    const cellElement = cell.getElement();
    const isAddressField = cell.getField() === "address";
    const valueElement = isAddressField ? cellElement.querySelector(".address-value") : cellElement;
    let originalContent = valueElement ? valueElement.innerHTML : cellElement.innerHTML;
    let isConverted = false;
    let activeKey: string | null = null;

    const handleKeyDown = (evt: KeyboardEvent) => {
      if (
        isConverted ||
        document.querySelector("input.binary-editor") ||
        document.querySelector("input.register-editor")
      ) {
        return;
      }

      const cellValue = cell.getValue();
      let newContent: string | null = null;
      const key = evt.key.toLowerCase();

      if (isAddressField) {
        if (key === "d") {
          newContent = parseInt(cellValue, 16).toString();
          activeKey = "d";
        } else if (key === "b") {
          newContent = parseInt(cellValue, 16).toString(2);
          activeKey = "b";
        }
      } else if (cell.getField().startsWith("value")) {
        if (key === "d") {
          newContent = parseInt(cellValue, 2).toString();
          activeKey = "d";
        } else if (key === "h") {
          newContent = parseInt(cellValue, 2).toString(16).toUpperCase();
          activeKey = "h";
        }
      }
      if (newContent && valueElement) {
        isConverted = true;
        valueElement.innerHTML = newContent;
      }
    };

    const handleKeyUp = (evt: KeyboardEvent) => {
      if (activeKey && evt.key.toLowerCase() === activeKey && isConverted && valueElement) {
        isConverted = false;
        activeKey = null;
        valueElement.innerHTML = originalContent;
      }
    };

    const addListeners = () => {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("keyup", handleKeyUp);
    };

    const removeListeners = () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      if (isConverted && valueElement) {
        isConverted = false;
        activeKey = null;
        valueElement.innerHTML = originalContent;
      }
    };

    cellElement.addEventListener("mouseenter", addListeners);
    cellElement.addEventListener("mouseleave", removeListeners);
  }

  public importMemory(content: string): void {
    const heapRow = this.table.getRows().find((row) => row.getData().info.includes("Heap"));
    if (!heapRow) {
      return;
    }

    const heapAddress = parseInt(heapRow.getData().address, 16);
    const lines = content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");

    const newData: any[] = [];
    for (const line of lines) {
      const parts = line.split(":");
      if (parts.length !== 2) {
        console.error(`Invalid format in line: ${line}`);
        return;
      }
      const address = parseInt(parts[0].trim(), 16);
      if (address < heapAddress) {
        throw new Error(
          "Cannot import data into the instruction reserved area. Invalid address: " +
            parts[0].trim()
        );
      }
      const binaryValue = parts[1].trim();
      if (binaryValue.length !== 32 || !/^[01]+$/.test(binaryValue)) {
        console.error(`Invalid value in line ${line}`);
        return;
      }

      const value0 = binaryValue.slice(24, 32);
      const value1 = binaryValue.slice(16, 24);
      const value2 = binaryValue.slice(8, 16);
      const value3 = binaryValue.slice(0, 8);
      const hex = [value3, value2, value1, value0]
        .map((val) => parseInt(val, 2).toString(16).padStart(2, "0"))
        .join("-")
        .toUpperCase();

      newData.push({
        address: address.toString(16).toLowerCase(),
        value0,
        value1,
        value2,
        value3,
        hex,
      });
    }
    this.table.updateOrAddData(newData);
  }

  public resizeMemory(newSize: number, spinner?: HTMLElement, memorySizeinput?: HTMLElement): void {
    const userMemStart = this.codeAreaEnd;
    const userMemEnd = userMemStart + newSize;
    const codeData = this.table.getData().filter((row) => parseInt(row.address, 16) < userMemStart);

    const newMemoryData = [];
    for (let addr = userMemStart; addr < userMemEnd; addr += 4) {
      newMemoryData.push({
        address: intToHex(addr).toUpperCase(),
        value0: "00000000",
        value1: "00000000",
        value2: "00000000",
        value3: "00000000",
        info: "",
        hex: "00-00-00-00",
      });
    }

    newMemoryData[0].info = `<span class="info-column-mem-table">Heap</span>`;

    const newTableData = codeData.concat(newMemoryData);

    this.table.destroy();
    this.table = new Tabulator("#tabs-memory", {
      layout: "fitColumns",
      index: "address",
      data: newTableData,
      columns: this.getColumnDefinitions(),
      initialSort: [{ column: "address", dir: "desc" }],
      rowFormatter: (row) => {
        const data = row.getData();
        row.getElement().style.backgroundColor =
          parseInt(data.address, 16) < userMemStart ? "#FFF6E5" : "";
      },
    });

    this.table.on("tableBuilt", () => {
      this.setupEventListeners();
      this.updatePC(0, spinner, memorySizeinput);
    });
  }

  public uploadMemory(memory: string[], codeSize: number, symbols: any[]): void {
    chunk(memory, 4).forEach((word, index) => {
      const address = intToHex(index * 4).toUpperCase();
      const hex = word
        .slice()
        .reverse()
        .map((byte) => binaryToHex(byte).toUpperCase().padStart(2, "0"))
        .join("-");
      this.table.updateOrAddRow(address, {
        address,
        value0: word[0],
        value1: word[2],
        value2: word[1],
        value3: word[3],
        info: "",
        hex,
      });
      if (index * 4 < codeSize) {
        this.table.getRow(address).getElement().style.backgroundColor = "#FFF6E5";
      }
    });

    const heapAddressHex = intToHex(codeSize).toUpperCase();
    this.table.updateOrAddRow(heapAddressHex, {
      info: `<span class="info-column-mem-table">Heap</span>`,
    });

    this.labelSymbols(symbols);
    this.updatePC(0);
  }

  public filterMemoryTableData(searchValue: string): void {
    this.resetMemoryCellColors();
    this.table.clearFilter(true);

    const searchTerms = searchValue.split(/\s+/);
    this.table.setFilter((data: any) => {
      const fields = ["address", "value3", "value2", "value1", "value0", "hex"];
      return searchTerms.every((term) =>
        fields.some((field) => (data[field] || "").toLowerCase().includes(term))
      );
    });

    this.table.getRows().forEach((row) => {
      row.getCells().forEach((cell) => {
        let cellText = cell.getValue()?.toString() || "";
        searchTerms.forEach((term) => {
          const regex = new RegExp(`(${term})`, "gi");
          cellText = cellText.replace(regex, `<mark>$1</mark>`);
        });
        cell.getElement().innerHTML = cellText;
      });
    });
  }

  public resetMemoryCellColors(): void {
    this.table.getRows().forEach((row) => {
      row.getCells().forEach((cell) => {
        cell.getElement().style.backgroundColor = "";
      });
    });
  }
}
