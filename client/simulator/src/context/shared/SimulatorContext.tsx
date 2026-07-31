import React, { createContext, useContext, useState, ReactNode } from "react";

export interface SimulatorContextProps {
  typeSimulator: string;
  setTypeSimulator: React.Dispatch<React.SetStateAction<string>>;

  modeSimulator: string;
  setModeSimulator: React.Dispatch<React.SetStateAction<string>>;

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

  isEbreak: boolean;
  setIsEbreak: React.Dispatch<React.SetStateAction<boolean>>;

  showTuto: boolean;
  setShowTuto: React.Dispatch<React.SetStateAction<boolean>>;

  apiKey: string | null;
  setApiKey: React.Dispatch<React.SetStateAction<string | null>>;
}

const SimulatorContext = createContext<SimulatorContextProps | undefined>(undefined);

export const SimulatorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [typeSimulator, setTypeSimulator] = useState<string>("monocycle"); // "monocycle" | "pipeline"
  const [modeSimulator, setModeSimulator] = useState<string>("text"); // "text" | "graphic"
  const [textProgram, setTextProgram] = useState<string>("");
  const [operation, setOperation] = useState<string>("");
  const [isFirstStep, setIsFirstStep] = useState<boolean>(false);
  const [section, setSection] = useState<string>("convert");
  const [newPc, setNewPc] = useState<number>(0);
  const [isEbreak, setIsEbreak] = useState<boolean>(false);
  const [showTuto, setShowTuto] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string | null>(null)

  return (
    <SimulatorContext.Provider
      value={{
        typeSimulator,
        setTypeSimulator,
        modeSimulator,
        setModeSimulator,
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
        isEbreak,
        setIsEbreak,
        showTuto,
        setShowTuto,
        apiKey,
        setApiKey
      }}>
      {children}
    </SimulatorContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSimulator = (): SimulatorContextProps => {
  const context = useContext(SimulatorContext);
  if (!context) {
    throw new Error("useSimulator debe usarse dentro de un SimulatorProvider");
  }
  return context;
};
