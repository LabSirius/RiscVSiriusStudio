import { useEffect, useState } from 'react';
import { intToHex } from '@/utils/handlerConversions';

export const useFormattedImm = (imm: string, newPc : number) => {
  const [formattedImm, setFormattedImm] = useState("h'000");

  useEffect(() => {
    const immHex = intToHex(parseInt(imm, 10));
    setFormattedImm(`h'${immHex.toUpperCase()}`);
    
  }, [newPc, imm]);

  return formattedImm;
};
