import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LinesContextProps {
  lineDecorationNumber: number;
  setLineDecorationNumber: React.Dispatch<React.SetStateAction<number>>;

  clickInEditorLine: number;
  setClickInEditorLine: (lineNumber: number) => void;
}

const LinesContext = createContext<LinesContextProps | undefined>(undefined);

export const LinesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [lineDecorationNumber, setLineDecorationNumber] = useState<number>(-1);
    const [clickInEditorLine, setClickInEditorLine] = useState<number>(-1);
  

  return (
    <LinesContext.Provider value={{ lineDecorationNumber, setLineDecorationNumber, clickInEditorLine, setClickInEditorLine }}>
      {children}
    </LinesContext.Provider>
  );
};

export const useLines = (): LinesContextProps => {
  const context = useContext(LinesContext);
  if (!context) {
    throw new Error('useLines debe usarse dentro de un LinesProvider');
  }
  return context;
};
