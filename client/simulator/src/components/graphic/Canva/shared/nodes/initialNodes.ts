// initialNodes.ts
import { Node } from '@xyflow/react';
import { useIFNodes } from './IF';
import { ID } from './ID';
import { IE } from './IE';
import { MEM } from './MEM';
import { WB } from './WB';

// Hook que junta todos los nodos incluyendo los que usan contexto
export const useInitialNodes = (): Node[] => {
  const IF = useIFNodes(); // Aquí sí puedes usar el hook

  return [
    ...IF,
    ...ID,
    ...IE,
    ...MEM,
    ...WB,
  ];
};
