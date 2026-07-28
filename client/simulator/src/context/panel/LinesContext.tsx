import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LinesContextProps {
  // Note: the editor highlight (the retiring-instruction line) is a Cycle-effect
  // signal and now lives in the Shell context (`useShell().highlightedLine`),
  // not here. This context keeps only the user-click signals.
  clickInEditorLine: number;
  setClickInEditorLine: (lineNumber: number) => void;

  clickAddressInMemoryTable: number;
  setClickAddressInMemoryTable: (address: number) => void;
}

const LinesContext = createContext<LinesContextProps | undefined>(undefined);

export const LinesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [clickInEditorLine, setClickInEditorLine] = useState<number>(-1);
    const [clickAddressInMemoryTable, setClickAddressInMemoryTable] = useState<number>(-1);


  return (
    <LinesContext.Provider value={{ clickInEditorLine, setClickInEditorLine, clickAddressInMemoryTable, setClickAddressInMemoryTable }}>
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
