import {
  useReactFlow,
  getNodesBounds,
  getViewportForBounds,
  ControlButton,
} from '@xyflow/react';

import { Download } from 'lucide-react';

import { toPng, toSvg } from 'html-to-image';
 
function downloadImage(dataUrl: string) {
  const a = document.createElement('a');
 
  a.setAttribute('download', 'execution.svg');
  a.setAttribute('href', dataUrl);
  a.click();
}
 
const imageWidth = 1024;
const imageHeight = 768;
 
function DownloadButton() {
  const { getNodes } = useReactFlow();
  const onClick = () => {
    // we calculate a transform for the nodes so that all nodes are visible
    // we then overwrite the transform of the `.react-flow__viewport` element
    // with the style option of the html-to-image library
    const nodesBounds = getNodesBounds(getNodes());
    const viewport = getViewportForBounds(
      nodesBounds,
      imageWidth,
      imageHeight,
      0.5,
      2,
      4
    );
 
    toSvg(document.querySelector('.react-flow__viewport'), {
      backgroundColor: '#1a365d',
      width: imageWidth,
      height: imageHeight,
      style: {
        width: imageWidth,
        height: imageHeight,
        transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
      },
    }).then(downloadImage);
  };
 
  return (
    <ControlButton onClick={onClick} title="Export SVG">
        <Download size={20} />
    </ControlButton>
  );
}
 
export default DownloadButton;