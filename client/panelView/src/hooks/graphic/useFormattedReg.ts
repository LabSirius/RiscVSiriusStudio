import { useEffect, useState } from 'react';
import { intToBinary } from '@/utils/handlerConversions';

export const useFormattedReg = (newPc: number, rs1: string) => {
  const [formattedReg, setFormattedReg] = useState("");

  useEffect(() => {
    const binaryValue = intToBinary(parseInt(rs1));
    const last5Bits = binaryValue.slice(-5); 
    const formatted = `b'${last5Bits}'`;

    setFormattedReg(formatted);
  }, [newPc, rs1]);

  return formattedReg;
};
