/* eslint-disable react/no-unknown-property */
import { useFrame, useThree } from "@react-three/fiber";
import React, { useState, useRef, RefObject, Dispatch, SetStateAction, useEffect } from "react";
import * as THREE from "three";
import { useConfigStore, useTangleStore } from "./store";
import { useRenderTangle } from "./useRenderTangle";
import { AMPLITUDE_ACCUMULATOR, HALF_WAVE_PERIOD_SECONDS, EMITTER_SPEED_MULTIPLIER, EMITTER_DEPTH, EMITTER_HEIGHT, EMITTER_WIDTH, MAX_AMPLITUDE } from './constants';
import { getTangleDistances, getNewSinusoidalPosition } from './utils';
import { CanvasElement } from './enums';

interface EmitterProps {
    readonly setRunListeners: Dispatch<SetStateAction<boolean>>;
    readonly emitterRef: RefObject<THREE.Mesh>;
}

const Emitter: React.FC<EmitterProps> = ({
    setRunListeners,
    emitterRef
}: EmitterProps) => {
    const setZoom = useTangleStore(s => s.setZoom);
    const get = useThree(state => state.get);
    const currentZoom = useThree(state => state.camera.zoom);

    const groupRef = useRef<THREE.Group>(null);
    const camera = get().camera;

    const { xTangleDistance, yTangleDistance } = getTangleDistances()
    const isPlaying = useConfigStore(state => state.isPlaying);

    const [animationTime, setAnimationTime] = useState<number>(0)
    const [currentAmplitude, setCurrentAmplitude] = useState<number>(AMPLITUDE_ACCUMULATOR);

    const previousRealTime = useRef<number>(0);
    const previousPeakTime = useRef<number>(0);

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

    function updateAnimationTime(realTimeDelta: number): void {
        setAnimationTime(prev => prev + realTimeDelta);
    }

    function checkAndHandleNewPeak(): void {
        const currentHalfWaveCount = Math.floor(animationTime / HALF_WAVE_PERIOD_SECONDS);
        const lastPeakHalfWaveCount = Math.floor(previousPeakTime.current / HALF_WAVE_PERIOD_SECONDS);

        if (currentHalfWaveCount > lastPeakHalfWaveCount) {
            setCurrentAmplitude(prev => Math.min(prev + AMPLITUDE_ACCUMULATOR, MAX_AMPLITUDE));
            previousPeakTime.current = animationTime;
        }
    }

    /**
     * Emitter shift
     */
    useFrame(({ clock }, delta) => {

        const currentRealTime = clock.getElapsedTime();
        const realTimeDelta = currentRealTime - previousRealTime.current;
        previousRealTime.current = currentRealTime;

        if (groupRef.current) {
        const newPos = delta * EMITTER_SPEED_MULTIPLIER;
        groupRef.current.position.x += newPos;

        if (isPlaying) {
            updateAnimationTime(realTimeDelta);
            checkAndHandleNewPeak();

            if (emitterRef.current) {
                const { x } = emitterRef.current.position;

                const newXPos = x + (delta * EMITTER_SPEED_MULTIPLIER);
                const newYPos = getNewSinusoidalPosition(animationTime, currentAmplitude);

                emitterRef.current.position.y = newYPos;
                emitterRef.current.position.x = newXPos;
            }
        }
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
