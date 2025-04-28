/**
 * This function filters the data in a Tabulator table based on the search input.
 */

export type RegisterView = 2 | 16 | "signed" | "unsigned" | "ascii";

export interface SymbolData {
  memdef: number;
  name: string;
}

export interface DataMemoryTable {
  memory: string[];
  codeSize: number;
  symbols: Record<string, SymbolData>;
}

export interface MemoryRow {
  index?: number;
  address: string;
  value0: string;
  value1: string;
  value2: string;
  value3: string;
  info: string;
  hex: string;
}


export type RowData = {
  name?: string;
  value?: string;
};