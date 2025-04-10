import { usePC } from '@/context/shared/PCContext';
import { useIR } from '@/context/graphic/IRContext';

const TypeIImmDecode = () => {
    const { ir } = useIR();
    const { newPc} = usePC()


    const data = "00000000000000000000000000000000"
    //ir.instructions[newPc].encoding.binEncoding


  return (
    <div className="space-y-1  w-full max-h-[30rem] text-[.75rem] text-black overflow-auto hide-scrollbar font-mono">
            <img src='immTypeIDecodeSvg.svg' alt="immDecode" height={100} width={100} className='w-full h-full rounded-md' /> 
            <div className='absolute flex gap-[.79rem] top-[2.5rem] left-[1.1rem]'>
              {Array.from(data).slice(0, 4).map((item, index) => (
                  <p key={index}>{item}</p>
              ))
              }
            </div> 

            <div className='absolute  flex gap-[.79rem] top-[2.5rem] left-[6.1rem]'>
              {Array.from(data).slice(4, 8).map((item, index) => (
                  <p key={index}>{item}</p>
              ))
              }
            </div>

            <div className='absolute  flex gap-[.79rem] top-[2.5rem] left-[11rem]'>
              {Array.from(data).slice(8, 12).map((item, index) => (
                  <p key={index}>{item}</p>
              ))
              }
            </div>
            
                  

            {/* <div className='absolute  bottom-[1.7rem] flex gap-[.79rem]'>
              {Array.from({ length: 20 }).map((_, index) => (
                  <p key={index}>{data[0]}</p>
              ))}
            </div>

            <div className='flex gap-[.76rem]'>
                {Array.from(data).slice(0, 5).map((item, index) => (
                    <p key={index}>{item}</p>
                  ))
                }
              </div> */}

              <div className='flex absolute  bottom-[1.7rem] right-[5rem] gap-[.79rem]'>
                {Array.from(data).slice(5, 12).map((item, index) => (
                    <p key={index}>{item}</p>
                  ))
                }
              </div>
            </div>    
  )
}

export default TypeIImmDecode
