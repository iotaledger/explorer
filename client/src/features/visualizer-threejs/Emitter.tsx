/* eslint-disable react/no-unknown-property */
import { useFrame, useThree } from "@react-three/fiber";
import React, { RefObject, Dispatch, SetStateAction, useEffect, useRef } from "react";
import * as THREE from "three";
import { useConfigStore, useTangleStore } from "./store";
import { useRenderTangle } from "./useRenderTangle";
import { getTangleDistances, getSinusoidalPosition } from "./utils";
import { CanvasElement } from "./enums";
import {
    EMITTER_SPEED_MULTIPLIER,
    EMITTER_DEPTH,
    EMITTER_HEIGHT,
    EMITTER_WIDTH,
    MAX_SINUSOIDAL_AMPLITUDE,
    SINUSOIDAL_AMPLITUDE_ACCUMULATOR,
    HALF_WAVE_PERIOD_SECONDS,
    INITIAL_SINUSOIDAL_AMPLITUDE,
} from "./constants";

interface EmitterProps {
    readonly setRunListeners: Dispatch<SetStateAction<boolean>>;
    readonly emitterRef: RefObject<THREE.Mesh>;
}

const Emitter: React.FC<EmitterProps> = ({ setRunListeners, emitterRef }: EmitterProps) => {
    const setZoom = useTangleStore((s) => s.setZoom);
    const get = useThree((state) => state.get);
    const currentZoom = useThree((state) => state.camera.zoom);
    const groupRef = useRef<THREE.Group>(null);
    const camera = get().camera;

    const { xTangleDistance, yTangleDistance } = getTangleDistances();
    const isPlaying = useConfigStore((state) => state.isPlaying);
    const setIsPlaying = useConfigStore((state) => state.setIsPlaying);

    const animationTime = useRef<number>(0);
    const currentAmplitude = useRef<number>(INITIAL_SINUSOIDAL_AMPLITUDE);

    const previousRealTime = useRef<number>(0);
    const previousPeakTime = useRef<number>(0);

    useEffect(() => {
        setZoom(currentZoom);
    }, [currentZoom]);

    useEffect(() => {
        if (emitterRef?.current) {
            setIsPlaying(true);
            setRunListeners(true);
        }
    }, [emitterRef]);

    useFrame(() => {
        if (camera && groupRef.current) {
            camera.position.x = groupRef.current.position.x;
        }
    });

    function updateAnimationTime(realTimeDelta: number): void {
        animationTime.current += realTimeDelta;
    }

    function checkAndHandleNewPeak(): void {
        const currentHalfWaveCount = Math.floor(animationTime.current / HALF_WAVE_PERIOD_SECONDS);
        const lastPeakHalfWaveCount = Math.floor(previousPeakTime.current / HALF_WAVE_PERIOD_SECONDS);

        if (currentHalfWaveCount > lastPeakHalfWaveCount) {
            currentAmplitude.current = Math.min(currentAmplitude.current + SINUSOIDAL_AMPLITUDE_ACCUMULATOR, MAX_SINUSOIDAL_AMPLITUDE);
            previousPeakTime.current = animationTime.current;
        }
    }

    /**
     * Emitter shift
     */
    useFrame(({ clock }, delta) => {
        const currentRealTime = clock.getElapsedTime();
        const realTimeDelta = currentRealTime - previousRealTime.current;
        previousRealTime.current = currentRealTime;

        if (isPlaying) {
            updateAnimationTime(realTimeDelta);
            checkAndHandleNewPeak();

            if (groupRef.current) {
                const { x } = groupRef.current.position;
                const newXPos = x + delta * EMITTER_SPEED_MULTIPLIER;
                groupRef.current.position.x = newXPos;
            }

            if (emitterRef.current) {
                const newYPos = getSinusoidalPosition(animationTime.current, currentAmplitude.current);
                emitterRef.current.position.y = newYPos;
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
                <meshPhongMaterial transparent opacity={0} wireframe={true} attach="material" />
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
