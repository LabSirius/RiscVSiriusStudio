import { toPng } from "html-to-image";

/**
 * Screenshot a single React Flow node by its id and trigger a PNG download.
 *
 * React Flow tags each node's DOM wrapper with `data-id`, so we render that
 * element straight to canvas with html-to-image. This ignores the viewport's
 * `transform: scale()` and clipping, so the capture is a tight, crisp crop of
 * just that module, unlike an OS screenshot of the zoomed/clipped canvas.
 *
 * The node must be mounted (visible in the viewport); off-screen nodes are not
 * in the DOM. `pixelRatio` oversamples for print-quality docs images.
 */
export async function downloadNodePng(
  nodeId: string,
  fileName = `${nodeId}.png`,
  pixelRatio = 4,
): Promise<void> {
  const el = document.querySelector<HTMLElement>(
    `.react-flow__node[data-id="${nodeId}"]`,
  );
  if (!el) {
    console.error(`downloadNodePng: node "${nodeId}" not found in the DOM`);
    return;
  }

  try {
    const dataUrl = await toPng(el, {
      pixelRatio,
      backgroundColor: "#F7F9FB",
      cacheBust: true,
    });
    const a = document.createElement("a");
    a.download = fileName;
    a.href = dataUrl;
    a.click();
  } catch (error) {
    console.error(`downloadNodePng: failed for "${nodeId}":`, error);
  }
}
