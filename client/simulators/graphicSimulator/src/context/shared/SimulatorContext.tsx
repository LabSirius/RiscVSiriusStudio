import React, { createContext, useContext, useState, ReactNode } from "react";

export interface SimulatorContextProps {
  typeSimulator: string;
    setTypeSimulator: React.Dispatch<React.SetStateAction<string>>;
}

const SimulatorContext = createContext<SimulatorContextProps | undefined>(undefined);

export const SimulatorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [typeSimulator, setTypeSimulator] = useState<string>("");

  return (
    <SimulatorContext.Provider
      value={{
        typeSimulator, setTypeSimulator
      }}>
      {children}
    </SimulatorContext.Provider>
  );
};

export const useSimulator = (): SimulatorContextProps => {
  const context = useContext(SimulatorContext);
  if (!context) {
    throw new Error("useSimulator debe usarse dentro de un SimulatorProvider");
  }
  return context;
};
