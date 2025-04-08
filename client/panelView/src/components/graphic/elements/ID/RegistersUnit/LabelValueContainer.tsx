import { useIR } from '@/context/graphic/IRContext';
import LabelValue from '@/components/graphic/LabelValue';
import { usePC } from '@/context/shared/PCContext';
import { useRegisterData } from '@/context/shared/RegisterData';
import { useEffect, useState } from 'react';
import { binaryToHex } from '@/utils/handlerConversions';


const LabelValueContainer = () => {
  const { currentType, ir } = useIR();
   const { newPc } = usePC();
   const { registerData } = useRegisterData();
   const [currentRs1, setCurrentRs1] = useState<string>('');
  const [currentRs2, setCurrentRs2] = useState<string>('');

  useEffect(() => {
      setCurrentRs1(binaryToHex(registerData[Number(ir.instructions[newPc].rs1.regenc)]));
      setCurrentRs2(binaryToHex(registerData[Number(ir.instructions[newPc].rs2?.regenc)]));
      
  }, [newPc, registerData, ir])

  return (
    <>
      <div className=' absolute top-[1.4rem] left-[.8rem]'>
          <LabelValue label="" value={`b'${ir.instructions[newPc].encoding.rs1}'`}/>
        </div>

        <div className=' absolute top-[6.6rem] left-[.8rem]'>
         {(currentType === 'R' || currentType === 'S'  || currentType === 'B' ) && <LabelValue label="" value={`b'${ir.instructions[newPc].encoding.rs2}'`}/>}
        </div>

        <div className=' absolute top-[12rem] left-[.8rem]'>
        {!(currentType === 'S'  || currentType === 'B' ) && <LabelValue label="" value={`b'${ir.instructions[newPc].encoding.rd}'`}/>}
        </div>

        <div className=' absolute top-[16rem] left-[.8rem]'>
          <LabelValue label="DataWr" value="h'00"/>
        </div>

        <div className=' absolute top-[1rem] right-[.8rem]'>
          <LabelValue label="RU[rs1]" value={`h'${currentRs1}'`} input={false}/>
        </div>

        <div className=' absolute top-[9.2rem] right-[.8rem]'>
        {(currentType === 'R' || currentType === 'S'  || currentType === 'B' ) && <LabelValue label="RU[rs2]" value={`h'${currentRs2}'`}  input={false}/> }
        </div>
    </>
  )
}

export default LabelValueContainer