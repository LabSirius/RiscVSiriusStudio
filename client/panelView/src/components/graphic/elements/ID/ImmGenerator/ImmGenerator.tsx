import { useCurrentInst } from "@/context/graphic/CurrentInstContext";
import ContainerSVG from "../../ContainerSVG";
import { Handle, Position } from "@xyflow/react";
import LabelValueContainer from "./LabelValueContainer";

import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/graphic/ui/hover-card";
import ImmDecode from "./immDecode/ImmDecode";
import { useOperation } from "@/context/panel/OperationContext";

export default function ImmGenerator() {
  const { operation } = useOperation();
  const { currentInst } = useCurrentInst();

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="w-full ">
          <div className="relative w-full h-full">
            <h2 className=" titleInElement top-[25%] left-[15%]  -translate-x-[15%] -translate-y-[25%] ">
              Imm Generator
            </h2>
            <ContainerSVG height={9.6} active={currentInst.type !== "R"} />
            {operation !== "uploadMemory" && <LabelValueContainer />}
          </div>

          <Handle
            type="target"
            id="[31:7]"
            position={Position.Left}
            className="input"
            style={{ top: "2.7rem" }}
          />

          <Handle
            type="target"
            id="immSrc"
            position={Position.Left}
            className="input"
            style={{ top: "7rem" }}
          />

          <Handle type="source" position={Position.Right} className="output" />
        </div>
      </HoverCardTrigger>
      {!(currentInst.type === "R") && operation !== "uploadMemory" && (
        <HoverCardContent className="p-0 w-[45rem]">
          <ImmDecode />
        </HoverCardContent>
      )}
    </HoverCard>
  );
}
