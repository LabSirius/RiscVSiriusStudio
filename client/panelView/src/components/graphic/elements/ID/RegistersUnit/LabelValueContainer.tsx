import { useCurrentInst } from '@/context/graphic/CurrentInstContext';
import LabelValue from '@/components/graphic/LabelValue';
import { usePC } from '@/context/shared/PCContext';
import { useRegisterData } from '@/context/shared/RegisterData';
import { useEffect } from 'react';
import { binaryToHex } from '@/utils/handlerConversions';


const LabelValueContainer = () => {
  const { currentType, currentInst, currentRs1, setCurrentRs1, currentRs2, setCurrentRs2 } = useCurrentInst();
   const { newPc } = usePC();
   const { registerData } = useRegisterData();

  useEffect(() => {
      setCurrentRs1(binaryToHex(registerData[Number(currentInst.rs1?.regenc)]).toUpperCase());
      setCurrentRs2(binaryToHex(registerData[Number(currentInst.rs2?.regenc)]).toUpperCase());
      
  }, [newPc, registerData, currentInst])

  return (
    <>
      <div className=' absolute top-[1.4rem] left-[.8rem]'>
      {!(currentType === 'J' || currentType === 'LUI' || currentType === 'AUIPC' ) && <LabelValue label="" value={`b'${currentInst.encoding.rs1}`}/> }
        </div>

        <div className=' absolute top-[6.6rem] left-[.8rem]'>
         {(currentType === 'R' || currentType === 'S'  || currentType === 'B' ) && <LabelValue label="" value={`b'${currentInst.encoding.rs2}`}/>}
        </div>

        <div className=' absolute top-[12rem] left-[.8rem]'>
        {!(currentType === 'S'  || currentType === 'B' ) && <LabelValue label="" value={`b'${currentInst.encoding.rd}`}/>}
        </div>

        <div className=' absolute top-[16rem] left-[.8rem]'>
          <LabelValue label="DataWr" value="h'00"/>
        </div>

        <div className=' absolute top-[1rem] right-[.8rem]'>
        {!(currentType === 'J' || currentType === 'LUI' || currentType === 'AUIPC') && <LabelValue label={`RU[x${[currentInst.rs1?.regenc]}]`} value={`h'${currentRs1}`} input={false}/> }
        </div>

        <div className=' absolute top-[9.2rem] right-[.8rem]'>
        {(currentType === 'R' || currentType === 'S'  || currentType === 'B' ) && <LabelValue label={`RU[x${[currentInst.rs2?.regenc]}]`} value={`h'${currentRs2}`}  input={false}/> }
        </div>
    </>
  )
}

export default LabelValueContainer