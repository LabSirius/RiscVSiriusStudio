// RoutesContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface RegistersTableContextProps {
  registerData: string[];
  setRegisterData: React.Dispatch<React.SetStateAction<string[]>>;
  registerWrite: string;
  setRegisterWrite: React.Dispatch<React.SetStateAction<string>>;

}

const RegistersTableContext = createContext<RegistersTableContextProps | undefined>(undefined);

export const RegistersTableProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [registerData, setRegisterData] = useState<string[]>(Array(32).fill('0'.repeat(32)));
  const [registerWrite, setRegisterWrite] = useState<string>('');
 

  return (
    <RegistersTableContext.Provider value={{registerWrite, setRegisterWrite, registerData, setRegisterData}}>
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
