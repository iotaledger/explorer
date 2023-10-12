import { Instances } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import React, { MutableRefObject, useEffect, useState } from "react";
import { NODE_SIZE_DEFAULT } from "../../shared/visualizer/common/constants";
import { UpdateListenerReturn } from "../../shared/visualizer/startdust/hooks";
import { TFeedBlockAdd } from "../../shared/visualizer/startdust/types";
import Emitter from "./Emitter";
import Sphere from "./Sphere";
import { useBlockStore } from "./store";

interface EmitterContextProps {
    network: string;
    refOnNewBlock: MutableRefObject<TFeedBlockAdd | null>;
    setOnNewExists: UpdateListenerReturn["setOnNewExists"];
}

const EmitterContext: React.FC<EmitterContextProps> = ({ network, refOnNewBlock, setOnNewExists }) => {
    const { blocks, blockOptions, zoom: zoomStore } = useBlockStore();
    const get = useThree(state => state.get);
    const cameraState = useThree(state => state.camera);
    const viewport = useThree(state => state.viewport);
    const scene = useThree(state => state.scene);
    const [zoom, setZoom] = useState(3);
    const canvasWidth = viewport.width;

    // useEffect(() => {
    //     // scene.a
    //     const geometry = new THREE.SphereGeometry(15, 32, 16);
    //     const material = new THREE.MeshBasicMaterial({
    //         color: 0xffff00
    //     });
    //     const sphere = new THREE.Mesh(geometry, material);
    //     scene.add(sphere);
    // }, []);

    // useFrame(() => {
    //     const camera = get().camera;
    //     const emitterObj = get().scene.getObjectByName("emitter");
    //     if (camera && emitterObj) {
    //
    //         // if (emitterObj.position.x < 100) {
    //         //     // console.log('--- ', emitterObj.position.x);
    //         // }
    //         camera.position.x = emitterObj.position.x - (canvasWidth / 2) + 100;
    //     }
    // });

    useEffect(() => {
        // console.log('--- zoomStore', zoomStore);
        setZoom(zoomStore);
    }, [zoomStore]);

    useEffect(() => {
        if (cameraState) {
            // cameraState.zoom = zoom;
            // cameraState.updateProjectionMatrix();
            // @ts-ignore
            // window.c = cameraState;
        }
    }, [cameraState, zoom]);

    // console.log('--- blocks', blocks.length);
    return (
        <>
            <Emitter
                network={network}
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
