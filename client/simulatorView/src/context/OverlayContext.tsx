// OverlayContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";

type OverlayContextType = {
  overlayDecodeActive: boolean;
  setOverlayDecodeActive: (active: boolean) => void;

  overlayExecuteActive: boolean;
  setOverlayExecuteActive: (active: boolean) => void;

  overlayMemoryActive: boolean;
  setOverlayMemoryActive: (active: boolean) => void;
};

const OverlayContext = createContext<OverlayContextType>({
    overlayDecodeActive: false,
  setOverlayDecodeActive: () => {},

  overlayExecuteActive: false,
  setOverlayExecuteActive: () => {},

  overlayMemoryActive: false,
  setOverlayMemoryActive: () => {},
});

export const useOverlay = () => useContext(OverlayContext);

export const OverlayProvider = ({ children }: { children: ReactNode }) => {
  const [overlayDecodeActive, setOverlayDecodeActive] = useState(false);
  const [overlayExecuteActive, setOverlayExecuteActive] = useState(false);
  const [overlayMemoryActive, setOverlayMemoryActive] = useState(false);

  return (
    <OverlayContext.Provider value={{ overlayDecodeActive, setOverlayDecodeActive, overlayExecuteActive, setOverlayExecuteActive, overlayMemoryActive, setOverlayMemoryActive }}>
      {children}
    </OverlayContext.Provider>
  );
};
