import { SPRAY_DISTANCE } from "./constants";
import { ISinusoidalPositionParams } from "./interfaces";
import { getEmitterPositions, getGenerateDynamicYZPosition, getTangleDistances } from "./utils";

const generateYZPositions = getGenerateDynamicYZPosition();

interface IPos {
    x: number;
    y: number;
    z: number;
}
export function getBlockTargetPosition(initPosition: IPos, bps: number, tiltDegress: number): IPos {
    const { y, z } = generateYZPositions(bps, initPosition, tiltDegress);
    return { x: initPosition.x - SPRAY_DISTANCE, y, z };
}

export function getBlockInitPosition({ currentAnimationTime, periods, periodsSum, sinusoidAmplitudes }: ISinusoidalPositionParams): IPos {
    const { xTangleDistance } = getTangleDistances();
    const { x: xEmitterPos, y, z } = getEmitterPositions({ currentAnimationTime, periods, periodsSum, sinusoidAmplitudes });
    const x = xEmitterPos + xTangleDistance / 2;

    return { x, y, z };
}
