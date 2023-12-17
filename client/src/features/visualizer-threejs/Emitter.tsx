/* eslint-disable react/no-unknown-property */
import { useFrame, useThree } from "@react-three/fiber";
import React, { useRef, RefObject, Dispatch, SetStateAction, useEffect } from "react";
import * as THREE from "three";
import { useBorderPositions } from "./hooks/useBorderPositions";
import { useConfigStore, useTangleStore } from "./store";
import { useRenderTangle } from "./useRenderTangle";
import { EMITTER_PADDING_RIGHT, EMITTER_SPEED_MULTIPLIER, VISUALIZER_SAFE_ZONE, EMITTER_DEPTH, EMITTER_HEIGHT, EMITTER_WIDTH } from './constants';
import { getTangleDistances } from './utils';
import { TangleMeshType } from './types';
import { ElementName } from './enums';

interface EmitterProps {
    readonly setRunListeners: Dispatch<SetStateAction<boolean>>;
    readonly emitterRef: RefObject<THREE.Mesh>;
}

const Emitter: React.FC<EmitterProps> = ({
    setRunListeners,
    emitterRef
}: EmitterProps) => {
    const isPlaying = useConfigStore(state => state.isPlaying);
    const get = useThree(state => state.get);
    const currentZoom = useThree(state => state.camera.zoom);
    const setZoom = useTangleStore(s => s.setZoom);
    const { halfScreenWidth } = useBorderPositions();
    const tangleMesh = useRef<TangleMeshType | null>(null)

    const sinusoidal = 0

  const { xDistance, yDistance } = getTangleDistances({ sinusoidal })
    
    useEffect(() => {
        setZoom(currentZoom);
    }, [currentZoom]);

    useEffect(() => {
        if (emitterRef?.current) {
            setRunListeners(true);
        }
    }, [emitterRef]);

    useFrame(() => {
        const camera = get().camera;
        const emitterObj = get().scene.getObjectByName(ElementName.EmitterMesh);
        if (camera && emitterObj) {
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

        const newPos = delta * EMITTER_SPEED_MULTIPLIER;

        if (emitterRef?.current) {
            emitterRef.current.position.x += newPos;
        }

        if (tangleMesh.current) {
          tangleMesh.current.position.x += newPos;
        }
    });

    // The Tangle rendering hook
    useRenderTangle();


    return (
      <>
        {/* Mesh for tangle zoom */}
        <mesh ref={tangleMesh} name={ElementName.TangleMesh} position={[-(xDistance / 2), 0, 0]}>
          <boxGeometry args={[xDistance + (VISUALIZER_SAFE_ZONE * 2), yDistance, 0.1]} />
          <meshPhongMaterial opacity={0} wireframe={true} transparent />
        </mesh>

        {/* Emitter Mesh */}
        <mesh
            ref={emitterRef}
            name={ElementName.EmitterMesh}
            position={[0, 0, 0]}
        >
            <boxGeometry args={[EMITTER_WIDTH, EMITTER_HEIGHT, EMITTER_DEPTH]} />
            <meshPhongMaterial transparent={true} opacity={0.6} />
        </mesh>
      </>
    );
};
export default Emitter;
