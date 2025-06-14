import { useEffect, useRef } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import { useTheme } from "@/components/panel/ui/theme/theme-provider"


const StagesPipeline = () => {
  const tableRef = useRef<HTMLDivElement>(null);
  const tabulatorInstance = useRef<Tabulator | null>(null);
  const { theme } = useTheme()

  useEffect(() => {
    if (!tableRef.current || tabulatorInstance.current) return;

    const initialData = [
      { id: 1, IF: '', ID: '', IE: '', MEM: '', WB: '' },
    ];

    tabulatorInstance.current = new Tabulator(tableRef.current, {
      data: initialData,
      columns: [
        { title: 'IF', field: 'IF', hozAlign: 'center', width: 100, headerSort: false },
        { title: 'ID', field: 'ID', hozAlign: 'center', width: 100, headerSort: false },
        { title: 'IE', field: 'IE', hozAlign: 'center', width: 100, headerSort: false },
        { title: 'MEM', field: 'MEM', hozAlign: 'center', width: 100, headerSort: false },
        { title: 'WB', field: 'WB', hozAlign: 'center', width: 100, headerSort: false },
      ],
      layout: 'fitDataStretch',
      reactiveData: true,
      index: 'id',
      movableColumns: false,
    });

    return () => {
      tabulatorInstance.current?.destroy();
      tabulatorInstance.current = null;
    };
  }, []);

  return (
    <div className="w-fit overflow-hidden">
      <div
        ref={tableRef}
        className={`w-full  h-full ${theme === "light" ? "theme-light" : "theme-dark"} w-[500px] h-[90px] select-none`} 
      />
    </div>
  );
};

export default StagesPipeline;
