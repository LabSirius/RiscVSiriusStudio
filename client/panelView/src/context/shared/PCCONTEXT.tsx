import React, { createContext, useContext, useState, ReactNode } from "react";

export interface PCContextProps {
  newPc: number;
  setNewPc: React.Dispatch<React.SetStateAction<number>>;
}

const PCContext = createContext<PCContextProps | undefined>(undefined);

export const PCProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [newPc, setNewPc] = useState<number>(0);


  return (
    <PCContext.Provider
      value={{
        newPc, 
        setNewPc,
      }}>
      {children}
    </PCContext.Provider>
  );
};

export const usePC = (): PCContextProps => {
  const context = useContext(PCContext);
  if (!context) {
    throw new Error("usePC debe usarse dentro de un PCProvider");
  }
  return context;
};
