import { useIR } from '@/context/graphic/IRContext';
import LabelValue from '@/components/graphic/LabelValue';

import { usePC } from '@/context/shared/PCContext';
import { useFormattedPC } from '@/hooks/graphic/useFormattedPC'; 

import { useRegisterData } from '@/context/shared/RegisterData';
import { useEffect, useState } from 'react';
import { binaryToHex } from '@/utils/handlerConversions';

const LabelValueContainer = () => {
  const { currentType, ir, currentImm } = useIR();
  const { newPc } = usePC();
  const formattedPC = useFormattedPC(newPc);
  
  const { registerData } = useRegisterData();
  const [currentRs1, setCurrentRs1] = useState<string>('');
  const [currentRs2, setCurrentRs2] = useState<string>('');

   useEffect(() => {
        setCurrentRs1(binaryToHex(registerData[Number(ir.instructions[newPc].rs1?.regenc)]).toUpperCase());
        setCurrentRs2(binaryToHex(registerData[Number(ir.instructions[newPc].rs2?.regenc)]).toUpperCase());
    }, [newPc, registerData, ir, currentType])

  return (
    
    <>
      <div className=' absolute top-[1.4rem] left-[.8rem]'>
        {!( currentType === 'LUI' ) && <LabelValue label="A" value={(currentType === 'B' || currentType === 'J' || currentType === 'AUIPC') ? `${formattedPC}`  : `h'${currentRs1}`}/> }
        </div>

        <div className=' absolute top-[11.4rem] left-[.8rem]'>
        <LabelValue label="B"  value={currentType === 'R' ? `h'${currentRs2}` : `h'${currentImm}`}/>
        </div>

        <div className=' absolute top-[6.8rem] right-[.8rem]'>
        <LabelValue label="ALURes"  input={false} value="00-00"/>
        </div>

        
    </>
  )
}

export default LabelValueContainer