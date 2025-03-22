import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SectionContextProps {
  section: string;
  setSection: React.Dispatch<React.SetStateAction<string>>;

}

const SectionContext = createContext<SectionContextProps | undefined>(undefined);

export const SectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [section, setSection] = useState<string>('convert');
  

  return (
    <SectionContext.Provider value={{ section, setSection}}>
      {children}
    </SectionContext.Provider>
  );
};

export const useSection = (): SectionContextProps => {
  const context = useContext(SectionContext);
  if (!context) {
    throw new Error('usesection debe usarse dentro de un sectionProvider');
  }
  return context;
};
