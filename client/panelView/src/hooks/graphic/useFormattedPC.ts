import { useEffect, useState } from 'react';
import { unsignedToHex } from '@/utils/handlerConversions';

export const useFormattedPC = (newPc: number) => {
  const [formattedPC, setFormattedPC] = useState("h'000");

  useEffect(() => {
    const pcHex = newPc * 4;
    const hex = unsignedToHex(pcHex).padStart(3, '0');
    const formattedHex = `h'${hex}`;
    setFormattedPC(formattedHex);
  }, [newPc]);

  return formattedPC;
};
