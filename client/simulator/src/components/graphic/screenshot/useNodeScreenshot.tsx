import { useCallback, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { NodeToolbar, Position, type Node } from "@xyflow/react";
import { Camera } from "lucide-react";

import { downloadNodePng } from "./downloadNodePng";

/**
 * Per-node "screenshot this module" affordance for a datapath pane.
 *
 * Returns React Flow node-hover handlers plus a `<NodeToolbar>` element to drop
 * inside `<ReactFlow>`. The toolbar attaches to whichever node is hovered and
 * exposes a single PNG button that calls {@link downloadNodePng} for that node.
 *
 * A short hide delay keeps the toolbar alive while the pointer travels from the
 * node to the button; the toolbar's own hover cancels the pending hide.
 */
export function useNodeScreenshot(hideDelayMs = 200) {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelHide = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

  const scheduleHide = useCallback(() => {
    cancelHide();
    hideTimer.current = setTimeout(() => setHoveredNodeId(null), hideDelayMs);
  }, [cancelHide, hideDelayMs]);

  const onNodeMouseEnter = useCallback(
    (_event: MouseEvent, node: Node) => {
      cancelHide();
      setHoveredNodeId(node.id);
    },
    [cancelHide],
  );

  const onNodeMouseLeave = useCallback(() => {
    scheduleHide();
  }, [scheduleHide]);

  const screenshotToolbar: ReactNode = hoveredNodeId ? (
    <NodeToolbar
      nodeId={hoveredNodeId}
      isVisible
      position={Position.Top}
      onMouseEnter={cancelHide}
      onMouseLeave={scheduleHide}
    >
      <button
        type="button"
        className="react-flow__controls-button-custom flex items-center gap-1 rounded bg-white px-2 py-1 shadow"
        title="Screenshot this module (PNG)"
        onClick={() => downloadNodePng(hoveredNodeId)}
      >
        <Camera size={14} />
        <span style={{ fontSize: "10px" }}>PNG</span>
      </button>
    </NodeToolbar>
  ) : null;

  return { onNodeMouseEnter, onNodeMouseLeave, screenshotToolbar };
}
