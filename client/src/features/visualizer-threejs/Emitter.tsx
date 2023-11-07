/* eslint-disable react/no-unknown-property */
import { useFrame, useThree } from "@react-three/fiber";
import React, { RefObject, Dispatch, SetStateAction, useEffect, useRef } from "react";
import * as THREE from "three";
import { MAX_BLOCK_INSTANCES, NODE_SIZE_DEFAULT } from "./constants";
import { useBorderPositions } from "./hooks/useBorderPositions";
import { useBlockStore } from "./store";
import { useRenderEdges } from "./useRenderEdges";
import { useRenderTangle } from "./useRenderTangle";

interface EmitterProps {
    readonly setRunListeners: Dispatch<SetStateAction<boolean>>;
    readonly emitterRef: RefObject<THREE.Mesh>;
}

const Emitter: React.FC<EmitterProps> = ({ setRunListeners, emitterRef }: EmitterProps) => {
    const isPlaying = useBlockStore(state => state.isPlaying);
    const get = useThree(state => state.get);
    const { halfScreenWidth } = useBorderPositions();

    useEffect(() => {
        if (emitterRef?.current) {
            setRunListeners(true);
        }
    }, [emitterRef]);

    useFrame(() => {
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

    // The Tangle rendering hook
    const SPHERE_GEOMETRY = new THREE.SphereGeometry(NODE_SIZE_DEFAULT, 32, 16);
    const SPHERE_MATERIAL = new THREE.MeshPhongMaterial();
    const tangleMeshRef = useRef(new THREE.InstancedMesh(SPHERE_GEOMETRY, SPHERE_MATERIAL, MAX_BLOCK_INSTANCES));
    useRenderTangle(
        tangleMeshRef
    );

    useRenderEdges(
        tangleMeshRef
    );

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
