import { useFrame, useThree } from "@react-three/fiber";
import React, { RefObject, Dispatch, SetStateAction, useEffect } from "react";
import * as THREE from "three";

interface EmitterProps {
    setRunListeners: Dispatch<SetStateAction<boolean>>;
    emitterRef: RefObject<THREE.Mesh>;
}

const Emitter = ({ setRunListeners, emitterRef }: EmitterProps) => {
    useEffect(() => {
        if (emitterRef?.current) {
            setRunListeners(true);
        }
    }, [emitterRef]);


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
        if (emitterRef?.current) {
            emitterRef.current.position.x += delta * 80;
        }
    });

    return (
        <mesh
            ref={emitterRef}
            name="emitter"
            position={[(canvasWidth / 2) - 100, 0, 0]}
        >
            <boxGeometry args={[30, 150, 150]} />
            <meshPhongMaterial transparent={true} opacity={0.6} />
        </mesh>
    );
};
export default Emitter;
