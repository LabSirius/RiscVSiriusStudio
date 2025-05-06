import DecodeTunnel from './DecodeTunnel';
import ExecuteTunnel from './ExecuteTunnel';
import MemoryTunnel from './MemoryTunnel';
import WBTunnel from './WBTunnel';

const Tunels = () => {
  return (
    <div className='absolute z-10 flex ml-[87rem] top-[1rem] gap-[15rem]'>
        <DecodeTunnel />
        <ExecuteTunnel />
        <MemoryTunnel />
        <WBTunnel />
      </div>
  )
}

export default Tunels
