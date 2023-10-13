import { Instances } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import React, { MutableRefObject, useEffect } from "react";
import { NODE_SIZE_DEFAULT } from "../../shared/visualizer/common/constants";
import { UpdateListenerReturn } from "../../shared/visualizer/startdust/hooks";
import { TFeedBlockAdd } from "../../shared/visualizer/startdust/types";
import Emitter from "./Emitter";
import Sphere from "./Sphere";
import { useBlockStore } from "./store";

interface EmitterContextProps {
    refOnNewBlock: MutableRefObject<TFeedBlockAdd | null>;
    setOnNewExists: UpdateListenerReturn["setOnNewExists"];
}

const EmitterContext: React.FC<EmitterContextProps> = ({ refOnNewBlock, setOnNewExists }) => {
    const { blocks, blockOptions, zoom: zoomStore } = useBlockStore();
    const get = useThree(state => state.get);
    const cameraState = useThree(state => state.camera);
    const viewport = useThree(state => state.viewport);
    const canvasWidth = viewport.width;

    useFrame(() => {
        const camera = get().camera;
        const emitterObj = get().scene.getObjectByName("emitter");
        if (camera && emitterObj) {
            camera.position.x = emitterObj.position.x - (canvasWidth / 2);
        }
    });

    useEffect(() => {
        if (cameraState) {
            cameraState.zoom = zoomStore;
            cameraState.updateProjectionMatrix();
        }
    }, [cameraState, zoomStore]);

    return (
        <>
            <Emitter
                refOnNewBlock={refOnNewBlock}
                setOnNewExists={setOnNewExists}
            />
            <Instances
                limit={2500}
                range={2500}
                frustumCulled={false}
            >
                <sphereGeometry args={[NODE_SIZE_DEFAULT]} />
                <meshPhongMaterial />
                {
                    blocks.map(block => (
                        <Sphere
                            key={block.id}
                            id={block.id}
                            position={block.position}
                            color={blockOptions[block.id].color}
                            scale={blockOptions[block.id].scale}
                        />
                    ))
                }
            </Instances>
        </>
    );
};

export default EmitterContext;
