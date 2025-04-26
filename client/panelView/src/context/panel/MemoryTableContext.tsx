import React, { createContext, useContext, useState, ReactNode } from "react";

interface AddressLine{
  line: number;
  jump: number;
}

interface MemoryData {
  memory: string[];            
  codeSize: number;        
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
  symbols: Record<string, any>;
  addressLine : AddressLine[];
  
}
interface MemoryRow {
  address: string; 
  hex: string;      
  value0: string;   
  value1: string;   
  value2: string;   
  value3: string;  
}

interface WriteInMemory {
  address: number;
  value: string;
  _length: number;
}
interface ReadInMemory {
  address: number;
  value: string;
  _length: number;
}

export interface MemoryTableContextProps {
  isCreatedMemoryTable: boolean;  
  setIsCreatedMemoryTable: React.Dispatch<React.SetStateAction<boolean>>;

  dataMemoryTable: MemoryData | undefined;  
  setDataMemoryTable: React.Dispatch<React.SetStateAction<MemoryData | undefined>>;

  sizeMemory: number
  setSizeMemory: React.Dispatch<React.SetStateAction<number>>;

  sp: string;
  setSp: React.Dispatch<React.SetStateAction<string>>;

  importMemory: MemoryRow[];
  setImportMemory: React.Dispatch<React.SetStateAction<MemoryRow[]>>;
  
  searchInMemory: string;
  setSearchInMemory: React.Dispatch<React.SetStateAction<string>>;

  showHex: boolean;
  setShowHex: React.Dispatch<React.SetStateAction<boolean>>;

  writeInMemory: WriteInMemory;
  setWriteInMemory: React.Dispatch<React.SetStateAction<WriteInMemory>>;

  readInMemory: ReadInMemory;
  setReadInMemory: React.Dispatch<React.SetStateAction<ReadInMemory>>;

  locatePc: boolean;
  setLocatePc: React.Dispatch<React.SetStateAction<boolean>>;
}



const MemoryTableContext = createContext<MemoryTableContextProps | undefined>(undefined);

export const MemoryTableProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isCreatedMemoryTable, setIsCreatedMemoryTable] = useState<boolean>(false);
  const [dataMemoryTable, setDataMemoryTable] = useState<MemoryData | undefined>(undefined);
  const [sizeMemory, setSizeMemory] = useState<number>(0);
  const [sp, setSp] = useState<string>('');
  const [importMemory, setImportMemory] = useState<MemoryRow[]>([]);
  const [searchInMemory, setSearchInMemory] = useState<string>("");
  const [showHex, setShowHex] = useState<boolean>(true);
  const [writeInMemory, setWriteInMemory] = useState<WriteInMemory>({ address: 0, value: '', _length: 0 });
  const [readInMemory, setReadInMemory] = useState<ReadInMemory>({ address: 0, value: '-1' , _length: 0, });
  const [locatePc, setLocatePc] = useState<boolean>(false);

  return (
    <MemoryTableContext.Provider
      value={{
        isCreatedMemoryTable, 
        setIsCreatedMemoryTable,
        dataMemoryTable,
        setDataMemoryTable,
        sizeMemory,
        setSizeMemory,
        sp,
        setSp,
        importMemory,
        setImportMemory,
        searchInMemory, 
        setSearchInMemory,
        showHex,
        setShowHex,
        writeInMemory, 
        setWriteInMemory,
        readInMemory,
        setReadInMemory,
        locatePc,
        setLocatePc
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
