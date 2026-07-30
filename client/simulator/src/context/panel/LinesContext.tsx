import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LinesContextProps {
  // The user-click signal for the program-memory table: a host `clickInLine`
  // message sets the line, the table animates that row/jump, then clears it.
  // (The retiring-instruction editor highlight and the memory-table click
  // signal were removed with the Monaco source panel; see ADR-0005.)
  clickInEditorLine: number;
  setClickInEditorLine: (lineNumber: number) => void;
}

const LinesContext = createContext<LinesContextProps | undefined>(undefined);

export const LinesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [clickInEditorLine, setClickInEditorLine] = useState<number>(-1);

  return (
    <LinesContext.Provider value={{ clickInEditorLine, setClickInEditorLine }}>
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
