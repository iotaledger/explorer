import { Vector3 } from "three";
import {
    BLOCK_STEP_PX,
    MIN_BLOCKS_PER_SECOND,
    MAX_BLOCKS_PER_SECOND,
    MIN_TANGLE_RADIUS,
    MAX_TANGLE_RADIUS,
    MIN_BLOCK_NEAR_RADIUS,
    MAX_PREV_POINTS,
    MAX_POINT_RETRIES,
    MAX_BLOCK_INSTANCES,
    EMITTER_SPEED_MULTIPLIER,
    CAMERA_X_AXIS_MOVEMENT,
    CAMERA_Y_AXIS_MOVEMENT,
    CAMERA_X_OFFSET,
    CAMERA_Y_OFFSET,
    NUMBER_OF_RANDOM_PERIODS,
    MIN_SINUSOID_PERIOD,
    MAX_SINUSOID_PERIOD,
    NUMBER_OF_RANDOM_AMPLITUDES,
    MIN_SINUSOID_AMPLITUDE,
    MAX_SINUSOID_AMPLITUDE,
} from "./constants";
import type { ICameraAngles, ISinusoidalPositionParams, IThreeDimensionalPosition } from "./interfaces";

/**
 * Generates a random number within a specified range.
 *
 * @param {number} min - The minimum value of the range (inclusive).
 * @param {number} max - The maximum value of the range (exclusive).
 * @throws {Error} If min is greater than or equal to max.
 * @returns {number} A random number within the specified range.
 */
function randomNumberFromInterval(min: number, max: number): number {
    if (min >= max) {
        throw new Error("Min value must be less than Max value.");
    }
    // Generate a random number between 0 (inclusive) and 1 (exclusive)
    const randomFraction = Math.random();
    // Scale the random fraction to fit within the desired range
    return min + randomFraction * (max - min);
}

export const randomIntFromInterval = (min: number, max: number) => {
    const randomFraction = Math.random();
    const range = max - min + 1;
    const randomInRange = Math.floor(randomFraction * range);
    return randomInRange + min;
};

/**
 * Measure how much seconds passed from the start of the timer.
 * @param msCounter The interval
 * @returns - function that returns seconds from the start of the timer.
 */
export const timer = (msCounter: number = 1000) => {
    const start = new Date();

    return () => {
        const currentTime = new Date();
        const diff = currentTime.getTime() - start.getTime();

        return Math.floor(diff / msCounter);
    };
};

interface IBlockTanglePosition {
    y: number;
    z: number;
}

/**
 * Calculates the distance between two points.
 * @returns the distance between two points.
 */
function distanceBetweenPoints(point1: IBlockTanglePosition, point2: IBlockTanglePosition): number {
    const { z: z1, y: y1 } = point1;
    const { z: z2, y: y2 } = point2;
    return Math.sqrt((y2 - y1) ** 2 + (z2 - z1) ** 2);
}

/**
 * Calculates the radius of the circle based on the blocks per second.
 * @returns the radius of the circle.
 */
function getLinearRadius(bps: number): number {
    if (bps < MIN_BLOCKS_PER_SECOND) bps = MIN_BLOCKS_PER_SECOND;
    if (bps > MAX_BLOCKS_PER_SECOND) bps = MAX_BLOCKS_PER_SECOND;

    // Linear interpolation formula to find the radius
    const radius =
        MIN_TANGLE_RADIUS +
        ((MAX_TANGLE_RADIUS - MIN_TANGLE_RADIUS) * (bps - MIN_BLOCKS_PER_SECOND)) / (MAX_BLOCKS_PER_SECOND - MIN_BLOCKS_PER_SECOND);
    return radius;
}

/**
 * Generates a random point on a circle.
 * @returns the random point on a circle.
 */
function getDynamicRandomYZPoints(
    bps: number,
    initialPosition: IThreeDimensionalPosition = {
        x: 0,
        y: 0,
        z: 0,
    },
): IBlockTanglePosition {
    const theta = Math.random() * (2 * Math.PI);

    const maxRadius = getLinearRadius(bps);
    const randomFactor = Math.random();
    const radius = randomFactor * maxRadius;

    const y = radius * Math.cos(theta) + initialPosition.y;
    const z = radius * Math.sin(theta) + initialPosition.z;

    return { y, z };
}

