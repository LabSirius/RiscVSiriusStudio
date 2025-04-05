import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DialogObject {
  title: string;
  description: string;
}

interface DialogContextProps {
  dialog?: DialogObject;
  setDialog: React.Dispatch<React.SetStateAction<DialogObject | undefined>>;
}

const DialogContext = createContext<DialogContextProps | undefined>(undefined);

export const DialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dialog, setDialog] = useState<DialogObject | undefined>(undefined);

  return (
    <DialogContext.Provider value={{ dialog, setDialog }}>
      {children}
    </DialogContext.Provider>
  );
};

export const useDialog = (): DialogContextProps => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog debe usarse dentro de un DialogProvider');
  }
  return context;
};
