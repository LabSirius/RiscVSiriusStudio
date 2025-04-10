import { usePC } from '@/context/shared/PCContext';
import { useIR } from '@/context/graphic/IRContext';

const TypeSImmDecode = () => {
    const { ir } = useIR();
    const { newPc} = usePC()

  return (
    <div className="space-y-1  w-full max-h-[30rem] overflow-auto hide-scrollbar font-mono">
            <img src='immTypeSDecodeSvg.svg' alt="immDecode" height={100} width={100} className='w-full h-full rounded-md' /> 

            <div className='absolute text-[.75rem] text-black flex gap-[.759rem] top-[2.8rem] left-[1.25rem]'>
            {Array.from(ir.instructions[newPc].encoding.binEncoding).slice(0, 7).map((item, index) => (
                <p key={index}>{item}</p>
                ))
            }
            </div>   

            <div className='absolute text-[.75rem] text-black flex gap-[.769rem] top-[2.8rem] right-[13.7rem]'>
            {Array.from(ir.instructions[newPc].encoding.binEncoding).slice(20, 25).map((item, index) => (
                <p key={index}>{item}</p>
                ))
            }
            </div>

                
            <div className='absolute text-[.75rem] text-black flex gap-[.875rem] bottom-[2rem] right-[5.1rem]'>

            <div className='flex gap-[.787rem]'>
              {Array.from({ length: 20 }).map((_, index) => (
                  <p key={index}>{ir.instructions[newPc].encoding.binEncoding[0]}</p>
              ))}
            </div>

            <div className='flex gap-[.778rem]'>
                {Array.from(ir.instructions[newPc].encoding.binEncoding).slice(0, 7).map((item, index) => (
                    <p key={index}>{item}</p>
                  ))
                }
              </div>

              <div className='flex gap-[.755rem]'>
                {Array.from(ir.instructions[newPc].encoding.binEncoding).slice(20, 25).map((item, index) => (
                    <p key={index}>{item}</p>
                  ))
                }
              </div>
            </div>    
      </div>
  )
}

export default TypeSImmDecode
