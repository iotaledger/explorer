/* eslint-disable react/no-unknown-property */
import { useFrame, useThree } from "@react-three/fiber";
import React, { RefObject, Dispatch, SetStateAction, useEffect, useRef } from "react";
import * as THREE from "three";
import { useConfigStore, useTangleStore } from "./store";
import { useRenderTangle } from "./useRenderTangle";
import { getTangleDistances, getEmitterPositions } from "./utils";
import { CanvasElement } from "./enums";
import useVisualizerTimer from "~/helpers/nova/hooks/useVisualizerTimer";
import { EMITTER_DEPTH, EMITTER_HEIGHT, EMITTER_WIDTH } from "./constants";

interface EmitterProps {
    readonly setRunListeners: Dispatch<SetStateAction<boolean>>;
    readonly emitterRef: RefObject<THREE.Mesh>;
}

const { xTangleDistance, yTangleDistance } = getTangleDistances();

const Emitter: React.FC<EmitterProps> = ({ setRunListeners, emitterRef }: EmitterProps) => {
    const getVisualizerTimeDiff = useVisualizerTimer();

    const setZoom = useTangleStore((s) => s.setZoom);
    const get = useThree((state) => state.get);
    const currentZoom = useThree((state) => state.camera.zoom);
    const camera = get().camera;

    const isPlaying = useConfigStore((state) => state.isPlaying);
    const setIsPlaying = useConfigStore((state) => state.setIsPlaying);
    const setInitialTime = useConfigStore((state) => state.setInitialTime);

    const tangleWrapperRef = useRef<THREE.Mesh | null>(null);

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

    useFrame(() => {});

    /**
     * Emitter shift
     */
    useFrame(() => {
        const currentAnimationTime = getVisualizerTimeDiff();
        const { x, y } = getEmitterPositions(currentAnimationTime);

        if (isPlaying) {
            if (emitterRef.current) {
                emitterRef.current.position.x = x;
                emitterRef.current.position.y = y;
            }

            if (tangleWrapperRef.current) {
                tangleWrapperRef.current.position.x = x - xTangleDistance / 2;
            }
        }

        if (tangleWrapperRef.current && camera) {
            camera.position.x = tangleWrapperRef.current.position.x + xTangleDistance / 2;
        }
    });

    // The Tangle rendering hook
    useRenderTangle();

    return (
        <>
            {/* TangleWrapper Mesh */}
            <mesh ref={tangleWrapperRef} name={CanvasElement.TangleWrapperMesh} position={[-(xTangleDistance / 2), 0, 0]}>
                <boxGeometry args={[xTangleDistance, yTangleDistance, 0]} attach="geometry" />
                <meshPhongMaterial transparent opacity={0} attach="material" />
            </mesh>

            {/* Emitter Mesh */}
            <mesh ref={emitterRef} name={CanvasElement.EmitterMesh} position={[0, 0, 0]}>
                <boxGeometry args={[EMITTER_WIDTH, EMITTER_HEIGHT, EMITTER_DEPTH]} />
                <meshPhongMaterial transparent opacity={0} />
            </mesh>
        </>
    );
};
export default Emitter;
