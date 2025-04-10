import { usePC } from '@/context/shared/PCContext';
import { useIR } from '@/context/graphic/IRContext';

const TypeIImmDecode = () => {
    const { ir } = useIR();
    const { newPc} = usePC()


  return (
    <div className="space-y-1  w-full max-h-[30rem] overflow-auto hide-scrollbar font-mono">
            <img src='immTypeIDecodeSvg.svg' alt="immDecode" height={100} width={100} className='w-full h-full rounded-md' /> 
            <div className='absolute text-[.75rem] text-black flex gap-[.79rem] top-[2.5rem] left-[1.1rem]'>
              {Array.from(ir.instructions[newPc].encoding.binEncoding).slice(0, 12).map((item, index) => (
                  <p key={index}>{item}</p>
                ))
              }
            </div>       
            <div className='absolute text-[.75rem] text-black flex gap-[.83rem] bottom-[1.7rem] right-[4.97rem]'>

            <div className='flex gap-[.79rem]'>
              {Array.from({ length: 20 }).map((_, index) => (
                  <p key={index}>{ir.instructions[newPc].encoding.binEncoding[0]}</p>
              ))}
            </div>

            <div className='flex gap-[.76rem]'>
                {Array.from(ir.instructions[newPc].encoding.binEncoding).slice(0, 5).map((item, index) => (
                    <p key={index}>{item}</p>
                  ))
                }
              </div>

              <div className='flex gap-[.815rem]'>
                {Array.from(ir.instructions[newPc].encoding.binEncoding).slice(5, 12).map((item, index) => (
                    <p key={index}>{item}</p>
                  ))
                }
              </div>
            </div>    
      </div>
  )
}

export default TypeIImmDecode
