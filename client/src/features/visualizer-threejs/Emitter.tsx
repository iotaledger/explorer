import { useFrame, useThree } from "@react-three/fiber";
import React, { useRef } from "react";
import { Box3 } from "three";
import { IFeedBlockData } from "../../models/api/stardust/feed/IFeedBlockData";
import { useUpdateListener } from "../visualizer-canvas/hooks/useUpdateListener";
import { colors } from "./constants";
import { useBlockStore } from "./store";
import { randomIntFromInterval } from "./utils";

interface EmitterProps {
    network: string;
}

const Emitter: React.FC<EmitterProps> = ({ network }) => {
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
    useUpdateListener(network, onNewBlock);

    useFrame((_, delta) => {
        if (ref.current) {
            // ref.current.rotation.x += delta;
            ref.current.position.x += delta * 80;
            // console.log("emitter moveing", delta);
            // ref.current.position.y = 100 * Math.sin(-1000 * ref.current.position.x);
        }
    });

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
