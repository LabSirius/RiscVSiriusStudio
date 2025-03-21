// RoutesContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface RegistersTableContextProps {
    sp: number;
    setSp: React.Dispatch<React.SetStateAction<number>>;
}

const RegistersTableContext = createContext<RegistersTableContextProps | undefined>(undefined);

export const RegistersTableProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sp, setSp] = useState<number>(0);
 

  return (
    <RegistersTableContext.Provider value={{sp, setSp}}>
      {children}
    </RegistersTableContext.Provider>
  );
};

export const useRegistersTable = (): RegistersTableContextProps => {
  const context = useContext(RegistersTableContext);
  if (!context) {
    throw new Error('useRoutes debe usarse dentro de un RoutesProvider');
  }
  return context;
};
