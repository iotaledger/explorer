/* eslint-disable react/no-unknown-property */
import { useFrame, useThree } from "@react-three/fiber";
import React, { useRef, RefObject, Dispatch, SetStateAction, useEffect } from "react";
import * as THREE from "three";
import { useConfigStore, useTangleStore } from "./store";
import { useRenderTangle } from "./useRenderTangle";
import { EMITTER_SPEED_MULTIPLIER, EMITTER_DEPTH, EMITTER_HEIGHT, EMITTER_WIDTH } from './constants';
import { getTangleDistances } from './utils';
import { CanvasElement } from './enums';

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
    const groupRef = useRef<THREE.Group>(null);
    const camera = get().camera;

    const { xTangleDistance, yTangleDistance } = getTangleDistances({ sinusoidal: 0 })

    useEffect(() => {
        setZoom(currentZoom);
    }, [currentZoom]);

    useEffect(() => {
        if (emitterRef?.current) {
            setRunListeners(true);
        }
    }, [emitterRef]);

    useFrame(() => {
        if (camera && groupRef.current) {
            camera.position.x = groupRef.current.position.x;
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

        if (groupRef.current) {
            groupRef.current.position.x += newPos;
        }
    });

    // The Tangle rendering hook
    useRenderTangle();

    return (
      <group ref={groupRef}>
        {/* TangleWrapper Mesh */}
        <mesh  name={CanvasElement.TangleWrapperMesh} position={[-(xTangleDistance / 2), 0, 0]}>
          <boxGeometry args={[xTangleDistance, yTangleDistance, 0]} attach="geometry"  />
          <meshPhongMaterial opacity={0} wireframe={true} transparent attach="material" />
        </mesh>

        {/* Emitter Mesh */}
        <mesh
            ref={emitterRef}
            name={CanvasElement.EmitterMesh}
            position={[0, 0, 0]}
        >
            <boxGeometry args={[EMITTER_WIDTH, EMITTER_HEIGHT, EMITTER_DEPTH]} />
            <meshPhongMaterial transparent={true} opacity={0.6} />
        </mesh>
      </group>
    );
};
export default Emitter;
