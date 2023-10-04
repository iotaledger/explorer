import { useFrame, useThree } from "@react-three/fiber";
import React, { MutableRefObject, useEffect, useRef } from "react";
import { Box3 } from "three";
import { IFeedBlockData } from "../../models/api/stardust/feed/IFeedBlockData";
import { colors } from "../../shared/visualizer/common/constants";
import { randomIntFromInterval } from "../../shared/visualizer/common/utils";
import { UpdateListenerReturn } from "../../shared/visualizer/startdust/hooks";
import { TFeedBlockAdd } from "../../shared/visualizer/startdust/types";
import { useBlockStore } from "./store";


interface EmitterProps {
    network: string;
    refOnNewBlock: MutableRefObject<TFeedBlockAdd | null>;
    setOnNewExists: UpdateListenerReturn["setOnNewExists"];
}

const Emitter: React.FC<EmitterProps> = ({ network, refOnNewBlock, setOnNewExists }) => {
    const ref = useRef<THREE.Mesh>(null);
    const { addBlock } = useBlockStore();
    const viewport = useThree(state => state.viewport);
    const canvasWidth = viewport.width;

    const onNewBlock = (blockData: IFeedBlockData) => {
        const emitterObj = ref.current;
        if (emitterObj) {
            const emitterBox = new Box3().setFromObject(emitterObj);
            addBlock({
                id: blockData.blockId,
                position: [
                    randomIntFromInterval(emitterBox.min.x, emitterBox.max.x),
                    randomIntFromInterval(emitterBox.min.y, emitterBox.max.y),
                    randomIntFromInterval(emitterBox.min.z, emitterBox.max.z)
                ],
                color: colors[randomIntFromInterval(0, colors.length - 1)]
            });
        }
    };

    useFrame((_, delta) => {
        if (ref.current) {
            // ref.current.rotation.x += delta;
            ref.current.position.x += delta * 80;
            // console.log("emitter moveing", delta);
            // ref.current.position.y = 100 * Math.sin(-1000 * ref.current.position.x);
        }
    });

    useEffect(() => {
        // Set handler for new block
        refOnNewBlock.current = onNewBlock;
        setOnNewExists(true);
    }, []);

    return (
        <mesh
            ref={ref}
            name="emitter"
            position={[(canvasWidth / 2) - 100, 0, 0]}
        >
            <boxGeometry args={[30, 150, 150]} />
            <meshPhongMaterial transparent={true} opacity={0.6} />
        </mesh>
    );
};

export default Emitter;