/**
 * Checks if the point is far enough from the prevPoints.
 * @returns true if the point is far enough from the prevPoints.
 */
function pointPassesAllChecks(point: IBlockTanglePosition, prevPoints: IBlockTanglePosition[]): boolean {
    if (prevPoints.length === 0) {
        return true;
    }

    return prevPoints.some((prevPoint) => distanceBetweenPoints(point, prevPoint) > MIN_BLOCK_NEAR_RADIUS);
}

/**
 * Retries to generate a point until it passes all the checks.
 * @returns the point that passes all the checks.
 */
function generateAValidRandomPoint(
    bps: number,
    initialPosition: IThreeDimensionalPosition,
    prevPoints: IBlockTanglePosition[],
): IBlockTanglePosition {
    let trialPoint: IBlockTanglePosition;
    let passAllChecks = false;
    let retries = 0;

    do {
        trialPoint = getDynamicRandomYZPoints(bps, initialPosition);
        passAllChecks = pointPassesAllChecks(trialPoint, prevPoints);
        retries++;
    } while (!passAllChecks && retries < MAX_POINT_RETRIES);

    prevPoints.push(trialPoint);
    if (prevPoints.length > MAX_PREV_POINTS) {
        prevPoints.shift();
    }

    return trialPoint;
}

/**
 * Gets a function to generate a random point on a circle.
 * @returns the function to generate the random point on a circle.
 */
export function getGenerateDynamicYZPosition(): typeof getDynamicRandomYZPoints {
    const prevPoints: IBlockTanglePosition[] = [];

    return (bps: number, initialPosition: IThreeDimensionalPosition = { x: 0, y: 0, z: 0 }): IBlockTanglePosition => {
        const validPoint = generateAValidRandomPoint(bps, initialPosition, prevPoints);

        const randomYNumber = randomNumberFromInterval(0, BLOCK_STEP_PX / 20);
        const randomZNumber = randomNumberFromInterval(0, BLOCK_STEP_PX / 20);

        validPoint.y += randomYNumber;
        validPoint.z += randomZNumber;

        return validPoint;
    };
}

/**
 * Calculate the tangles distances
 * @returns The axis distances
 */
export function getTangleDistances(): {
    xTangleDistance: number;
    yTangleDistance: number;
} {
    /* We assume MAX BPS to get the max possible Y */
    const MAX_TANGLE_DISTANCE_SECONDS = MAX_BLOCK_INSTANCES / MIN_BLOCKS_PER_SECOND;

    const MAX_BLOCK_DISTANCE = EMITTER_SPEED_MULTIPLIER * MAX_TANGLE_DISTANCE_SECONDS;

    const maxXDistance = MAX_BLOCK_DISTANCE;

    /* Max Y Distance will be multiplied by 2 to position blocks in the negative and positive Y axis  */
    const maxYDistance = MAX_TANGLE_RADIUS * 2 + MAX_SINUSOID_AMPLITUDE * 2;

    /* TODO: add sinusoidal distances */

    return {
        xTangleDistance: maxXDistance,
        yTangleDistance: maxYDistance,
    };
}

/**
 * Calculates de angles for the camera
 * @returns an object with minimum and maximum angles
 */
export function getCameraAngles(): ICameraAngles {
    const xAngle = Math.PI * CAMERA_X_AXIS_MOVEMENT;
    const yAngle = Math.PI * CAMERA_Y_AXIS_MOVEMENT;

    const startingXAngle = Math.PI * CAMERA_X_OFFSET;
    const startingYAngle = Math.PI * CAMERA_Y_OFFSET;

    // Divided by the two directions, positive and negative
    const X_MOVEMENT = xAngle / 2;
    const Y_MOVEMENT = yAngle / 2;

    const MIN_HORIZONTAL_ANGLE = startingXAngle - X_MOVEMENT;
    const MIN_VERTICAL_ANGLE = startingYAngle - Y_MOVEMENT;

    const MAX_HORIZONTAL_ANGLE = startingXAngle + X_MOVEMENT;
    const MAX_VENTICAL_ANGLE = startingYAngle + Y_MOVEMENT;

    return {
        minAzimuthAngle: MIN_HORIZONTAL_ANGLE,
        minPolarAngle: MIN_VERTICAL_ANGLE,
        maxPolarAngle: MAX_VENTICAL_ANGLE,
        maxAzimuthAngle: MAX_HORIZONTAL_ANGLE,
    };
}

