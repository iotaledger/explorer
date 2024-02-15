import { EMITTER_WIDTH, EMITTER_X_POSITION_MULTIPLIER } from "./constants";
import { getEmitterPosition, getGenerateDynamicYZPosition, getTangleDistances, randomIntFromInterval } from "./utils";

const generateYZPositions = getGenerateDynamicYZPosition();

interface IPos {
    x: number;
    y: number;
    z: number;
}
export function getBlockTargetPosition(initPosition: IPos, bps: number): IPos {
    const { y, z } = generateYZPositions(bps, initPosition);

    const emitterMinX = initPosition.x - EMITTER_WIDTH / 2;
    const emitterMaxX = initPosition.x + EMITTER_WIDTH / 2;

    const minX = emitterMinX - (emitterMaxX - emitterMinX) * EMITTER_X_POSITION_MULTIPLIER;
    const maxX = emitterMaxX + (emitterMaxX - emitterMinX) * EMITTER_X_POSITION_MULTIPLIER;

    const x = randomIntFromInterval(minX, maxX);

    return { x, y, z };
}

export function getBlockInitPosition(currentAnimationTime: number): IPos {
    const { xTangleDistance } = getTangleDistances();
    const { x: xEmitterPos, y, z } = getEmitterPosition(currentAnimationTime);
    const x = xEmitterPos + xTangleDistance / 2;

    return { x, y, z };
}
