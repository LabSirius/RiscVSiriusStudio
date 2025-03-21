// RoutesContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

interface MemoryTableContextProps {
  showHexadecimal: boolean;
  setShowHexadecimal: React.Dispatch<React.SetStateAction<boolean>>;
  dataMemoryTable: Record<string, unknown> | undefined;
  setDataMemoryTable: React.Dispatch<React.SetStateAction<Record<string, unknown> | undefined>>;
  sizeMemory: number;
  setSizeMemory: React.Dispatch<React.SetStateAction<number>>;
  codeSize: number;
  setCodeSize: React.Dispatch<React.SetStateAction<number>>;
}

const MemoryTableContext = createContext<MemoryTableContextProps | undefined>(undefined);

export const MemoryTableProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [showHexadecimal, setShowHexadecimal] = useState<boolean>(true);
  const [dataMemoryTable, setDataMemoryTable] = useState<Record<string, unknown> | undefined>(
    undefined
  );
  const [sizeMemory, setSizeMemory] = useState<number>(0);
  const [codeSize, setCodeSize] = useState<number>(0);

  return (
    <MemoryTableContext.Provider
      value={{
        dataMemoryTable,
        setDataMemoryTable,
        showHexadecimal,
        setShowHexadecimal,
        sizeMemory,
        setSizeMemory,
        codeSize,
        setCodeSize,
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
