import { Instances } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import React, { useEffect, RefObject, MutableRefObject } from "react";
import { IFeedBlockData } from "../../models/api/stardust/feed/IFeedBlockData";
import { UpdateListenerReturn } from "../../shared/visualizer/startdust/hooks";
import { TFeedBlockAdd } from "../../shared/visualizer/startdust/types";
import BlockMesh from "./BlockMesh";
import { useBlockStore } from "./store";
import { getGenerateY, randomIntFromInterval, timer } from "../../shared/visualizer/common/utils";
import { colors } from "../../shared/visualizer/common/constants";

interface CanvasContextProps {
    network: string;
    refOnNewBlock: MutableRefObject<TFeedBlockAdd | null>;
    setOnNewExists: UpdateListenerReturn["setOnNewExists"];
}

const timerDiff = timer(250);

const CanvasContext: React.FC<CanvasContextProps> = ({ network, refOnNewBlock, setOnNewExists }) => {
    const { blocks, addBlock } = useBlockStore();
    const viewport = useThree(state => state.viewport);

    const canvasWidth = viewport.width;
    const canvasHeight = viewport.height;
    const generateY = getGenerateY({ withRandom: true });

    const onNewBlock = (blockData: IFeedBlockData) => {
        const secondsFromStart = timerDiff();

        const Y = generateY(secondsFromStart);
        const X = randomIntFromInterval(50, 80);
        const Z = randomIntFromInterval(-50, -150);


        addBlock({
            id: blockData.blockId,
            position: [
                X,
                Y,
                Z
            ],
            color: colors[randomIntFromInterval(0, colors.length - 1)]
        });
    };


    useEffect(() => {
        // Set handler for new block
        refOnNewBlock.current = onNewBlock;
        setOnNewExists(true);
    }, []);

    // console.log("block on screen N:", blocks.length);

    return (
        <Instances
            limit={2500}
            range={2500}
        >
            <sphereGeometry args={[3]} />
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
