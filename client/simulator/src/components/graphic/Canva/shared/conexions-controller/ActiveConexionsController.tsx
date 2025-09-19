import { useEffect } from 'react';
import { Edge } from '@xyflow/react';
import { useDataMonocycleConexions } from './useDataMonocycleConexions'; 
import { useSimulator } from '@/context/shared/SimulatorContext';
import { useDataPipelineConexions } from './useDataPipelineConexions';

interface DataPathControllerProps {
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
}

const DataPathController: React.FC<DataPathControllerProps> = ({ setEdges }) => {
  const { typeSimulator, operation } = useSimulator();

  const monoDisabledEdges = useDataMonocycleConexions();
  const pipelineDisabledEdges = useDataPipelineConexions(); 

  const disabledEdges =
    typeSimulator === "monocycle" ? monoDisabledEdges : pipelineDisabledEdges;


  useEffect(() => {
    if (operation === "uploadMemory") {
      setEdges(prevEdges =>
        prevEdges.map(edge => ({
          ...edge,
          disabled: false,
          style: { ...edge.style, stroke: "#3B59B6" },
          data: { ...edge.data, selected: false },
        }))
      );
      return; 
    }

    setEdges(prevEdges =>
      prevEdges.map(edge => {
        const isDisabled = disabledEdges.includes(edge.id);

        const strokeColor = isDisabled
          ? "#D3D3D3" 
          : edge.data?.selected ? "#E91E63" : "#3B59B6"; 

        return {
          ...edge,
          disabled: isDisabled,
          style: { ...edge.style, stroke: strokeColor },
        };
      })
    );
  }, [disabledEdges, operation, setEdges]);

  return null;
};

export default DataPathController;