import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";

export interface CustomOptionSimulateProps {
  checkFixedRegisters: boolean;
  setCheckFixedRegisters: React.Dispatch<React.SetStateAction<boolean>>;

  fixedchangedRegisters: string[];
  setFixedchangedRegisters: React.Dispatch<React.SetStateAction<string[]>>;

  switchAutoFocusOnNewLine: boolean;
  setSwitchAutoFocusOnNewLine: React.Dispatch<React.SetStateAction<boolean>>;

  fitViewTrigger: number;
  requestFitView: () => void; 


}

const CustomOptionSimulate = createContext<CustomOptionSimulateProps | undefined>(undefined);

export const CustomOptionSimulateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [checkFixedRegisters, setCheckFixedRegisters] = useState<boolean>(true);
  const [fixedchangedRegisters, setFixedchangedRegisters] = useState<string[]>([]);

  const [switchAutoFocusOnNewLine, setSwitchAutoFocusOnNewLine] = useState<boolean>(true);

  const [fitViewTrigger, setFitViewTrigger] = useState<number>(0);

  const requestFitView = useCallback(() => {
    setFitViewTrigger((prev) => prev + 1);
  }, []);

  return (
    <CustomOptionSimulate.Provider
      value={{
        checkFixedRegisters,
        setCheckFixedRegisters,
        fixedchangedRegisters,
        setFixedchangedRegisters,
        switchAutoFocusOnNewLine,
        setSwitchAutoFocusOnNewLine,
        fitViewTrigger,
        requestFitView,
      }}>
      {children}
    </CustomOptionSimulate.Provider>
  );
};

export const useCustomOptionSimulate = (): CustomOptionSimulateProps => {
  const context = useContext(CustomOptionSimulate);
  if (!context) {
    throw new Error("useSimulator debe usarse dentro de un SimulatorProvider");
  }
  return context;
};
