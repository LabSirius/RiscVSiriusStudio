import React, { createContext, useContext, useState, ReactNode } from "react";

interface MemoryData {
  memory: string[];            
  codeSize: number;        
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
  symbols: Record<string, any>;
}


interface MemoryRow {
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
  dataMemoryTable: MemoryData | undefined;  // usa la interfaz importada
  setDataMemoryTable: React.Dispatch<React.SetStateAction<MemoryData | undefined>>;
  sizeMemory: number;
  setSizeMemory: React.Dispatch<React.SetStateAction<number>>;
  codeSize: number;
  setCodeSize: React.Dispatch<React.SetStateAction<number>>;
  importMemory: MemoryRow[];
  setImportMemory: React.Dispatch<React.SetStateAction<MemoryRow[]>>;
  newPc: number;
  setNewPc: React.Dispatch<React.SetStateAction<number>>;
  searchInMemory: string;
  setSearchInMemory: React.Dispatch<React.SetStateAction<string>>;
}

const MemoryTableContext = createContext<MemoryTableContextProps | undefined>(undefined);

export const MemoryTableProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isCreatedMemoryTable, setIsCreatedMemoryTable] = useState<boolean>(false);
  const [showHexadecimal, setShowHexadecimal] = useState<boolean>(true);
  const [dataMemoryTable, setDataMemoryTable] = useState<MemoryData | undefined>(undefined);
  const [sizeMemory, setSizeMemory] = useState<number>(0);
  const [codeSize, setCodeSize] = useState<number>(0);
  const [importMemory, setImportMemory] = useState<MemoryRow[]>([]);
  const [newPc, setNewPc] = useState<number>(0);
  const [searchInMemory, setSearchInMemory] = useState<string>("");

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
        setNewPc,
        searchInMemory, 
        setSearchInMemory
      }}>
      {children}
    </MemoryTableContext.Provider>
  );
};

export const useMemoryTable = (): MemoryTableContextProps => {
  const context = useContext(MemoryTableContext);
  if (!context) {
    throw new Error("useMemoryTable debe usarse dentro de un MemoryTableProvider");
  }
  return context;
};
