import React, { createContext, useContext, useState, ReactNode } from 'react';

interface WriteInRegister {
  registerName: string;
  value: string;
}


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
  writeInRegister: WriteInRegister;
  setWriteInRegister: React.Dispatch<React.SetStateAction<WriteInRegister>>;
  importRegister: Register[];
  setImportRegister: React.Dispatch<React.SetStateAction<Register[]>>;
  searchInRegisters: string;
  setSearchInRegisters: React.Dispatch<React.SetStateAction<string>>;
  checkFixedRegisters: boolean;
  setCheckFixedRegisters: React.Dispatch<React.SetStateAction<boolean>>;
  fixedchangedRegisters: string[];
  setFixedchangedRegisters: React.Dispatch<React.SetStateAction<string[]>>; 
}

const RegistersTableContext = createContext<RegistersTableContextProps | undefined>(undefined);

export const RegistersTableProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [registerData, setRegisterData] = useState<string[]>(Array(32).fill('0'.repeat(32)));
  const [writeInRegister, setWriteInRegister] = useState<WriteInRegister>({ registerName: '', value: '' });
  const [importRegister, setImportRegister] = useState<Register[]>([]);
  const [searchInRegisters, setSearchInRegisters] = useState<string>('');
  const [checkFixedRegisters, setCheckFixedRegisters] = useState<boolean>(false);
  const [fixedchangedRegisters, setFixedchangedRegisters] = useState<string[]>([]);

  return (
    <RegistersTableContext.Provider value={{ registerData, setRegisterData, writeInRegister, setWriteInRegister, importRegister, setImportRegister, searchInRegisters, setSearchInRegisters, checkFixedRegisters, setCheckFixedRegisters, fixedchangedRegisters, setFixedchangedRegisters}}>
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
