import { useFrame, useThree } from "@react-three/fiber";
import React, { RefObject, Dispatch, forwardRef, SetStateAction, useEffect, useRef } from "react";
import { Box3 } from "three";
import * as THREE from "three";
import { IFeedBlockData } from "../../models/api/stardust/feed/IFeedBlockData";
import { colors } from "./constants";
import { useBlockStore } from "./store";
import { TFeedBlockAdd } from "./types";
import { getGenerateY, randomIntFromInterval, timer } from "./utils";

interface EmitterProps {
    setRunSubscription: Dispatch<SetStateAction<boolean>>;
    ref: RefObject<THREE.Mesh>;
}


const Emitter = ({ setRunSubscription, ref }: EmitterProps) => {
    // const ref = useRef<THREE.Mesh>(null);


    useEffect(() => {
        if (ref?.current) {
            setRunSubscription(true);
        }
    }, [ref]);


    /**
     * Camera shift
     */
    const get = useThree(state => state.get);
    const viewport = useThree(state => state.viewport);
    const canvasWidth = viewport.width;
    useFrame(() => {
        const camera = get().camera;
        const emitterObj = get().scene.getObjectByName("emitter");
        if (camera && emitterObj) {
            camera.position.x = emitterObj.position.x - (canvasWidth / 2);
        }
    });

    /**
     * Emitter shift
     */
    useFrame((_, delta) => {
        if (ref?.current) {
            ref.current.position.x += delta * 80;
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
