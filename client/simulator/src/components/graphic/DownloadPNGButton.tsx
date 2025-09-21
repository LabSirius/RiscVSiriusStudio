import { useReactFlow, getNodesBounds } from '@xyflow/react';
import { Download } from 'lucide-react';
import { toPng } from 'html-to-image'; 
import { useState } from 'react';
import { useActiveEdges } from '@/context/graphic/ActiveEdgesContext'; 

function downloadImage(dataUrl: string) {
 const a = document.createElement('a');
 a.setAttribute('download', 'execution.png');
 a.setAttribute('href', dataUrl);
 a.click();
}

const imageWidth = 1920;
const imageHeight = 1080;

const ACTIVE_EDGE_STYLE = {
  stroke: '#3B5B B6',
  strokeWidth: '3.5px',
};

function DownloadPNGButton() {
 const { getNodes, getEdges, setEdges } = useReactFlow();
 const [isLoading, setIsLoading] = useState(false);
 const { activeEdges } = useActiveEdges();

 const onClick = () => {
  setIsLoading(true);
    const originalEdges = getEdges();
    const styledEdges = originalEdges.map((edge) => {
      if (activeEdges.includes(edge.id)) {
        return { ...edge, style: { ...edge.style, ...ACTIVE_EDGE_STYLE }, animated: false };
      }
      return { ...edge, animated: false };
    });

    setEdges(styledEdges);

    setTimeout(() => {
        const reactFlowViewport = document.querySelector('.react-flow__viewport') as HTMLElement;
        if (!reactFlowViewport) {
            setEdges(originalEdges);
            setIsLoading(false);
            return;
        }

        const nodes = getNodes();
        if (nodes.length === 0) {
            setEdges(originalEdges);
            setIsLoading(false);
            return;
        }
        const nodesBounds = getNodesBounds(nodes);

        toPng(reactFlowViewport, {
            backgroundColor: '#F7F9FB',
            width: imageWidth,
            height: imageHeight,
            filter: (node) => !node?.classList?.contains('react-flow__controls'),
            style: {
                width: `${imageWidth}px`,
                height: `${imageHeight}px`,
                transform: `scale(${imageWidth / (nodesBounds.width + 50)}) translate(${-nodesBounds.x + 25}px, ${-nodesBounds.y + 25}px)`,
            },
        })
        .then(downloadImage)
        .catch((error) => console.error('Error generando PNG:', error))
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
   title="Export PNG" 
  >
   {isLoading ? (
    <span className="text-black" style={{ fontSize: '10px' }}>...</span>
   ) : (
    <>
     <Download size={16} />
     <span className="text-black" style={{ fontSize: '7px', marginTop: '2px' }}>
      PNG
     </span>
    </>
   )}
  </button>
 );
}

export default DownloadPNGButton;