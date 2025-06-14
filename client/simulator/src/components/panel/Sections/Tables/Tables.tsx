import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";

import { JSX } from "react";

import RegisterTable from "./RegisterTable";
import MemoryTable from "./MemoryTable";
import StagesPipeline from "./StagesPipeline";
import { useSimulator } from "@/context/shared/SimulatorContext";

const Tables = () => {
  const { typeSimulator } = useSimulator();

  const [componentOrder, setComponentOrder] = useState<string[]>([
    "RegisterTable",
    "MemoryTable",
  ]);

  // 🔁 Reacciona cuando el tipo de simulador cambia
  useEffect(() => {
    setComponentOrder((prev) => {
      const hasPipeline = prev.includes("StagesPipeline");
      if (typeSimulator === "pipeline" && !hasPipeline) {
        return ["StagesPipeline", ...prev];
      }
      if (typeSimulator !== "pipeline" && hasPipeline) {
        return prev.filter((comp) => comp !== "StagesPipeline");
      }
      return prev;
    });
  }, [typeSimulator]);

  const componentMap: Record<string, JSX.Element> = {
    RegisterTable: <RegisterTable />,
    MemoryTable: <MemoryTable />,
    StagesPipeline: <StagesPipeline />,
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    const items = Array.from(componentOrder);
    const [moved] = items.splice(source.index, 1);
    items.splice(destination.index, 0, moved);
    setComponentOrder(items);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="tables" direction="horizontal">
        {(provided) => (
          <div
            className="flex gap-5 overflow-hidden min-w-min"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {componentOrder.map((key, index) => (
              <Draggable draggableId={key} index={index} key={key}>
                {(provided) => (
                  <div
                    className="cursor-move"
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    {componentMap[key]}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default Tables;
