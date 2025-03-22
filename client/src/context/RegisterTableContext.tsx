// RoutesContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';


interface Register {
  name: string;
  rawName: string;
  value: string;
  viewType: number;
  watched: boolean;
  modified: number;
  id: number;
}

interface RegistersTableContextProps {
  registerData: string[];
  setRegisterData: React.Dispatch<React.SetStateAction<string[]>>;
  registerWrite: string;
  setRegisterWrite: React.Dispatch<React.SetStateAction<string>>;
  importRegister: Register[];
  setImportRegister: React.Dispatch<React.SetStateAction<Register[]>>;
}

const RegistersTableContext = createContext<RegistersTableContextProps | undefined>(undefined);

export const RegistersTableProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [registerData, setRegisterData] = useState<string[]>(Array(32).fill('0'.repeat(32)));
  const [registerWrite, setRegisterWrite] = useState<string>('');
  const [importRegister, setImportRegister] = useState<Register[]>([]);
 

  return (
    <RegistersTableContext.Provider value={{registerWrite, setRegisterWrite, registerData, setRegisterData, importRegister, setImportRegister}}>
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
