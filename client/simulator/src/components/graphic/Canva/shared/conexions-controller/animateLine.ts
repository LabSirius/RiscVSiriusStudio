import { Edge } from "@xyflow/react";
import { useSimulator } from "@/context/shared/SimulatorContext";
import * as dataMonocycleConexions from "./dataMonocycleConexions";
import * as dataPipelineConexions from "./dataPipelineConexions";

const buildEdgeGroups = (conexions: Record<string, string[]>) => {
  const allConexions = Object.values(conexions);
  const groups: Record<string, string[]> = {};

  for (const path of allConexions) {
    for (const edgeId of path) {
      if (!groups[edgeId]) {
        groups[edgeId] = [];
      }
      groups[edgeId].push(...path);
    }
  }
  return groups;
};

export const useEdgeGroups = () => {
  const { typeSimulator } = useSimulator();

  return typeSimulator === "monocycle"
    ? buildEdgeGroups(dataMonocycleConexions)
    : buildEdgeGroups(dataPipelineConexions);
};

// 🔵 hover
export const animateLineHover = (
  updateEdge: (id: string, newEdge: Partial<Edge>) => void,
  edge: Edge,
  edges: Edge[],
  edgeGroups: Record<string, string[]>,
  animated: boolean = true
): void => {
  const idsToUpdate = edgeGroups[edge.id];

  idsToUpdate?.forEach((id) => {
    const currentEdge = edges.find((e) => e.id === id);
    if (currentEdge && "disabled" in currentEdge && currentEdge.disabled) return;
    const isSelected = currentEdge?.data?.selected;
    updateEdge(id, {
      animated,
      style: { stroke: isSelected ? "#E91E63" : "#3B59B6" },
    });
  });
};

// 🔴 click
export const animateLineClick = (
  updateEdge: (id: string, newEdge: Partial<Edge>) => void,
  edge: Edge,
  edges: Edge[],
  selectedGroups: string[][],
  edgeGroups: Record<string, string[]>,
  animated: boolean = false
): string[][] => {
  const groupToToggle = edgeGroups[edge.id] ?? [];

  const isGroupSelected = selectedGroups.some((group) =>
    group.every((id) => groupToToggle.includes(id))
  );

  if (isGroupSelected) {
    const remainingGroups = selectedGroups.filter(
      (group) => !group.every((id) => groupToToggle.includes(id))
    );
    const allStillSelected = new Set(remainingGroups.flat());

    groupToToggle.forEach((id) => {
      if (!allStillSelected.has(id)) {
        const currentEdge = edges.find((e) => e.id === id);
        if (currentEdge && "disabled" in currentEdge && currentEdge.disabled) return;
        updateEdge(id, {
          animated,
          style: { stroke: "#3B59B6" },
          data: { ...currentEdge?.data, selected: false },
        });
      }
    });

    return remainingGroups;
  }

  groupToToggle.forEach((id) => {
    const currentEdge = edges.find((e) => e.id === id);
    if (currentEdge && "disabled" in currentEdge && currentEdge.disabled) return;
    updateEdge(id, {
      animated,
      style: { stroke: "#E91E63" },
      data: { ...currentEdge?.data, selected: true },
    });
  });

  return [...selectedGroups, groupToToggle];
};
