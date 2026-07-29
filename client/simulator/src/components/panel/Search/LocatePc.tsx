import { useMemoryTable } from '@/context/shared/MemoryTableContext';
import { Locate } from 'lucide-react';

/**
 * Scrolls the program-memory table to the current PC row. Lives in the
 * program-memory top-right chrome (relocated from the old SearchSection panel);
 * it is navigation, not search, so it renders as its own icon control next to
 * the search box and collapse arrow.
 */
const LocatePc = ({ className = '' }: { className?: string }) => {
  const { setLocatePc } = useMemoryTable();
  return (
    <button
      type="button"
      title="Locate PC"
      onClick={() => setLocatePc(true)}
      className={`cursor-pointer text-black transition-transform hover:scale-110 dark:text-white ${className}`}>
      <Locate strokeWidth={1.5} className="min-h-[1.3rem] min-w-[1.3rem] h-[1.3rem] w-[1.3rem]" />
    </button>
  );
};

export default LocatePc;
