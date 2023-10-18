import { useFrame, useThree } from "@react-three/fiber";
import React, { RefObject, Dispatch, SetStateAction, useEffect } from "react";
import * as THREE from "three";
import { useBorderPositions } from "./hooks/useBorderPositions";
import { useBlockStore } from "./store";

interface EmitterProps {
    setRunListeners: Dispatch<SetStateAction<boolean>>;
    emitterRef: RefObject<THREE.Mesh>;
}

const Emitter = ({ setRunListeners, emitterRef }: EmitterProps) => {
    const isPlaying = useBlockStore(state => state.isPlaying);

    useEffect(() => {
        if (emitterRef?.current) {
            setRunListeners(true);
        }
    }, [emitterRef]);


    /**
     * Camera shift
     */
    const { halfScreenWidth } = useBorderPositions();
    const get = useThree(state => state.get);
    useFrame(() => {
        console.log("--- useFrame");
        if (!isPlaying) {
            return;
        }
        const camera = get().camera;
        const emitterObj = get().scene.getObjectByName("emitter");
        if (camera && emitterObj) {
            const EMITTER_PADDING_RIGHT = 150;
            camera.position.x = emitterObj.position.x - halfScreenWidth + EMITTER_PADDING_RIGHT;
        }
    });

    /**
     * Emitter shift
     */
    useFrame((_, delta) => {
        if (!isPlaying) {
            return;
        }
        if (emitterRef?.current) {
            const DELTA_MULTIPLIER = 80; // depends on this param we can manage speed of emitter
            emitterRef.current.position.x += delta * DELTA_MULTIPLIER;
        }
    });

    return (
        <mesh
            ref={emitterRef}
            name="emitter"
            position={[0, 0, 0]}
        >
            <boxGeometry args={[30, 150, 150]} />
            <meshPhongMaterial transparent={true} opacity={0.6} />
        </mesh>
    );
};
export default Emitter;
