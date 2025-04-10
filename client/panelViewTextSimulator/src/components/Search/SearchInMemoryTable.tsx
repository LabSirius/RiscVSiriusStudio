import { useMemoryTable } from '@/context/MemoryTableContext';
import { Save } from "lucide-react";

const SearchInMemoryTable = () => {
    const { setSearchInMemory } = useMemoryTable();
  return (
    <div className="flex flex-col gap-1">
            <p className="font-medium">Search in memory table</p>
            <div className="relative">
              <div className="absolute top-1/2 left-[0.6rem] -translate-y-1/2 text-gray-400">
                <Save size={20} />
              </div>
              <input
                type="text"
                placeholder="e.g 1234"
                onChange={(e) => setSearchInMemory(e.target.value)}
                className="p-2 pl-[2.3rem] rounded-lg border border-gray-400 w-full bg-transparent"
              />
            </div>
          </div>
  )
}

export default SearchInMemoryTable