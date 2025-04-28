import React, { createContext, useContext, useState, ReactNode } from "react";

export interface RegisterDataContextProps {
  registerData: string[];
setRegisterData: React.Dispatch<React.SetStateAction<string[]>>;
}

const RegisterDataContext = createContext<RegisterDataContextProps | undefined>(undefined);

export const RegisterDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [registerData, setRegisterData] = useState<string[]>(Array(32).fill('0'.repeat(32)));
  

  return (
    <RegisterDataContext.Provider
      value={{
        registerData, setRegisterData,
      }}>
      {children}
    </RegisterDataContext.Provider>
  );
};

export const useRegisterData = (): RegisterDataContextProps => {
  const context = useContext(RegisterDataContext);
  if (!context) {
    throw new Error("useRegisterData debe usarse dentro de un RegisterDataProvider");
  }
  return context;
};
