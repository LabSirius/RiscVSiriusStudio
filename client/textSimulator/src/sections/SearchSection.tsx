import LocatePc from '@/components/Search/LocatePc';
import SearchInRegistersTable from '@/components/Search/SearchInRegistersTable';
import SearchInMemoryTable from '@/components/Search/SearchInMemoryTable';


const SearchSection = () => {

  return (
    <div className="w-full mt-1 section-container">
        <div className="flex flex-col gap-4">
          <LocatePc />
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

