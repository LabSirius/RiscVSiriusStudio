import React, { createContext, useContext, useState, ReactNode } from "react";

export interface SimulatorContextProps {
  typeSimulator: string;
  setTypeSimulator: React.Dispatch<React.SetStateAction<string>>;

  textProgram: string;
  setTextProgram: React.Dispatch<React.SetStateAction<string>>;
  operation: string;
  setOperation: React.Dispatch<React.SetStateAction<string>>;
  isFirstStep: boolean;
  setIsFirstStep: React.Dispatch<React.SetStateAction<boolean>>;
  section: string;
  setSection: React.Dispatch<React.SetStateAction<string>>;

  newPc: number;
  setNewPc: React.Dispatch<React.SetStateAction<number>>;

  simulateAuto: boolean;
  setSimulateAuto: React.Dispatch<React.SetStateAction<boolean>>;
}

const SimulatorContext = createContext<SimulatorContextProps | undefined>(undefined);

export const SimulatorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [typeSimulator, setTypeSimulator] = useState<string>("");
  const [textProgram, setTextProgram] = useState<string>("");
  const [operation, setOperation] = useState<string>("");
  const [isFirstStep, setIsFirstStep] = useState<boolean>(false);
  const [section, setSection] = useState<string>("convert");
  const [newPc, setNewPc] = useState<number>(0);
  const [simulateAuto, setSimulateAuto] = useState<boolean>(false);

  return (
    <SimulatorContext.Provider
      value={{
        typeSimulator,
        setTypeSimulator,
        textProgram,
        setTextProgram,
        operation,
        setOperation,
        isFirstStep,
        setIsFirstStep,
        section,
        setSection,
        newPc,
        setNewPc,
        simulateAuto,
        setSimulateAuto
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
