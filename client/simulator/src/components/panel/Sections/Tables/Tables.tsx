import RegisterTable from "./RegisterTable";
import AvailableMemory from "./MemoryTable/AvailableMemoryTable/AvailableMemory";
import ProgramMemoryTable from "./MemoryTable/ProgramMemory";
import { usePipelineStagesSlot } from "@/context/graphic/PipelineStagesSlotContext";
import { useState } from "react";

const Tables = () => {
  const { setSlotNode } = usePipelineStagesSlot();

  const [withBin, setWithBin] = useState(true);

  return (
    <div className="flex gap-0 overflow-hidden min-w-min">
      <RegisterTable />

      <div className="flex gap-0 overflow-hidden min-w-min" id="memoryTables">
        <AvailableMemory withBin={withBin} setWithBin={setWithBin} />

        <ProgramMemoryTable />
      </div>

      {/* CPU-blind mount point: the pipeline pane portals its stages table here;
          the monocycle pane leaves it empty (ADR-0005). `display: contents` keeps
          the portaled table a direct flex child, so placement is unchanged. */}
      <div ref={setSlotNode} style={{ display: "contents" }} />
    </div>
  );
};

export default Tables;
