// RoutesContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MemoryTableContextProps {
  showHexadecimal: boolean;
  setShowHexadecimal: React.Dispatch<React.SetStateAction<boolean>>;
   dataMemoryTable: Record<string, unknown> | undefined;
   setDataMemoryTable: React.Dispatch<React.SetStateAction<Record<string, unknown> | undefined>>;
}

const MemoryTableContext = createContext<MemoryTableContextProps | undefined>(undefined);

export const MemoryTableProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [showHexadecimal, setShowHexadecimal] = useState<boolean>(true);
  const [dataMemoryTable, setDataMemoryTable] = useState<Record<string, unknown> | undefined>(undefined);
 

  return (
    <MemoryTableContext.Provider value={{dataMemoryTable, setDataMemoryTable, showHexadecimal, setShowHexadecimal}}>
      {children}
    </MemoryTableContext.Provider>
  );
};

export const useMemoryTable = (): MemoryTableContextProps => {
  const context = useContext(MemoryTableContext);
  if (!context) {
    throw new Error('useRoutes debe usarse dentro de un RoutesProvider');
  }
  return context;
};
