import { ISinusoidalPositionParams, IThreeDimensionalPosition } from "./interfaces";
import { getEmitterPositions, getTangleDistances, getBlockPositionGenerator } from "./utils";

const generateBlockTargetPosition = getBlockPositionGenerator();

export function getBlockTargetPosition(
    initPosition: IThreeDimensionalPosition,
    bps: number,
    tiltDegress: number,
): IThreeDimensionalPosition {
    return generateBlockTargetPosition(bps, initPosition, tiltDegress);
}

export function getBlockInitPosition({
    currentAnimationTime,
    periods,
    periodsSum,
    sinusoidAmplitudes,
}: ISinusoidalPositionParams): IThreeDimensionalPosition {
    const { xTangleDistance } = getTangleDistances();
    const { x: xEmitterPos, y, z } = getEmitterPositions({ currentAnimationTime, periods, periodsSum, sinusoidAmplitudes });
    const x = xEmitterPos + xTangleDistance / 2;

    return { x, y, z };
}
