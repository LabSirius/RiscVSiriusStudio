import { useIR } from '@/context/graphic/IRContext';
import LabelValue from '@/components/graphic/LabelValue';
import { usePC } from '@/context/shared/PCContext';
import { useRegisterData } from '@/context/shared/RegisterData';
import { useEffect } from 'react';

import { intToHex, binaryToIntTwoComplement } from '@/utils/handlerConversions';

const LabelValueContainer = () => {
  const { currentType, ir , currentImm, setCurrentImm} = useIR();
   const { newPc } = usePC();
   const { registerData } = useRegisterData();

  useEffect(() => {
          if(ir.instructions[newPc].imm12 || ir.instructions[newPc].imm12 === 0  ){
            setCurrentImm(intToHex(ir.instructions[newPc].imm12).toUpperCase())
          }else if(ir.instructions[newPc].encoding.imm13 ){
            const intValue = binaryToIntTwoComplement(ir.instructions[newPc].encoding.imm13 )
            setCurrentImm(intToHex(Number(intValue)).toUpperCase())
          } else if(ir.instructions[newPc].imm21 || ir.instructions[newPc].imm21 === 0 ){
            setCurrentImm(intToHex(ir.instructions[newPc].imm21).toUpperCase())
          }
      }, [newPc, registerData, ir, currentType, setCurrentImm])

  return (
    <>
      <div className=' absolute top-[1.5rem] right-[.8rem]'>
      {!(currentType === 'R' ) && <LabelValue label="Imm" value={`h'${currentImm}`} input={false}/> }
        </div>

    </>
  )
}

export default LabelValueContainer