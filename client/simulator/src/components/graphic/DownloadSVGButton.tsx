import { useReactFlow, getNodesBounds } from '@xyflow/react';
import { Download } from 'lucide-react';
import { toSvg } from 'html-to-image';
import { useState } from 'react';
import { useActiveEdges } from '@/context/graphic/ActiveEdgesContext';

function downloadImage(dataUrl: string) {
  const a = document.createElement('a');
  a.setAttribute('download', 'execution.svg');
  a.setAttribute('href', dataUrl);
  a.click();
}

const imageWidth = 1920;
const padding = 50;


const ACTIVE_EDGE_STYLE = {
  stroke: '#3B59B6',
  strokeWidth: '4px',
};

function DownloadSVGButton() {
  const { getNodes, getEdges, setEdges } = useReactFlow();
  const [isLoading, setIsLoading] = useState(false);
  const { activeEdges } = useActiveEdges();

  const onClick = () => {
    setIsLoading(true);
    const originalEdges = getEdges();
    const styledEdges = originalEdges.map((edge) => {
      if (activeEdges.includes(edge.id)) {
        return {
          ...edge,
          style: { ...edge.style, ...ACTIVE_EDGE_STYLE },
          animated: false,
        };
      }
      return { ...edge, animated: false };
    });

    setEdges(styledEdges);

    setTimeout(() => {
      const reactFlowViewport = document.querySelector('.react-flow__viewport') as HTMLElement;
      if (!reactFlowViewport) {
        console.error('No se encontró el contenedor de ReactFlow');
        setEdges(originalEdges);
        setIsLoading(false);
        return;
      }

      const nodes = getNodes();
      if (nodes.length === 0) {
        console.warn('No hay nodos para exportar.');
        setEdges(originalEdges);
        setIsLoading(false);
        return;
      }
      
      const nodesBounds = getNodesBounds(nodes);

      const scale = imageWidth / (nodesBounds.width + padding);
      const imageHeight = (nodesBounds.height + padding) * scale;

      toSvg(reactFlowViewport, {
        backgroundColor: '#F7F9FB',
        width: imageWidth,
        height: imageHeight, 
        filter: (node) => !node?.classList?.contains('react-flow__controls'),
        style: {
          width: `${imageWidth}px`,
          height: `${imageHeight}px`, 
          transform: `scale(${scale}) translate(${-nodesBounds.x + padding / 2}px, ${-nodesBounds.y + padding / 2}px)`,
        },
      })
      .then(downloadImage)
      .catch((error) => console.error('Error generando SVG:', error))
      .finally(() => {
        setEdges(originalEdges);
        setIsLoading(false);
      });
    }, 100);
  };

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="flex flex-col items-center react-flow__controls-button-custom"
      title="Export SVG"
    >
      {isLoading ? (
        <span className="text-black" style={{ fontSize: '10px' }}>...</span>
      ) : (
        <>
          <Download size={16} />
          <span className="text-black" style={{ fontSize: '7px', marginTop: '2px' }}>
            SVG
          </span>
        </>
      )}
    </button>
  );
}

export default DownloadSVGButton;