/**
 * Calculates the sinusoidal position for the emitter based on the current animation time,
 * considering random periods.
 * @returns the sinusoidal position
 */
export function calculateSinusoidalAmplitude({
    currentAnimationTime,
    periods,
    periodsSum,
    sinusoidAmplitudes,
}: ISinusoidalPositionParams): number {
    const elapsedTime = currentAnimationTime % periodsSum;
    const { index, period, accumulatedTime } = getCurrentPeriodValues(currentAnimationTime, periods, periodsSum);

    const startTimeOfCurrentPeriod = accumulatedTime - period;
    const timeInCurrentPeriod = elapsedTime - startTimeOfCurrentPeriod;
    const currentAmplitude = sinusoidAmplitudes[index];

    const yPosition = currentAmplitude * Math.sin((2 * Math.PI * timeInCurrentPeriod) / period);

    return yPosition;
}

/**
 * Calculates the emitter position based on the current animation time.
 * @returns the emitter position
 */
export function calculateEmitterPositionX(currentAnimationTime: number): number {
    return currentAnimationTime * EMITTER_SPEED_MULTIPLIER;
}

/**
 * Calculates the emitter position based on the current animation time.
 * @returns the emitter X,Y,Z positions
 */
export function getEmitterPositions({
    currentAnimationTime,
    periods,
    periodsSum,
    sinusoidAmplitudes,
}: ISinusoidalPositionParams): IThreeDimensionalPosition {
    const x = calculateEmitterPositionX(currentAnimationTime);
    const y = calculateSinusoidalAmplitude({ currentAnimationTime, periods, periodsSum, sinusoidAmplitudes });
    return { x, y, z: 0 };
}

/**
 * Converts a position object to a Vector3 object.
 * @param position - The position object to convert.
 * @returns A Vector3 object representing the position.
 */
export function positionToVector(position: IThreeDimensionalPosition) {
    return new Vector3(position.x, position.y, position.z);
}

export function generateRandomPeriods(): { periods: number[]; sum: number } {
    let sum = 0;
    const periods = Array.from({ length: NUMBER_OF_RANDOM_PERIODS }, () => {
        const period = Number(randomNumberFromInterval(MIN_SINUSOID_PERIOD, MAX_SINUSOID_PERIOD).toFixed(4));
        sum += period;
        return period;
    });
    return { periods, sum };
}

type PeriodResult = {
    period: number;
    accumulatedTime: number;
    index: number;
};

function getCurrentPeriodValues(animationTime: number, periods: number[], totalSum: number): PeriodResult {
    const effectiveTime = animationTime % totalSum;

    let accumulatedTime = 0;

    for (let i = 0; i < periods.length; i++) {
        const period = periods[i];
        accumulatedTime += period;
        if (effectiveTime < accumulatedTime) {
            return { index: i, period, accumulatedTime };
        }
    }

    return { index: 0, period: periods[0], accumulatedTime: 0 };
}

function getNextAmplitudeWithVariation(currentAmplitude: number = 0): number {
    const variation = (2 * MIN_SINUSOID_AMPLITUDE) / 3;
    const randomAmplitudeVariation = randomNumberFromInterval(-variation, variation);

    let newAmplitude = currentAmplitude + randomAmplitudeVariation;

    if (newAmplitude > MAX_SINUSOID_AMPLITUDE) {
        newAmplitude = currentAmplitude - Math.abs(randomAmplitudeVariation);
    } else if (newAmplitude < MIN_SINUSOID_AMPLITUDE) {
        newAmplitude = currentAmplitude + Math.abs(randomAmplitudeVariation);
    }

    newAmplitude = Math.max(MIN_SINUSOID_AMPLITUDE, Math.min(newAmplitude, MAX_SINUSOID_AMPLITUDE));

    return newAmplitude;
}

export function generateRandomAmplitudes(): number[] {
    const amplitudes: number[] = [];
    let currentAmplitude: number = 0;
    for (let i = 0; i < NUMBER_OF_RANDOM_AMPLITUDES; i++) {
        currentAmplitude = getNextAmplitudeWithVariation(currentAmplitude);
        amplitudes.push(currentAmplitude);
    }
    return amplitudes;
}
