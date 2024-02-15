/* eslint-disable react/no-unknown-property */
import { useFrame, useThree } from "@react-three/fiber";
import React, { RefObject, Dispatch, SetStateAction, useEffect, useRef } from "react";
import * as THREE from "three";
import { useConfigStore, useTangleStore } from "./store";
import { useRenderTangle } from "./useRenderTangle";
import { getTangleDistances, getEmitterPosition } from "./utils";
import { CanvasElement } from "./enums";
import useVisualizerTimer from "~/helpers/nova/hooks/useVisualizerTimer";
import { EMITTER_DEPTH, EMITTER_HEIGHT, EMITTER_WIDTH } from "./constants";

interface EmitterProps {
    readonly setRunListeners: Dispatch<SetStateAction<boolean>>;
    readonly emitterRef: RefObject<THREE.Mesh>;
}

const Emitter: React.FC<EmitterProps> = ({ setRunListeners, emitterRef }: EmitterProps) => {
    const setZoom = useTangleStore((s) => s.setZoom);
    const get = useThree((state) => state.get);
    const currentZoom = useThree((state) => state.camera.zoom);
    const camera = get().camera;

    const { xTangleDistance, yTangleDistance } = getTangleDistances();
    const isPlaying = useConfigStore((state) => state.isPlaying);
    const setIsPlaying = useConfigStore((state) => state.setIsPlaying);
    const setInitialTime = useConfigStore((state) => state.setInitialTime);
    const getVisualizerTimeDiff = useVisualizerTimer();

    const groupRef = useRef<THREE.Group>(null);

    useEffect(() => {
        setZoom(currentZoom);
    }, [currentZoom]);

    useEffect(() => {
        if (emitterRef?.current) {
            setIsPlaying(true);
            setRunListeners(true);
            setInitialTime(Date.now());
        }

        return () => {
            setIsPlaying(false);
            setRunListeners(false);
        };
    }, [emitterRef?.current]);

    /**
     * Emitter shift
     */
    useFrame(() => {
        const currentAnimationTime = getVisualizerTimeDiff();

        if (isPlaying) {
            const { x, y } = getEmitterPosition(currentAnimationTime);

            if (emitterRef.current) {
                emitterRef.current.position.x = x;
                emitterRef.current.position.y = y;
            }

            if (groupRef.current) {
                groupRef.current.position.x = x;
            }

            if (camera) {
                camera.position.x = x;
            }
        }
    });

    // The Tangle rendering hook
    useRenderTangle();

    return (
        <group ref={groupRef}>
            {/* TangleWrapper Mesh */}
            <mesh name={CanvasElement.TangleWrapperMesh} position={[-(xTangleDistance / 2), 0, 0]}>
                <boxGeometry args={[xTangleDistance, yTangleDistance, 0]} attach="geometry" />
                <meshPhongMaterial transparent opacity={0} wireframe attach="material" />
            </mesh>

            {/* Emitter Mesh */}
            <mesh ref={emitterRef} name={CanvasElement.EmitterMesh} position={[0, 0, 0]}>
                <boxGeometry args={[EMITTER_WIDTH, EMITTER_HEIGHT, EMITTER_DEPTH]} />
                <meshPhongMaterial transparent opacity={0} />
            </mesh>
        </group>
    );
};
export default Emitter;
