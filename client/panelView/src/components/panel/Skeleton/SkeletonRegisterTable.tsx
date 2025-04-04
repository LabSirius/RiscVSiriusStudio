import { Skeleton } from "@/components/panel/ui/skeleton";

const SkeletonRegisterTable = () => {
  const topRowCount = 3;
  const middleRowCount = 2;
  const repeatedRowsCount = 15;
  const repeatedColCount = 3;

  return (
    <div className="min-w-[22.3rem] max-h-[calc(100dvh-2.3rem)] overflow-hidden  z-100 absolute top-0 left-0">
      <div className="flex flex-col gap-[0.5rem] items-center">
        <div className="flex gap-[.7rem]">
          {Array.from({ length: topRowCount }).map((_, i) => (
            <Skeleton key={`top-${i}`} className="h-8 w-[7rem]" />
          ))}
        </div>

        <div className="flex flex-col gap-[.5rem]">
          {Array.from({ length: middleRowCount }).map((_, i) => (
            <Skeleton key={`middle-${i}`} className="h-8 w-[22.3rem]" />
          ))}
        </div>

        <div className="flex flex-col gap-[.7rem]">
          {Array.from({ length: repeatedRowsCount }).map((_, rowIndex) => (
            <div key={`row-${rowIndex}`} className="flex gap-[.7rem]">
              {Array.from({ length: repeatedColCount }).map((_, colIndex) => (
                <Skeleton
                  key={`row-${rowIndex}-col-${colIndex}`}
                  className="h-8 w-[7rem]"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkeletonRegisterTable;
