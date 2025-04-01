// OverlayContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";

type OverlayContextType = {
  overlayDecodeActive: boolean;
  setOverlayDecodeActive: (active: boolean) => void;

  overlayExecuteActive: boolean;
  setOverlayExecuteActive: (active: boolean) => void;
};

const OverlayContext = createContext<OverlayContextType>({
    overlayDecodeActive: false,
  setOverlayDecodeActive: () => {},

  overlayExecuteActive: false,
  setOverlayExecuteActive: () => {},
});

export const useOverlay = () => useContext(OverlayContext);

export const OverlayProvider = ({ children }: { children: ReactNode }) => {
  const [overlayDecodeActive, setOverlayDecodeActive] = useState(false);
  const [overlayExecuteActive, setOverlayExecuteActive] = useState(false);

  return (
    <OverlayContext.Provider value={{ overlayDecodeActive, setOverlayDecodeActive, overlayExecuteActive, setOverlayExecuteActive }}>
      {children}
    </OverlayContext.Provider>
  );
};
