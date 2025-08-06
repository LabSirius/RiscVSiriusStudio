import { Skeleton } from "@/components/ui/skeleton";

const SkeletonMemoryTable = () => {

  const repeatedRowsCount = 15;
  const repeatedColCount = 5;

  return (
    <div className="min-w-[37.36rem] max-h-[calc(100dvh-2.3rem)] overflow-hidden z-100 absolute top-0 left-0">
     
        <div className="flex flex-col gap-[.6rem]">
          {Array.from({ length: repeatedRowsCount }).map((_, rowIndex) => (
            <div key={`row-${rowIndex}`} className="flex gap-[.5rem]">
              <Skeleton
                  className="h-8 w-[3.6rem]"
                />
              <div className="flex gap-[.8rem]">
              {Array.from({ length: repeatedColCount }).map((_, colIndex) => (
                <Skeleton
                  key={`row-${rowIndex}-col-${colIndex}`}
                  className="h-8 w-[4.3rem]"
                />
              ))}
              </div>
              <Skeleton
                 className="h-8 w-[7rem]"
               />
            </div>
          ))}
        </div>
  
    </div>
  );
};

export default SkeletonMemoryTable;
