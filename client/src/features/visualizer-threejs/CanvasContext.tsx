import { Instances } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import React, { useEffect } from "react";
import { IFeedBlockData } from "../../models/api/stardust/feed/IFeedBlockData";
import BlockMesh from "./BlockMesh";
import { colors } from "./constants";
import { useBlockStore } from "./store";
import { randomIntFromInterval } from "./utils";
import { useUpdateListener } from "../../shared/visualizer/startdust/hooks";
import { TFeedBlockAdd } from "../../shared/visualizer/startdust/types";

interface CanvasContextProps {
    network: string;
    refOnNewBlock: React.RefObject<TFeedBlockAdd>;
}

const CanvasContext: React.FC<CanvasContextProps> = ({ network, refOnNewBlock }) => {
    const { blocks, addBlock } = useBlockStore();
    const viewport = useThree(state => state.viewport);

    const canvasWidth = viewport.width;
    const canvasHeight = viewport.height;

    const onNewBlock = (blockData: IFeedBlockData) => {
        addBlock({
            id: blockData.blockId,
            position: [
                randomIntFromInterval(180, 210),
                randomIntFromInterval(-50, 50),
                randomIntFromInterval(-50, -150)
            ],
            color: colors[randomIntFromInterval(0, colors.length - 1)]
        });
    };


    useEffect(() => {
        // @ts-expect-error current is read-only
        refOnNewBlock.current = onNewBlock;
    }, []);

    console.log("block on screen N:", blocks.length);

    return (
        <Instances
            limit={2500}
            range={2500}
        >
            <sphereGeometry args={[10]} />
            <meshPhongMaterial />
            {
                blocks.map(block => (
                    <BlockMesh
                        key={block.id}
                        id={block.id}
                        position={block.position}
                        color={block.color}
                    />
                ))
            }
        </Instances>
    );
};

export default CanvasContext;
