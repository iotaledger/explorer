import { EMITTER_WIDTH, EMITTER_X_POSITION_MULTIPLIER } from "./constants";
import { ISinusoidalPositionParams } from "./interfaces";
import { getEmitterPositions, getGenerateDynamicYZPosition, getTangleDistances, randomIntFromInterval } from "./utils";

const generateYZPositions = getGenerateDynamicYZPosition();

interface IPos {
    x: number;
    y: number;
    z: number;
}
export function getBlockTargetPosition(initPosition: IPos, bps: number, tiltDegress: number): IPos {
    const { y, z } = generateYZPositions(bps, initPosition, tiltDegress);

    const emitterMinX = initPosition.x - EMITTER_WIDTH / 2;
    const emitterMaxX = initPosition.x + EMITTER_WIDTH / 2;

    const minX = emitterMinX - (emitterMaxX - emitterMinX) * EMITTER_X_POSITION_MULTIPLIER;
    const maxX = emitterMaxX + (emitterMaxX - emitterMinX) * EMITTER_X_POSITION_MULTIPLIER;

    const x = randomIntFromInterval(minX, maxX);

    return { x, y, z };
}

export function getBlockInitPosition({ currentAnimationTime, periods, periodsSum, sinusoidAmplitudes }: ISinusoidalPositionParams): IPos {
    const { xTangleDistance } = getTangleDistances();
    const { x: xEmitterPos, y, z } = getEmitterPositions({ currentAnimationTime, periods, periodsSum, sinusoidAmplitudes });
    const x = xEmitterPos + xTangleDistance / 2;

    return { x, y, z };
}
