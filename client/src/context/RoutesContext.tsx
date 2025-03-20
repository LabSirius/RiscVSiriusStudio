// RoutesContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface RoutesContextProps {
  routes: string;
  setRoutes: React.Dispatch<React.SetStateAction<string>>;
  dataMemoryTable: Record<string, unknown> | undefined;
  setDataMemoryTable: React.Dispatch<React.SetStateAction<Record<string, unknown> | undefined>>;
}

const RoutesContext = createContext<RoutesContextProps | undefined>(undefined);

export const RoutesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [routes, setRoutes] = useState<string>('');
  const [dataMemoryTable, setDataMemoryTable] = useState<Record<string, unknown> | undefined>(undefined);

  return (
    <RoutesContext.Provider value={{ routes, setRoutes, dataMemoryTable, setDataMemoryTable }}>
      {children}
    </RoutesContext.Provider>
  );
};

export const useRoutes = (): RoutesContextProps => {
  const context = useContext(RoutesContext);
  if (!context) {
    throw new Error('useRoutes debe usarse dentro de un RoutesProvider');
  }
  return context;
};
