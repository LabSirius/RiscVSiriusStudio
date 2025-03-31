import { Controls } from '@xyflow/react';
import DownloadButton from '../DownloadButton';

const CustomControls = () => {
    return (
        <Controls showInteractive={false}>
            <DownloadButton />
        </Controls>
    );
};

export default CustomControls;
