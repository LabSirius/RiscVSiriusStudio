import { useRegistersTable } from '@/context/panel/RegisterTableContext';

import { File } from "lucide-react";

const SearchInRegistersTable = () => {
     const { setSearchInRegisters } = useRegistersTable();
  return (
    <div className="flex flex-col gap-1">
            <p className="font-medium">Search in registers table</p>
            <div className="relative">
              <div className="absolute top-1/2 left-[0.6rem] -translate-y-1/2 text-gray-400">
                <File size={20} />
              </div>
              <input
                type="text"
                placeholder="e.g x17 or 12 or 1100 or 0xC"
                onChange={(e) => setSearchInRegisters(e.target.value)}
                className="p-2 pl-[2.3rem] rounded-lg border border-gray-400 w-full bg-transparent"
              />
            </div>
          </div>
  )
}

export default SearchInRegistersTable