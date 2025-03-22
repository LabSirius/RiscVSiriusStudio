import { File, Save } from 'lucide-react';

const SearchSection = () => {
  return (
    <div className="w-full mt-1 section-container">
      <div className="flex flex-col p-4">
        <div className="flex flex-col gap-4">
          <p className='text-lg font-semibold'>Filter</p>
          <div className="flex flex-col gap-1">
            <p className="font-medium">In registers table</p>
            <div className="relative">
              <div className="absolute top-1/2 left-[0.6rem] -translate-y-1/2 text-gray-400">
                <File size={20} />
              </div>
              <input
                type="text"
                placeholder="e.g x17 or 12 or 1100 or 0xC"
                className="p-2 pl-[2.3rem] rounded-lg border border-gray-400 w-full bg-transparent"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-medium">In memory table</p>
            <div className="relative">
              <div className="absolute top-1/2 left-[0.6rem] -translate-y-1/2 text-gray-400">
                <Save size={20} />
              </div>
              <input
                type="text"
                placeholder="e.g 1234"
                className="p-2 pl-[2.3rem] rounded-lg border border-gray-400 w-full bg-transparent"
              />
            </div>
          </div>
          <p className="mt-3 text-gray-500">
            If you have any question, click on the information icon.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SearchSection;
