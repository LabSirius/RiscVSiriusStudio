
import { Locate } from 'lucide-react';
import SearchInRegistersTable from '@/components/Search/SearchInRegistersTable';
import SearchInMemoryTable from '@/components/Search/SearchInMemoryTable';
import { Button } from '@/components/ui/button';


const SearchSection = () => {

  return (
    <div className="w-full mt-1 section-container">
        <div className="flex flex-col gap-4">
        <div className='flex items-center gap-2'>
              <Button  variant='outline' size='icon'  onClick={() => {}}>
                <Locate size={20} />
              </Button>
              <p className='font-medium'>Locate PC</p>
          </div>
          <SearchInRegistersTable />
          <SearchInMemoryTable />
          <p className="mt-3 text-gray-500">
            If you have any question, click on the information icon.
          </p>
        </div>
      </div>
  );
};

export default SearchSection;

