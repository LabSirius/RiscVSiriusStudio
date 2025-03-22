import React, { createContext, useContext, useState, ReactNode } from "react";


export interface MemoryRow {
  address: string; 
  hex: string;     
  value0: string;  
  value1: string;
  value2: string;
  value3: string;
}

export interface MemoryTableContextProps {
  isCreatedMemoryTable: boolean;  
  setIsCreatedMemoryTable: React.Dispatch<React.SetStateAction<boolean>>;
  showHexadecimal: boolean;
  setShowHexadecimal: React.Dispatch<React.SetStateAction<boolean>>;
  dataMemoryTable: Record<string, unknown> | undefined;
  setDataMemoryTable: React.Dispatch<React.SetStateAction<Record<string, unknown> | undefined>>;
  sizeMemory: number;
  setSizeMemory: React.Dispatch<React.SetStateAction<number>>;
  codeSize: number;
  setCodeSize: React.Dispatch<React.SetStateAction<number>>;
  importMemory: MemoryRow[];
  setImportMemory: React.Dispatch<React.SetStateAction<MemoryRow[]>>;
  newPc: number;
  setNewPc: React.Dispatch<React.SetStateAction<number>>;
}

const MemoryTableContext = createContext<MemoryTableContextProps | undefined>(undefined);

export const MemoryTableProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isCreatedMemoryTable, setIsCreatedMemoryTable] = useState<boolean>(false);
  const [showHexadecimal, setShowHexadecimal] = useState<boolean>(true);
  const [dataMemoryTable, setDataMemoryTable] = useState<Record<string, unknown> | undefined>(
    undefined
  );
  const [sizeMemory, setSizeMemory] = useState<number>(0);
  const [codeSize, setCodeSize] = useState<number>(0);
  const [importMemory, setImportMemory] = useState<MemoryRow[]>([]);
  const [newPc, setNewPc] = useState<number>(0);

  return (
    <MemoryTableContext.Provider
      value={{
        isCreatedMemoryTable, 
        setIsCreatedMemoryTable,
        dataMemoryTable,
        setDataMemoryTable,
        showHexadecimal,
        setShowHexadecimal,
        sizeMemory,
        setSizeMemory,
        codeSize,
        setCodeSize,
        importMemory,
        setImportMemory,
        newPc, 
        setNewPc
      }}>
      {children}
    </MemoryTableContext.Provider>
  );
};

export const useMemoryTable = (): MemoryTableContextProps => {
  const context = useContext(MemoryTableContext);
  if (!context) {
    throw new Error("useRoutes debe usarse dentro de un RoutesProvider");
  }
  return context;
};
