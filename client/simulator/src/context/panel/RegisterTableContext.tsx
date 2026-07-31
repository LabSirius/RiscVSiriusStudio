import React, { createContext, useContext, useState, ReactNode } from 'react';

interface WriteInRegister {
  registerName: string;
  value: string;
}

interface RegistersTableContextProps {
  writeInRegister: WriteInRegister;
  setWriteInRegister: React.Dispatch<React.SetStateAction<WriteInRegister>>;
}

const RegistersTableContext = createContext<RegistersTableContextProps | undefined>(undefined);

export const RegistersTableProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [writeInRegister, setWriteInRegister] = useState<WriteInRegister>({ registerName: '', value: '' });

  return (
    <RegistersTableContext.Provider value={{ writeInRegister, setWriteInRegister }}>
      {children}
    </RegistersTableContext.Provider>
  );
};

export const useRegistersTable = (): RegistersTableContextProps => {
  const context = useContext(RegistersTableContext);
  if (!context) {
    throw new Error('useRegistersTable debe usarse dentro de un RoutesProvider');
  }
  return context;
};
