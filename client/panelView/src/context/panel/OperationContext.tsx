import React, { createContext, useContext, useState, ReactNode } from 'react';

interface OperationContextProps {
  textProgram: string;
   setTextProgram: React.Dispatch<React.SetStateAction<string>>;
  operation: string;
  setOperation: React.Dispatch<React.SetStateAction<string>>;
  isFirstStep: boolean;
  setIsFirstStep: React.Dispatch<React.SetStateAction<boolean>>;
 
}

const OperationContext = createContext<OperationContextProps | undefined>(undefined);

export const OperationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [textProgram, setTextProgram] = useState<string>('');
  const [operation, setOperation] = useState<string>('');
  const [isFirstStep, setIsFirstStep] = useState<boolean>(false);
 
  

  return (
    <OperationContext.Provider value={{textProgram, setTextProgram,  operation, setOperation, isFirstStep, setIsFirstStep }}>
      {children}
    </OperationContext.Provider>
  );
};

export const useOperation = (): OperationContextProps => {
  const context = useContext(OperationContext);
  if (!context) {
    throw new Error('useOperation debe usarse dentro de un OperationProvider');
  }
  return context;
};
