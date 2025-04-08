import DecodeTunnel from '../outputTunnels/DecodeTunnel';
import ExecuteTunnel from '../outputTunnels/ExecuteTunnel';
import MemoryTunnel from '../outputTunnels/MemoryTunnel';
import WBTunnel from '../outputTunnels/WBTunnel';

const Tunels = () => {
  return (
    <div className='absolute z-10 right-[-6.17rem] top-[1.3rem] flex flex-col gap-[0.9rem]'>
        <DecodeTunnel />
        <ExecuteTunnel />
        <MemoryTunnel />
        <WBTunnel />
      </div>
  )
}

export default Tunels
