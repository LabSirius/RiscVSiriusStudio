import { useReactFlow, getNodesBounds } from '@xyflow/react';
import { toBlob } from 'html-to-image';
import { useState, forwardRef } from 'react';
import { useActiveEdges } from '@/context/graphic/ActiveEdgesContext';
import { Copy } from 'lucide-react';
import { toast } from 'sonner'; 

const imageWidth = 1920;
const padding = 50;

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
        if (!reactFlowViewport) throw new Error('React Flow viewport not found');

        const nodes = getNodes();
        if (nodes.length === 0) throw new Error('No nodes to copy');
        
        const nodesBounds = getNodesBounds(nodes);
        const scale = imageWidth / (nodesBounds.width + padding);
        const imageHeight = (nodesBounds.height + padding) * scale;

        const blob = await toBlob(reactFlowViewport, {
            backgroundColor: '#F7F9FB',
            width: imageWidth,
            height: imageHeight, 
            filter: (node) => !node?.classList?.contains('react-flow__controls'),
            style: {
                width: `${imageWidth}px`,
                height: `${imageHeight}px`, 
                transform: `scale(${scale}) translate(${-nodesBounds.x + padding / 2}px, ${-nodesBounds.y + padding / 2}px)`,
            },
            skipFonts: true, 
        });

        if (!blob) throw new Error('Could not generate image blob');

        await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
        ]);
        
        toast.success('Image copied to clipboard!');

      } catch (error) {
        console.error('Error copying image:', error);
        toast.error('Failed to copy image.');
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