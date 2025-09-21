import { useReactFlow, getNodesBounds } from '@xyflow/react';
import { toBlob } from 'html-to-image';
import { useState, forwardRef } from 'react';
import { useActiveEdges } from '@/context/graphic/ActiveEdgesContext'; 
import { Copy } from 'lucide-react';

const imageWidth = 1920;
const imageHeight = 1080;

const ACTIVE_EDGE_STYLE = {
 stroke: '#3B59B6',
 strokeWidth: '4px',
};

const CopyToClipboardButton = forwardRef<
  HTMLButtonElement, 
  React.ComponentPropsWithoutRef<'button'>
>(
  (props, ref) => {
    const { getNodes, getEdges, setEdges } = useReactFlow();
    const [isLoading, setIsLoading] = useState(false);
    const { activeEdges } = useActiveEdges();

    const handleCopyToClipboard = async () => {
      setIsLoading(true);
      const originalEdges = getEdges();
      const styledEdges = originalEdges.map((edge) => {
        if (activeEdges.includes(edge.id)) {
          return { ...edge, style: { ...edge.style, ...ACTIVE_EDGE_STYLE }, animated: false };
        }
        return { ...edge, animated: false };
      });
      
      setEdges(styledEdges);

      await new Promise(resolve => setTimeout(resolve, 100));

      try {
        const reactFlowViewport = document.querySelector('.react-flow__viewport') as HTMLElement;
        if (!reactFlowViewport) throw new Error('React Flow viewport no encontrado');

        const nodes = getNodes();
        if (nodes.length === 0) throw new Error('No hay nodos para copiar');
        
        const nodesBounds = getNodesBounds(nodes);

        const blob = await toBlob(reactFlowViewport, {
            backgroundColor: '#F7F9FB',
            width: imageWidth,
            height: imageHeight,
            filter: (node) => !node?.classList?.contains('react-flow__controls'),
            style: {
                width: `${imageWidth}px`,
                height: `${imageHeight}px`,
                transform: `scale(${imageWidth / (nodesBounds.width + 50)}) translate(${-nodesBounds.x + 25}px, ${-nodesBounds.y + 25}px)`,
            },
        });

        if (!blob) throw new Error('No se pudo generar la imagen blob');

        await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
        ]);
        
        console.log("¡Imagen copiada al portapapeles!");

      } catch (error) {
        console.error('Error al copiar la imagen:', error);
      } finally {
        setEdges(originalEdges);
        setIsLoading(false);
      }
    };

    return (
      <button
        ref={ref}
        {...props}
        onClick={handleCopyToClipboard}
        disabled={isLoading}
        className="flex flex-col items-center react-flow__controls-button-custom"
        title="Copy PNG to Clipboard"
      >
        {isLoading ? (
            <span className="text-black" style={{ fontSize: '10px' }}>...</span>
          ) : (
            <Copy size={16} />
          )}
      </button>
    );
  }
);

CopyToClipboardButton.displayName = "CopyToClipboardButton";

export default CopyToClipboardButton;