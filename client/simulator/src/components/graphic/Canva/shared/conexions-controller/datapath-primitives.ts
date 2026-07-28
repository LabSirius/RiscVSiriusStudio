import { Edge } from "@xyflow/react";
import { useSimulator } from "@/context/shared/SimulatorContext";
import * as dataMonocycleConexions from "./dataMonocycleConexions";
import * as dataPipelineConexions from "./dataPipelineConexions";

// Machinery shared by both datapath connection controllers: the EdgeId
// registry, the enabled-vs-all-edges diff, and the wire-animation primitives.
// Both panes import from here instead of each forking its own copy.

// An `EdgeId` is a ReactFlow edge id, e.g. "pc->pivot25". A conexion is a wire
// path: the ordered list of EdgeIds that light up together.
export type EdgeId = string;
type ConexionRegistry = Record<string, EdgeId[]>;

// The full set of edges a datapath can ever light, deduped, from its conexion
// registry. Used as the universe the kernel's enabled set is diffed against.
export const allEdgesOf = (conexions: ConexionRegistry): EdgeId[] => [
  ...new Set(Object.values(conexions).flat()),
];

// A mutable edge set with a bound `add`, shared by both kernels so neither
// forks its own accumulator. `add` unions each conexion path (a list of
// EdgeIds) into the set.
export const edgeCollector = () => {
  const edges = new Set<EdgeId>();
  const add = (...paths: EdgeId[][]) => {
    for (const path of paths) for (const id of path) edges.add(id);
  };
  return { edges, add };
};

// The edges to grey out this clock: every registered edge the kernel did not
// enable.
export const computeDisabledEdges = (
  allEdges: EdgeId[],
  enabled: Iterable<EdgeId>
): EdgeId[] => {
  const enabledSet = new Set(enabled);
  return allEdges.filter((edge) => !enabledSet.has(edge));
};

// --- Wire animation -------------------------------------------------------
// Hovering or clicking one edge animates its whole conexion group. `edgeGroups`
// maps each EdgeId to every EdgeId sharing a path with it.

const buildEdgeGroups = (conexions: ConexionRegistry) => {
  const allConexions = Object.values(conexions);
  const groups: Record<string, EdgeId[]> = {};

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
