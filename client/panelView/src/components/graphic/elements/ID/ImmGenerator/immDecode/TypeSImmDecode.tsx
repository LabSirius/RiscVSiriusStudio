import { usePC } from '@/context/shared/PCContext';
import { useIR } from '@/context/graphic/IRContext';

const TypeSImmDecode = () => {
    const { ir } = useIR();
    const { newPc} = usePC()

  return (
    <div className="space-y-1  w-full max-h-[30rem] overflow-auto hide-scrollbar font-mono">
            <img src='immTypeSDecodeSvg.svg' alt="immDecode" height={100} width={100} className='w-full h-full rounded-md' /> 

            <div className='absolute text-[.75rem] text-black flex gap-[.735rem] top-[3.65rem] left-[2.05rem]'>
            {Array.from(ir.instructions[newPc].encoding.binEncoding).slice(0, 7).map((item, index) => (
                <p key={index}>{item}</p>
                ))
            }
            </div>   

            <div className='absolute text-[.75rem] text-black flex gap-[.735rem] top-[3.65rem] right-[14rem]'>
            {Array.from(ir.instructions[newPc].encoding.binEncoding).slice(20, 25).map((item, index) => (
                <p key={index}>{item}</p>
                ))
            }
            </div>

                
            <div className='absolute text-[.75rem] text-black flex gap-[.835rem] bottom-[2.7rem] right-[5.87rem]'>

            <div className='flex gap-[.73rem]'>
              {Array.from({ length: 20 }).map((_, index) => (
                  <p key={index}>{ir.instructions[newPc].encoding.binEncoding[0]}</p>
              ))}
            </div>

            <div className='flex gap-[.718rem]'>
                {Array.from(ir.instructions[newPc].encoding.binEncoding).slice(0, 7).map((item, index) => (
                    <p key={index}>{item}</p>
                  ))
                }
              </div>

              <div className='flex gap-[.715rem]'>
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
