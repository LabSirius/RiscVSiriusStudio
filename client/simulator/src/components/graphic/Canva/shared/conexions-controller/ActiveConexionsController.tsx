import { useEffect, useRef } from 'react';
import { Edge } from '@xyflow/react';
import { useDataMonocycleConexions } from './useDataMonocycleConexions'; 
import { useSimulator } from '@/context/shared/SimulatorContext';
import { useDataPipelineConexions } from './useDataPipelineConexions';

interface DataPathControllerProps {
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
}

const DataPathController: React.FC<DataPathControllerProps> = ({ setEdges }) => {

  const { typeSimulator} = useSimulator();

  const monoDisabledEdges = useDataMonocycleConexions();
  const pipelineDisabledEdges = useDataPipelineConexions();

  const disabledEdges =
    typeSimulator === "monocycle" ? monoDisabledEdges : pipelineDisabledEdges;


  const previousDisabledEdgesRef = useRef<string[]>([]);

  useEffect(() => {
    setEdges(prevEdges => {
      const resetEdges = prevEdges.map(edge => {
        if (
          previousDisabledEdgesRef.current.includes(edge.id) &&
          !disabledEdges.includes(edge.id)
        ) {
          return {
            ...edge,
            disabled: false,
            style: { ...edge.style, stroke: edge.data?.selected ? "#E91E63" : "#3B59B6" },
          };
        }
        return edge;
      });

      const newEdges = resetEdges.map(edge => {
        if (disabledEdges.includes(edge.id)) {
          return {
            ...edge,
            disabled: true,
            style: { ...edge.style, stroke: "#D3D3D3" },
          };
        }
        return edge;
      });
      return newEdges;
    });

    previousDisabledEdgesRef.current = disabledEdges;
  }, [disabledEdges, setEdges]);
  
  return null; 
};

export default DataPathController;