import {
  useReactFlow,
  getNodesBounds,
} from '@xyflow/react';

import { Download } from 'lucide-react';

import { toSvg } from 'html-to-image';
 
function downloadImage(dataUrl: string) {
  const a = document.createElement('a');
 
  a.setAttribute('download', 'execution.svg');
  a.setAttribute('href', dataUrl);
  a.click();
}
 
const imageWidth = 1920;
const imageHeight = 1080;
 
function DownloadButton() {
  const { getNodes, getEdges, setEdges } = useReactFlow();
  
  const onClick = () => {
    // Store the original edges
    const originalEdges = getEdges();
    
    // Create a copy of edges with animations disabled
    const staticEdges = originalEdges.map(edge => ({
      ...edge,
      animated: false,
      type: edge.type === 'animatedSvg' ? 'default' : edge.type,
    }));
    
    // Apply the static edges
    setEdges(staticEdges);
    
    // Get all nodes to calculate bounds
    const nodes = getNodes();
    
    // Calculate the bounds that include all nodes
    const nodesBounds = getNodesBounds(nodes);
    
    // Calculate aspect ratio of the bounds and the target image
    const boundsAspectRatio = nodesBounds.width / nodesBounds.height;
    const imageAspectRatio = imageWidth / imageHeight;
    
    // Determine dimensions based on aspect ratio
    let width, height;
    if (boundsAspectRatio > imageAspectRatio) {
      // Diagram is wider than the image aspect ratio
      width = nodesBounds.width + 40; // Small padding
      height = width / imageAspectRatio;
    } else {
      // Diagram is taller than the image aspect ratio
      height = nodesBounds.height + 40; // Small padding
      width = height * imageAspectRatio;
    }
    
    // Calculate the transform to center the diagram
    const x = nodesBounds.x - (width - nodesBounds.width) / 2;
    const y = nodesBounds.y - (height - nodesBounds.height) / 2;
    
    // Calculate the zoom level to fit the diagram
    const zoom = Math.min(
      imageWidth / width,
      imageHeight / height
    );
    
    // Get all stylesheets
    const stylesheets = Array.from(document.styleSheets)
      .filter(stylesheet => {
        try {
          return !stylesheet.href || stylesheet.href.startsWith(window.location.origin);
        } catch  {
          return false;
        }
      })
      .map(stylesheet => {
        try {
          return Array.from(stylesheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n');
        } catch (e) {
          console.warn('Cannot access stylesheet rules', e);
          return '';
        }
      })
      .join('\n');
    
    // Get the ReactFlow viewport element
    const reactFlowViewport = document.querySelector('.react-flow__viewport')! as HTMLElement;
    
    // Small delay to ensure the DOM updates before capturing
    setTimeout(() => {
      toSvg(reactFlowViewport, {
        backgroundColor: '#F7F9FB',
        width: imageWidth,
        height: imageHeight,
        style: {
          width: imageWidth.toString(),
          height: imageHeight.toString(),
          transform: `translate(${-x * zoom}px, ${-y * zoom}px) scale(${zoom})`,
        },
        filter: () => {
          return true;
        },
        fontEmbedCSS: stylesheets,
      }).then((dataUrl) => {
        // Restore original edges with animations
        setEdges(originalEdges);
        downloadImage(dataUrl);
      }).catch(error => {
        console.error("Error generating SVG:", error);
        setEdges(originalEdges);
      });
    }, 100);
  };
 
  return (
      <div onClick={onClick} className='flex flex-col items-center react-flow__controls-button-custom' title="Export SVG">
        <Download size={16} />
        <span className='text-black' style={{ fontSize: '7px', marginTop: '2px' }}>SVG</span>
      </div>
  );
}
 
export default DownloadButton;