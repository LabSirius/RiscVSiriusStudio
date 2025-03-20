// RoutesContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MemoryTableContextProps {
  showHexadecimal: boolean;
  setShowHexadecimal: React.Dispatch<React.SetStateAction<boolean>>;
 
}

const MemoryTableContext = createContext<MemoryTableContextProps | undefined>(undefined);

export const MemoryTableProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [showHexadecimal, setShowHexadecimal] = useState<boolean>(true);
 

  return (
    <MemoryTableContext.Provider value={{showHexadecimal, setShowHexadecimal}}>
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
