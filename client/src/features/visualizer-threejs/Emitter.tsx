/* eslint-disable react/no-unknown-property */
import { useFrame, useThree } from "@react-three/fiber";
import React, { RefObject, Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useBorderPositions } from "./hooks/useBorderPositions";
import { useConfigStore, useTangleStore } from "./store";
import { useRenderTangle } from "./useRenderTangle";
import { EMITTER_DEPTH, EMITTER_HEIGHT, EMITTER_WIDTH, MAX_AMPLITUDE, AMPLITUDE_ACCUMULATOR, HALF_WAVE_PERIOD_SECONDS } from './constants';
import { getNewSinusoidalPosition } from './utils';

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
    const { halfScreenWidth } = useBorderPositions();
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
        const camera = get().camera;
        const emitterObj = get().scene.getObjectByName("emitter");
        if (camera && emitterObj) {
            const EMITTER_PADDING_RIGHT = 150;
            camera.position.x = emitterObj.position.x - halfScreenWidth + EMITTER_PADDING_RIGHT;
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
            const DELTA_MULTIPLIER = 80; // depends on this param we can manage speed of emitter

        const currentRealTime = clock.getElapsedTime();
        const realTimeDelta = currentRealTime - previousRealTime.current;
        previousRealTime.current = currentRealTime;

        if (isPlaying) {
            updateAnimationTime(realTimeDelta);
            checkAndHandleNewPeak();

            if (emitterRef.current) {
                const { x } = emitterRef.current.position;

                const newXPos = x + (delta * DELTA_MULTIPLIER);
                const newYPos = getNewSinusoidalPosition(animationTime, currentAmplitude);

                emitterRef.current.position.y = newYPos;
                emitterRef.current.position.x = newXPos;
            }
        }
    });

    // The Tangle rendering hook
    useRenderTangle();

    return (
        <mesh
            ref={emitterRef}
            name="emitter"
            position={[0, 0, 0]}
        >
            <boxGeometry args={[EMITTER_WIDTH, EMITTER_HEIGHT, EMITTER_DEPTH]} />
            <meshPhongMaterial transparent={true} opacity={0.6} />
        </mesh>
    );
};
export default Emitter;
