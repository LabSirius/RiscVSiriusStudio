import { Node } from '@xyflow/react';
import { useIFNodes } from './IF';
import { useIDNodes } from './ID';
import { useIENodes } from './IE';
import { useMEMNodes } from './MEM';
import { useWBNodes } from './WB';

export const useInitialNodes = (): Node[] => {
  const IF = useIFNodes(); 
  const ID = useIDNodes();
  const IE = useIENodes(); 
  const MEM = useMEMNodes();
  const WB = useWBNodes();

  return [
    ...IF,
    ...ID,
    ...IE,
    ...MEM,
    ...WB,
  ];
};
