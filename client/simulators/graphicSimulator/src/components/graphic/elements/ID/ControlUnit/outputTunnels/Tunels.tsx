import DecodeTunnel from './DecodeTunnel';
import ExecuteTunnel from './ExecuteTunnel';
import MemoryTunnel from './MemoryTunnel';
import WBTunnel from './WBTunnel';

const Tunels = () => {
  return (
    <div className='absolute z-10 right-[-6.97rem] top-[1.3rem] flex flex-col gap-[0.9rem]'>
        <DecodeTunnel />
        <ExecuteTunnel />
        <MemoryTunnel />
        <WBTunnel />
      </div>
  )
}

export default Tunels
