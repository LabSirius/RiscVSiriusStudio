import { useCurrentInst } from '@/context/graphic/CurrentInstContext';
import LabelValue from '@/components/graphic/LabelValue';
import { usePC } from '@/context/shared/PCContext';
import { useRegisterData } from '@/context/shared/RegisterData';
import { useEffect } from 'react';

import { intToHex, binaryToIntTwoComplement } from '@/utils/handlerConversions';

const LabelValueContainer = () => {
  const { currentType, currentInst , currentImm, setCurrentImm} = useCurrentInst();
   const { newPc } = usePC();
   const { registerData } = useRegisterData();

  useEffect(() => {
          if(currentInst.imm12 || currentInst.imm12 === 0  ){
            setCurrentImm(intToHex(currentInst.imm12).toUpperCase())
          }else if(currentInst.encoding.imm13 ){
            const intValue = binaryToIntTwoComplement(currentInst.encoding.imm13 )
            setCurrentImm(intToHex(Number(intValue)).toUpperCase())
          } else if(currentInst.imm21 || currentInst.imm21 === 0 ){
            setCurrentImm(intToHex(currentInst.imm21).toUpperCase())
          }
      }, [newPc, registerData, currentInst, currentType, setCurrentImm])

  return (
    <>
      <div className=' absolute top-[1.5rem] right-[.8rem]'>
      {!(currentType === 'R' ) && <LabelValue label="Imm" value={`h'${currentImm}`} input={false}/> }
        </div>

    </>
  )
}

export default LabelValueContainer