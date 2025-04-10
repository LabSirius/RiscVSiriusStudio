import { useMemoryTable } from '@/context/MemoryTableContext';
import { Button } from '@/components/ui/button';
import { Locate } from 'lucide-react';

const LocatePc = () => {
    const { setLocatePc } = useMemoryTable();
  return (
    <div className='flex items-center gap-2'>
              <Button  variant='outline' size='icon'  onClick={() => setLocatePc(true)}>
                <Locate size={20} />
              </Button>
              <p className='font-medium'>Locate PC</p>
          </div>
  )
}

export default LocatePc