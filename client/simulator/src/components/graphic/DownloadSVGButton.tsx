import { useReactFlow, getNodesBounds } from '@xyflow/react';
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

function DownloadSVGButton() {
  const { getNodes, getEdges, setEdges } = useReactFlow();

  const onClick = () => {
    document.querySelectorAll('.react-flow__edge path').forEach((path) => {
      path.setAttribute('stroke', '#3B59B6');
      path.setAttribute('stroke-width', '6.5px');
    });

    const originalEdges = getEdges();

    const staticEdges = originalEdges.map((edge) => ({
      ...edge,
      animated: false,
      type: edge.type === 'animatedSvg' ? 'default' : edge.type,
    }));

    setEdges(staticEdges);

    const nodes = getNodes();
    const nodesBounds = getNodesBounds(nodes);

    const boundsAspectRatio = nodesBounds.width / nodesBounds.height;
    const imageAspectRatio = imageWidth / imageHeight;
    let width, height;
    if (boundsAspectRatio > imageAspectRatio) {
      width = nodesBounds.width + 40; 
      height = width / imageAspectRatio;
    } else {
      height = nodesBounds.height + 40; 
      width = height * imageAspectRatio;
    }

    const x = nodesBounds.x - (width - nodesBounds.width) / 2;
    const y = nodesBounds.y - (height - nodesBounds.height) / 2;
    const zoom = Math.min(imageWidth / width, imageHeight / height);

    const stylesheets = Array.from(document.styleSheets)
      .filter((stylesheet) => {
        try {
          return !stylesheet.href || stylesheet.href.startsWith(window.location.origin);
        } catch {
          return false;
        }
      })
      .map((stylesheet) => {
        try {
          return Array.from(stylesheet.cssRules)
            .map((rule) => rule.cssText)
            .join('\n');
        } catch (e) {
          console.warn('Cannot access stylesheet rules', e);
          return '';
        }
      })
      .join('\n');

    const reactFlowViewport = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (!reactFlowViewport) {
      console.error('No se encontró el contenedor de ReactFlow');
      return;
    }

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
        filter: () => true,
        fontEmbedCSS: stylesheets,
      })
        .then((dataUrl: string) => {
          setEdges(originalEdges);
          downloadImage(dataUrl);
        })
        .catch((error) => {
          console.error('Error generando SVG:', error);
          setEdges(originalEdges);
        });
    }, 100);
  };

  return (
    <div
      onClick={onClick}
      className="flex flex-col items-center react-flow__controls-button-custom"
      title="Export SVG"
    >
      <Download size={16} />
      <span className="text-black" style={{ fontSize: '7px', marginTop: '2px' }}>
        SVG
      </span>
    </div>
  );
}

export default DownloadSVGButton;
